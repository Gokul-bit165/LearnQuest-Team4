from fastapi import APIRouter, HTTPException, Depends, status, Query
from ..models.user import User
from ..auth import get_current_user
from ..database import get_collection
from datetime import datetime, timedelta
from typing import List, Optional
import bson

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
        from ..database import get_collection
        from datetime import datetime, timedelta
        import bson
        
        # Get fresh user data from database
        users_collection = get_collection("users")
        user_doc = users_collection.find_one({"_id": bson.ObjectId(current_user.id)})
        
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's recent quiz performance
        quiz_history = user_doc.get("quiz_history", [])
        completed_topics = user_doc.get("completed_topics", [])
        completed_modules = user_doc.get("completed_modules", [])
        enrolled_courses = user_doc.get("enrolled_courses", [])
        
        # Calculate performance metrics
        total_quizzes = len(quiz_history)
        if total_quizzes > 0:
            scores = [q.get("score", 0) for q in quiz_history]
            average_score = sum(scores) / len(scores)
            best_score = max(scores)
            recent_scores = scores[-5:] if len(scores) > 5 else scores
            recent_average = sum(recent_scores) / len(recent_scores) if recent_scores else 0
        else:
            average_score = 0
            best_score = 0
            recent_average = 0
        
        # Calculate streak and study time
        streak_count = user_doc.get("streak_count", 0)
        last_active = user_doc.get("last_active_date")
        
        # Calculate weekly progress (last 7 days)
        weekly_progress = []
        today = datetime.utcnow().date()
        for i in range(7):
            date = today - timedelta(days=i)
            # Count quizzes taken on this date
            quizzes_today = len([q for q in quiz_history if 
                               q.get("date") and 
                               datetime.fromisoformat(str(q["date"])).date() == date])
            weekly_progress.append({
                "day": date.strftime("%a"),
                "xp": quizzes_today * 50,  # Approximate XP per quiz
                "lessons": quizzes_today
            })
        weekly_progress.reverse()  # Show oldest to newest
        
        # Calculate skill distribution from completed topics
        courses_collection = get_collection("courses")
        skill_distribution = {}
        for topic_id in completed_topics:
            course_doc = courses_collection.find_one({
                "modules.topics.topic_id": topic_id
            })
            if course_doc:
                # Find the topic to get its category/skill
                for module in course_doc.get("modules", []):
                    for topic in module.get("topics", []):
                        if topic.get("topic_id") == topic_id:
                            skill = topic.get("category", "General")
                            skill_distribution[skill] = skill_distribution.get(skill, 0) + 1
                            break
        
        # Calculate study time (approximate)
        total_study_time = len(completed_topics) * 15  # 15 minutes per topic
        weekly_xp = sum([day["xp"] for day in weekly_progress])
        monthly_xp = sum([q.get("score", 0) * 2 for q in quiz_history[-30:]])  # Last 30 quizzes
        
        # Generate learning goals based on user progress
        goals = []
        if len(completed_topics) < 10:
            goals.append({
                "id": 1,
                "title": "Complete 10 lessons",
                "progress": min(100, (len(completed_topics) / 10) * 100),
                "target": 10,
                "current": len(completed_topics)
            })
        
        if average_score < 90:
            goals.append({
                "id": 2,
                "title": "Achieve 90% average score",
                "progress": min(100, average_score),
                "target": 90,
                "current": average_score
            })
        
        if streak_count < 15:
            goals.append({
                "id": 3,
                "title": "Maintain 15-day streak",
                "progress": min(100, (streak_count / 15) * 100),
                "target": 15,
                "current": streak_count
            })
        
        # Generate achievements based on user progress
        achievements = [
            {
                "id": 1,
                "title": "First Quiz",
                "description": "Completed your first quiz",
                "icon": "🎯",
                "earned": total_quizzes > 0
            },
            {
                "id": 2,
                "title": "Streak Master",
                "description": "Maintained a 10-day streak",
                "icon": "🔥",
                "earned": streak_count >= 10
            },
            {
                "id": 3,
                "title": "Speed Learner",
                "description": "Completed 5 lessons in one day",
                "icon": "⚡",
                "earned": len(completed_topics) >= 5
            },
            {
                "id": 4,
                "title": "Perfect Score",
                "description": "Scored 100% on a quiz",
                "icon": "💯",
                "earned": best_score >= 100
            },
            {
                "id": 5,
                "title": "Course Master",
                "description": "Completed a full course",
                "icon": "🏆",
                "earned": len(completed_modules) > 0
            },
            {
                "id": 6,
                "title": "XP Collector",
                "description": "Earned 1000 XP",
                "icon": "⭐",
                "earned": user_doc.get("xp", 0) >= 1000
            }
        ]
        
        return {
            "user": {
                "name": user_doc.get("name", current_user.name),
                "email": user_doc.get("email", current_user.email),
                "xp": user_doc.get("xp", 0),
                "level": user_doc.get("level", 1),
                "badges": user_doc.get("badges", [])
            },
            "stats": {
                "total_xp": user_doc.get("xp", 0),
                "total_quizzes": total_quizzes,
                "average_score": round(average_score, 1),
                "best_score": best_score,
                "recent_average": round(recent_average, 1),
                "streak_count": streak_count,
                "lessons_completed": len(completed_topics),
                "courses_started": len(enrolled_courses),
                "courses_completed": len(completed_modules),
                "total_study_time": total_study_time,
                "weekly_xp": weekly_xp,
                "monthly_xp": monthly_xp
            },
            "recent_activity": quiz_history[-10:] if len(quiz_history) > 10 else quiz_history,
            "weekly_progress": weekly_progress,
            "skill_distribution": skill_distribution,
            "goals": goals,
            "achievements": achievements,
            "enrolled_courses": enrolled_courses
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}"
        )

@router.get("/leaderboard")
async def get_leaderboard(
    time: str = Query("all", description="Time filter: all, week, month"),
    limit: int = Query(50, description="Number of users to return"),
    current_user: User = Depends(get_current_user)
):
    """Get leaderboard with real user data"""
    try:
        users_collection = get_collection("users")
        
        # Calculate date filter
        now = datetime.utcnow()
        if time == "week":
            start_date = now - timedelta(days=7)
        elif time == "month":
            start_date = now - timedelta(days=30)
        else:
            start_date = None
        
        # Build aggregation pipeline
        pipeline = []
        
        # Match users with activity in the time period
        if start_date:
            pipeline.append({
                "$match": {
                    "last_active_date": {"$gte": start_date}
                }
            })
        
        # Add computed fields
        pipeline.append({
            "$addFields": {
                "total_xp": {"$ifNull": ["$xp", 0]},
                "total_quizzes": {"$size": {"$ifNull": ["$quiz_history", []]}},
                "completed_lessons": {"$size": {"$ifNull": ["$completed_topics", []]}},
                "streak_count": {"$ifNull": ["$streak_count", 0]},
                "level": {"$ifNull": ["$level", 1]},
                "badges": {"$ifNull": ["$badges", []]},
                "last_active": {"$ifNull": ["$last_active_date", "$created_at"]}
            }
        })
        
        # Calculate average score
        pipeline.append({
            "$addFields": {
                "average_score": {
                    "$cond": {
                        "if": {"$gt": [{"$size": {"$ifNull": ["$quiz_history", []]}}, 0]},
                        "then": {
                            "$avg": {
                                "$map": {
                                    "input": {"$ifNull": ["$quiz_history", []]},
                                    "as": "quiz",
                                    "in": {"$ifNull": ["$$quiz.score", 0]}
                                }
                            }
                        },
                        "else": 0
                    }
                }
            }
        })
        
        # Sort by XP (primary) and average score (secondary)
        pipeline.append({
            "$sort": {
                "total_xp": -1,
                "average_score": -1,
                "last_active": -1
            }
        })
        
        # Limit results
        pipeline.append({"$limit": limit})
        
        # Project final fields
        pipeline.append({
            "$project": {
                "_id": 1,
                "name": 1,
                "email": 1,
                "total_xp": 1,
                "level": 1,
                "total_quizzes": 1,
                "completed_lessons": 1,
                "streak_count": 1,
                "average_score": 1,
                "badges": 1,
                "last_active": 1,
                "avatar_url": 1
            }
        })
        
        # Execute aggregation
        users = list(users_collection.aggregate(pipeline))
        
        # Format the response
        leaderboard = []
        for i, user in enumerate(users):
            # Generate avatar initials
            name_parts = user.get("name", "User").split()
            if len(name_parts) >= 2:
                avatar = f"{name_parts[0][0]}{name_parts[1][0]}".upper()
            else:
                avatar = user.get("name", "U")[0].upper()
            
            # Calculate rank
            rank = i + 1
            
            # Format last active
            last_active_date = user.get("last_active")
            if last_active_date:
                if isinstance(last_active_date, datetime):
                    time_diff = now - last_active_date
                    if time_diff.days > 0:
                        last_active = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
                    elif time_diff.seconds > 3600:
                        hours = time_diff.seconds // 3600
                        last_active = f"{hours} hour{'s' if hours > 1 else ''} ago"
                    elif time_diff.seconds > 60:
                        minutes = time_diff.seconds // 60
                        last_active = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
                    else:
                        last_active = "Just now"
                else:
                    last_active = "Recently"
            else:
                last_active = "Unknown"
            
            leaderboard.append({
                "id": str(user["_id"]),
                "name": user.get("name", "Anonymous User"),
                "email": user.get("email", ""),
                "xp": user.get("total_xp", 0),
                "level": user.get("level", 1),
                "streak": user.get("streak_count", 0),
                "avatar": avatar,
                "rank": rank,
                "completed_lessons": user.get("completed_lessons", 0),
                "badges": user.get("badges", []),
                "join_date": user.get("created_at", now).strftime("%Y-%m-%d") if user.get("created_at") else "Unknown",
                "last_active": last_active,
                "total_quizzes": user.get("total_quizzes", 0),
                "average_score": round(user.get("average_score", 0), 1)
            })
        
        return leaderboard
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching leaderboard: {str(e)}"
        )
