from typing import List, Optional, Dict, Any, Union
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timedelta
import re
import os
import httpx
from ..database import get_collection
from ..models.user import User
from ..models.course import CheckAnswerRequest, CheckAnswerResponse, CompleteTopicResponse, Topic
from ..auth import get_current_user

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


@router.get("/{topic_id}", response_model=Topic)
async def get_topic(
    topic_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific topic by its ID with all its cards"""
    courses = get_collection("courses")
    
    # Find the topic using MongoDB aggregation to extract it from nested structure
    pipeline = [
        # Unwind modules array
        {"$unwind": "$modules"},
        # Unwind topics array within each module
        {"$unwind": "$modules.topics"},
        # Match the specific topic_id
        {"$match": {"modules.topics.topic_id": topic_id}},
        # Project only the topic data
        {"$project": {
            "topic_id": "$modules.topics.topic_id",
            "title": "$modules.topics.title",
            "cards": "$modules.topics.cards",
            "xp_reward": "$modules.topics.xp_reward"
        }}
    ]
    
    result = list(courses.aggregate(pipeline))
    
    if not result:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Return the first (and should be only) result
    topic_data = result[0]
    
    return Topic(
        topic_id=topic_data["topic_id"],
        title=topic_data["title"],
        cards=topic_data.get("cards", []),
        xp_reward=topic_data.get("xp_reward", 50)
    )


@router.post("/check-answer", response_model=CheckAnswerResponse)
async def check_answer(
    request: CheckAnswerRequest, 
    current_user: User = Depends(get_current_user)
):
    """Check if a user's answer to a card is correct and award XP"""
    courses = get_collection("courses")
    users = get_collection("users")
    
    # Find the card in the database
    course_doc = courses.find_one({
        "modules.topics.cards.card_id": request.card_id
    })
    
    if not course_doc:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Find the specific card
    card = None
    for module in course_doc["modules"]:
        for topic in module["topics"]:
            for c in topic["cards"]:
                if c["card_id"] == request.card_id:
                    card = c
                    break
            if card:
                break
        if card:
            break
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Check the answer based on card type
    correct = False
    correct_answer = None
    
    if card["type"] == "theory":
        # Theory cards are always correct (just reading)
        correct = True
        correct_answer = "Read and understood"
        
    elif card["type"] == "mcq":
        # Check if selected choice index matches correct choice
        user_index: Optional[int] = None
        if isinstance(request.user_answer, int):
            user_index = request.user_answer
        elif isinstance(request.user_answer, str):
            try:
                user_index = int(request.user_answer)
            except ValueError:
                user_index = None
        if user_index is not None:
            if "correct_choice_index" in card and card.get("correct_choice_index") is not None:
                correct_index = int(card.get("correct_choice_index", 0))
                # Primary check: index match
                correct = user_index == correct_index
                # Fallback: compare chosen text to expected text if index types mismatch upstream
                if not correct and card.get("choices"):
                    try:
                        chosen_text = str(card["choices"][user_index]).strip()
                        expected_text = str(card["choices"][correct_index]).strip()
                        correct = chosen_text == expected_text
                    except Exception:
                        pass
            else:
                # If authoring data lacks correct index, do not block user
                correct = True
        correct_answer = (
            card.get("choices", [])[card.get("correct_choice_index", 0)]
            if card.get("choices") and card.get("correct_choice_index") is not None
            else None
        )
        
    elif card["type"] == "code":
        # Enhanced code evaluation using Judge0
        if isinstance(request.user_answer, str):
            user_code = request.user_answer.strip()
            test_cases = card.get("test_cases", [])
            
            if not test_cases:
                # Basic validation if no test cases
                correct = len(user_code) > 10
        correct_answer = "Code solution"
            else:
                # Execute code against test cases using Judge0
                judge0_url = os.getenv("JUDGE0_URL", "http://judge0:2358")
                language_id = 71  # Python 3.8+
                passed_count = 0
                total_tests = len(test_cases)
                
                try:
                    async with httpx.AsyncClient(timeout=30) as client:
                        for tc in test_cases:
                            payload = {
                                "language_id": language_id,
                                "source_code": user_code,
                                "stdin": tc.get("input", "")
                            }
                            
                            resp = await client.post(
                                f"{judge0_url}/submissions/?base64_encoded=false&wait=true",
                                json=payload
                            )
                            resp.raise_for_status()
                            data = resp.json()
                            
                            stdout = (data.get("stdout") or "").rstrip("\n")
                            stderr = data.get("stderr")
                            compile_output = data.get("compile_output")
                            expected = (tc.get("expected_output", "") or "").rstrip("\n")
                            
                            # Check if test passed
                            passed = (stderr is None) and (compile_output is None) and (stdout == expected)
                            if passed:
                                passed_count += 1
                        
                        # Consider correct if all test cases pass
                        correct = passed_count == total_tests
                        correct_answer = f"Passed {passed_count}/{total_tests} test cases"
                        
                except Exception as e:
                    # Fallback to basic validation if Judge0 fails
                    correct = len(user_code) > 10
                    correct_answer = "Code solution (Judge0 unavailable)"
        else:
            correct = False
            correct_answer = "Invalid code format"
        
    elif card["type"] == "fill-in-blank":
        # Check if all blanks are filled correctly
        if isinstance(request.user_answer, list) and card.get("correct_answers"):
            correct = request.user_answer == card["correct_answers"]
        correct_answer = card.get("correct_answers", [])
    
    # Award XP if correct and not a dry-run (mode == 'run' means no XP, just feedback)
    mode = getattr(request, 'mode', None)
    if correct and mode != 'run':
        xp_reward = card.get("xp_reward", 10)
        users.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$inc": {"xp": xp_reward}}
        )
    else:
        xp_reward = 0
    
    return CheckAnswerResponse(
        correct=correct,
        xp_reward=xp_reward,
        explanation=card.get("explanation"),
        correct_answer=correct_answer
    )


