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
    password_hash: Optional[str] = None
    avatar_url: Optional[str] = None
    auth_provider: str = "email"
    xp: int = 0
    level: int = 1
    enrolled_courses: List[EnrolledCourse] = Field(default_factory=list)
    quiz_history: List[QuizHistoryItem] = Field(default_factory=list)
    badges: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
