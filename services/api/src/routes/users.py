from fastapi import APIRouter, HTTPException, Depends, status
from ..models.user import User
from ..auth import get_current_user
from ..database import get_collection

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me")
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile and dashboard data"""
    try:
        # Get user's quiz history for dashboard
        quiz_history = current_user.quiz_history
        
        # Calculate recent performance
        recent_quizzes = quiz_history[-5:] if len(quiz_history) > 5 else quiz_history
        average_score = sum(q.score for q in recent_quizzes) / len(recent_quizzes) if recent_quizzes else 0
        
        # Get enrolled courses progress
        enrolled_courses = current_user.enrolled_courses
        
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "avatar_url": current_user.avatar_url,
            "xp": current_user.xp,
            "level": current_user.level,
            "badges": current_user.badges,
            "enrolled_courses": enrolled_courses,
            "quiz_history": quiz_history,
            "dashboard_stats": {
                "total_quizzes": len(quiz_history),
                "average_score": round(average_score, 1),
                "recent_quizzes": recent_quizzes
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user profile: {str(e)}"
        )

@router.get("/me/dashboard")
async def get_user_dashboard(current_user: User = Depends(get_current_user)):
    """Get user's dashboard data with progress and analytics"""
    try:
        # Get user's recent quiz performance
        quiz_history = current_user.quiz_history
        
        # Calculate performance metrics
        total_quizzes = len(quiz_history)
        if total_quizzes > 0:
            scores = [q.score for q in quiz_history]
            average_score = sum(scores) / len(scores)
            best_score = max(scores)
            recent_scores = scores[-5:] if len(scores) > 5 else scores
            recent_average = sum(recent_scores) / len(recent_scores) if recent_scores else 0
        else:
            average_score = 0
            best_score = 0
            recent_average = 0
        
        # Get enrolled courses with progress
        enrolled_courses = current_user.enrolled_courses
        
        return {
            "user": {
                "name": current_user.name,
                "xp": current_user.xp,
                "level": current_user.level,
                "badges": current_user.badges
            },
            "stats": {
                "total_quizzes": total_quizzes,
                "average_score": round(average_score, 1),
                "best_score": best_score,
                "recent_average": round(recent_average, 1),
                "total_xp": current_user.xp
            },
            "recent_activity": quiz_history[-10:] if len(quiz_history) > 10 else quiz_history,
            "enrolled_courses": enrolled_courses
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}"
        )
