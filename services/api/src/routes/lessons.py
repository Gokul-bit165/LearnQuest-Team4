"""
Lesson endpoints for Learn Quest.
Handles lesson completion, answer checking, and streak tracking.
"""

import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from bson import ObjectId

from ..auth import get_current_user
from ..models.user import User
from ..models.course import Card, CardType
from ..database import get_collection

router = APIRouter(prefix="/api/lessons", tags=["lessons"])

# Request/Response Models
class AnswerRequest(BaseModel):
    card_id: str
    answer: Any  # Can be string, int, or dict depending on card type

class AnswerResponse(BaseModel):
    correct: bool
    explanation: Optional[str] = None
    xp_earned: int = 0

class LessonCompleteResponse(BaseModel):
    success: bool
    xp_earned: int
    streak_count: int
    level_up: bool = False
    new_level: Optional[int] = None

@router.post("/check-answer", response_model=AnswerResponse)
async def check_answer(
    request: AnswerRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Check if a user's answer to a card is correct.
    """
    try:
        # Find the card in the database
        courses_collection = get_collection("courses")
        
        # Search through all courses to find the card
        card_data = None
        topic_id = None
        
        courses = courses_collection.find({})
        for course in courses:
            for module in course.get("modules", []):
                for topic in module.get("topics", []):
                    for card in topic.get("cards", []):
                        if card.get("card_id") == request.card_id:
                            card_data = card
                            topic_id = topic.get("topic_id")
                            break
                    if card_data:
                        break
                if card_data:
                    break
            if card_data:
                break
        
        if not card_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Card not found"
            )
        
        # Check answer based on card type
        card_type = card_data.get("type")
        correct = False
        explanation = card_data.get("explanation")
        xp_reward = card_data.get("xp_reward", 10)
        
        if card_type == CardType.MCQ:
            correct_choice_index = card_data.get("correct_choice_index")
            correct = request.answer == correct_choice_index
            
        elif card_type == CardType.CODE:
            # For code questions, we'll implement basic checking
            # In a real implementation, you'd run the code against test cases
            correct = True  # Simplified for now
            
        elif card_type == CardType.FILL_IN_BLANK:
            correct_answers = card_data.get("correct_answers", [])
            user_answers = request.answer if isinstance(request.answer, list) else [request.answer]
            correct = user_answers == correct_answers
            
        elif card_type == CardType.THEORY:
            # Theory cards are always "correct" - just for reading
            correct = True
            
        # Award XP if correct
        xp_earned = xp_reward if correct else 0
        
        if correct and xp_earned > 0:
            # Update user's XP
            users_collection = get_collection("users")
            users_collection.update_one(
                {"_id": ObjectId(current_user.id)},
                {"$inc": {"xp": xp_earned}}
            )
        
        return AnswerResponse(
            correct=correct,
            explanation=explanation if correct else None,
            xp_earned=xp_earned
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Answer checking failed: {str(e)}"
        )

@router.post("/complete/{topic_id}", response_model=LessonCompleteResponse)
async def complete_lesson(
    topic_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Complete a lesson (topic) and award bonus XP and update streak.
    """
    try:
        # Find the topic to get its XP reward
        courses_collection = get_collection("courses")
        topic_data = None
        
        courses = courses_collection.find({})
        for course in courses:
            for module in course.get("modules", []):
                for topic in module.get("topics", []):
                    if topic.get("topic_id") == topic_id:
                        topic_data = topic
                        break
                if topic_data:
                    break
            if topic_data:
                break
        
        if not topic_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Topic not found"
            )
        
        topic_xp_reward = topic_data.get("xp_reward", 50)
        
        # Get current user data
        users_collection = get_collection("users")
        user_data = users_collection.find_one({"_id": ObjectId(current_user.id)})
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Calculate streak
        today = datetime.utcnow().date()
        last_active = user_data.get("last_active_date")
        current_streak = user_data.get("streak_count", 0)
        
        if last_active:
            last_active_date = last_active.date() if isinstance(last_active, datetime) else last_active
            
            if last_active_date == today:
                # Already active today, no streak change
                pass
            elif last_active_date == today - timedelta(days=1):
                # Consecutive day, increment streak
                current_streak += 1
            else:
                # Streak broken, reset to 1
                current_streak = 1
        else:
            # First time, start streak
            current_streak = 1
        
        # Award XP and update user
        new_xp = user_data.get("xp", 0) + topic_xp_reward
        new_level = calculate_level(new_xp)
        level_up = new_level > user_data.get("level", 1)
        
        update_data = {
            "xp": new_xp,
            "level": new_level,
            "last_active_date": datetime.utcnow(),
            "streak_count": current_streak
        }
        
        users_collection.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": update_data}
        )
        
        return LessonCompleteResponse(
            success=True,
            xp_earned=topic_xp_reward,
            streak_count=current_streak,
            level_up=level_up,
            new_level=new_level if level_up else None
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lesson completion failed: {str(e)}"
        )

def calculate_level(xp: int) -> int:
    """Calculate user level based on XP (1000 XP per level)"""
    return max(1, (xp // 1000) + 1)