@router.post("/complete/{topic_id}", response_model=CompleteTopicResponse)
async def complete_topic(
    topic_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark a topic as complete and update user streak"""
    courses = get_collection("courses")
    users = get_collection("users")
    
    # Find the topic to get its XP reward
    course_doc = courses.find_one({
        "modules.topics.topic_id": topic_id
    })
    
    if not course_doc:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Find the specific topic
    topic = None
    for module in course_doc["modules"]:
        for t in module["topics"]:
            if t["topic_id"] == topic_id:
                topic = t
                break
        if topic:
            break
    
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Get current user data
    user_doc = users.find_one({"_id": ObjectId(current_user.id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate streak
    today = datetime.utcnow().date()
    last_active = user_doc.get("last_active_date")
    
    if last_active:
        last_active_date = last_active.date() if isinstance(last_active, datetime) else last_active
        days_diff = (today - last_active_date).days
        
        if days_diff == 1:
            # Consecutive day - increment streak
            new_streak = user_doc.get("streak_count", 0) + 1
        elif days_diff == 0:
            # Same day - keep current streak
            new_streak = user_doc.get("streak_count", 0)
        else:
            # Gap in days - reset streak
            new_streak = 1
    else:
        # First time - start streak
        new_streak = 1
    
    # Award topic completion XP
    topic_xp = topic.get("xp_reward", 50)
    
    # Update user
    users.update_one(
        {"_id": ObjectId(current_user.id)},
        {
            "$inc": {"xp": topic_xp},
            "$set": {
                "last_active_date": datetime.utcnow(),
                "streak_count": new_streak
            }
        }
    )
    
    return CompleteTopicResponse(
        success=True,
        xp_reward=topic_xp,
        streak_count=new_streak,
        message=f"Topic completed! +{topic_xp} XP"
    )


@router.get("/user-progress")
async def get_user_progress(current_user: User = Depends(get_current_user)):
    """Get user's learning progress and streak information"""
    users = get_collection("users")
    
    user_doc = users.find_one({"_id": ObjectId(current_user.id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "xp": user_doc.get("xp", 0),
        "level": user_doc.get("level", 1),
        "streak_count": user_doc.get("streak_count", 0),
        "last_active_date": user_doc.get("last_active_date"),
        "badges": user_doc.get("badges", [])
    }