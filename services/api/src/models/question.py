from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TestCase(BaseModel):
    input: str
    expected_output: str
    is_hidden: bool = False


class Question(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    type: str  # "mcq" or "code"
    course_id: str
    quiz_id: Optional[str] = None
    prompt: str
    choices: Optional[List[str]] = None  # For MCQ questions
    correct_choice: Optional[int] = None  # Index of correct choice for MCQ
    code_starter: Optional[str] = None  # For code questions
    test_cases: Optional[List[TestCase]] = None  # For code questions
    difficulty: str = "easy"  # "easy", "medium", "hard"
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
