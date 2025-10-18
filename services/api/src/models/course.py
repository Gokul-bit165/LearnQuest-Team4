from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class CardType(str, Enum):
    THEORY = "theory"
    MCQ = "mcq"
    CODE = "code"
    FILL_IN_BLANK = "fill-in-blank"


class Card(BaseModel):
    card_id: str
    type: CardType
    content: str  # Question or instruction text
    
    # Fields that vary by card type
    choices: Optional[List[str]] = None  # For MCQ
    correct_choice_index: Optional[int] = None  # For MCQ
    starter_code: Optional[str] = None  # For CODE
    test_cases: Optional[List[Dict[str, Any]]] = None  # For CODE
    blanks: Optional[List[str]] = None  # For FILL_IN_BLANK
    correct_answers: Optional[List[str]] = None  # For FILL_IN_BLANK
    
    # Common fields
    explanation: Optional[str] = None  # Explanation shown after answer
    xp_reward: int = 10  # XP awarded for correct answer


class Topic(BaseModel):
    topic_id: str
    title: str
    cards: List[Card] = Field(default_factory=list)
    xp_reward: int = 50  # Bonus XP for completing entire topic


class Module(BaseModel):
    module_id: str
    title: str
    order: int
    topics: List[Topic] = Field(default_factory=list)


class Course(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    title: str
    slug: str
    description: str
    xp_reward: int = 0
    modules: List[Module] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

