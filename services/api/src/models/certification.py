"""
Certification models for LearnQuest
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId


class CertificationSpec(BaseModel):
    """Model for certification specifications"""
    id: Optional[str] = None
    title: str
    description: str
    difficulty: str  # 'Easy', 'Medium', 'Tough'
    duration_minutes: int
    pass_percentage: int
    question_ids: List[str] = []
    
    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str
        }


class CertificationAttempt(BaseModel):
    """Model for user certification attempts"""
    id: Optional[str] = None
    user_id: str
    spec_id: str
    status: str  # 'started', 'submitted', 'completed'
    start_time: datetime
    end_time: Optional[datetime] = None
    proctoring_logs: List[dict] = []
    behavior_score: int = 100
    test_score: Optional[int] = None
    final_score: Optional[int] = None
    answers: List[dict] = []
    
    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }
