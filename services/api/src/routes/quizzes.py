from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random
import uuid
from ..models.user import User
from ..auth import get_current_user
from ..database import get_collection

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])

class QuizAnswer(BaseModel):
    question_id: str
    answer: str

class SubmitQuizRequest(BaseModel):
    answers: List[QuizAnswer]

class StartQuizResponse(BaseModel):
    session_id: str
    question_order: List[str]
    end_time: str

class QuizSession(BaseModel):
    session_id: str
    user_id: str
    quiz_id: str
    question_order: List[str]
    start_time: datetime
    end_time: datetime
    answers: Dict[str, str] = {}
    submitted: bool = False

# In-memory storage for quiz sessions (in production, use Redis)
quiz_sessions: Dict[str, QuizSession] = {}

@router.post("/{quiz_id}/start", response_model=StartQuizResponse)
async def start_quiz(quiz_id: str, current_user: User = Depends(get_current_user)):
    """Start a quiz session and return randomized question order"""
    try:
        # Get quiz from database
        quizzes_collection = get_collection("quizzes")
        from bson import ObjectId
        quiz = quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
        
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found"
            )
        
        # Get questions for the quiz
        questions_collection = get_collection("questions")
        questions = list(questions_collection.find({"quiz_id": str(quiz["_id"])}))
        
        if not questions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No questions found for this quiz"
            )
        
        # Randomize question order
        question_ids = [str(q["_id"]) for q in questions]
        random.shuffle(question_ids)
        
        # Create quiz session
        session_id = str(uuid.uuid4())
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(seconds=quiz["duration_seconds"])
        
        session = QuizSession(
            session_id=session_id,
            user_id=current_user.id,
            quiz_id=quiz_id,
            question_order=question_ids,
            start_time=start_time,
            end_time=end_time
        )
        
        quiz_sessions[session_id] = session
        
        return {
            "session_id": session_id,
            "question_order": question_ids,
            "end_time": end_time.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error starting quiz: {str(e)}"
        )

@router.get("/{session_id}/questions")
async def get_quiz_questions(session_id: str, current_user: User = Depends(get_current_user)):
    """Get questions for a quiz session (without correct answers)"""
    try:
        # Check if session exists
        if session_id not in quiz_sessions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz session not found"
            )
        
        session = quiz_sessions[session_id]
        
        # Verify user owns this session
        if session.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Check if session has expired
        if datetime.utcnow() > session.end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quiz session has expired"
            )
        
        # Get questions from database
        questions_collection = get_collection("questions")
        questions = []
        
        for question_id in session.question_order:
            from bson import ObjectId
            question = questions_collection.find_one({"_id": ObjectId(question_id)})
            if question:
                # Remove correct answer for security
                question_data = {
                    "id": str(question["_id"]),
                    "type": question["type"],
                    "prompt": question["prompt"],
                    "choices": question.get("choices", []),
                    "difficulty": question.get("difficulty", "easy"),
                    "tags": question.get("tags", [])
                }
                questions.append(question_data)
        
        return {
            "session_id": session_id,
            "questions": questions,
            "end_time": session.end_time.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching questions: {str(e)}"
        )

@router.post("/{session_id}/submit")
async def submit_quiz(session_id: str, request: SubmitQuizRequest, current_user: User = Depends(get_current_user)):
    """Submit quiz answers and calculate score"""
    try:
        # Check if session exists
        if session_id not in quiz_sessions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz session not found"
            )
        
        session = quiz_sessions[session_id]
        
        # Verify user owns this session
        if session.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Check if already submitted
        if session.submitted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quiz already submitted"
            )
        
        # Get questions and calculate score
        questions_collection = get_collection("questions")
        correct_answers = 0
        total_questions = len(session.question_order)
        wrong_questions = []
        
        for answer in request.answers:
            from bson import ObjectId
            question = questions_collection.find_one({"_id": ObjectId(answer.question_id)})
            if question:
                # Check if answer is correct
                if question["type"] == "mcq":
                    correct_choice = question.get("correct_choice")
                    user_choice = int(answer.answer) if answer.answer.isdigit() else None
                    
                    if user_choice == correct_choice:
                        correct_answers += 1
                    else:
                        wrong_questions.append({
                            "q_id": answer.question_id,
                            "user_answer": answer.answer,
                            "correct_answer": str(correct_choice)
                        })
        
        # Calculate score and XP
        score = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0
        
        # Get quiz XP reward
        quizzes_collection = get_collection("quizzes")
        from bson import ObjectId
        quiz = quizzes_collection.find_one({"_id": ObjectId(session.quiz_id)})
        xp_earned = quiz.get("xp_reward", 0) if quiz else 0
        
        # Update user's XP and quiz history
        users_collection = get_collection("users")
        new_xp = current_user.xp + xp_earned
        new_level = (new_xp // 100) + 1  # Simple level calculation
        
        quiz_history_item = {
            "quiz_id": session.quiz_id,
            "score": score,
            "date": datetime.utcnow(),
            "wrong_questions": wrong_questions
        }
        
        from bson import ObjectId
        users_collection.update_one(
            {"_id": ObjectId(current_user.id)},
            {
                "$set": {"xp": new_xp, "level": new_level},
                "$push": {"quiz_history": quiz_history_item}
            }
        )
        
        # Mark session as submitted
        session.submitted = True
        session.answers = {answer.question_id: answer.answer for answer in request.answers}
        
        return {
            "score": score,
            "correct_answers": correct_answers,
            "total_questions": total_questions,
            "xp_earned": xp_earned,
            "new_total_xp": new_xp,
            "new_level": new_level,
            "wrong_questions": wrong_questions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting quiz: {str(e)}"
        )
