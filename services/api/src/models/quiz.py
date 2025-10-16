from typing import List, Optional
from pydantic import BaseModel, Field


class Quiz(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    course_id: str
    title: str
    duration_seconds: int
    question_ids: List[str] = Field(default_factory=list)
    xp_reward: int = 0

    class Config:
        populate_by_name = True


