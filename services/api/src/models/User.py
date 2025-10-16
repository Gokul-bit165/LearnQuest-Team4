from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class WrongQuestion(BaseModel):
    q_id: str
    user_answer: Optional[str] = None
    correct_answer: Optional[str] = None


class QuizHistoryItem(BaseModel):
    quiz_id: str
    score: int
    date: datetime
    wrong_questions: List[WrongQuestion] = Field(default_factory=list)


class EnrolledCourse(BaseModel):
    course_id: str
    progress_percent: int = 0
    completed_modules: List[str] = Field(default_factory=list)


class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    email: str
    avatar_url: Optional[str] = None
    auth_provider: str = "email"
    xp: int = 0
    level: int = 1
    enrolled_courses: List[EnrolledCourse] = Field(default_factory=list)
    quiz_history: List[QuizHistoryItem] = Field(default_factory=list)
    badges: List[str] = Field(default_factory=list)

    class Config:
        populate_by_name = True

"""
User model - Database schema for users
"""
from typing import Optional
from datetime import datetime

class User:
    """
    User model representing a student or admin.
    """
    def __init__(
        self,
        id: str,
        email: str,
        name: str,
        password_hash: str,
        role: str = "student",
        level: str = "beginner",
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.email = email
        self.name = name
        self.password_hash = password_hash
        self.role = role  # 'student', 'admin', 'instructor'
        self.level = level  # 'beginner', 'intermediate', 'advanced'
        self.created_at = created_at or datetime.now()
    
    def to_dict(self):
        """Convert to dictionary representation"""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "level": self.level,
            "created_at": self.created_at.isoformat()
        }
