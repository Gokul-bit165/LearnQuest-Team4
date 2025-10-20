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
    is_practice_problem: bool = False  # Whether this code card should appear in Practice Zone


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


# Request/Response models for lesson interactions
class CheckAnswerRequest(BaseModel):
    card_id: str
    # Accept int for MCQ index, str for code/theory, list for fill-in-blank, or dict if needed
    user_answer: Union[int, str, List[str], Dict[str, Any]]
    mode: Optional[str] = None  # 'run' for dry-run (no XP), default submit


class CheckAnswerResponse(BaseModel):
    correct: bool
    xp_reward: int
    explanation: Optional[str] = None
    correct_answer: Optional[Union[str, List[str]]] = None


class CompleteTopicResponse(BaseModel):
    success: bool
    xp_reward: int
    streak_count: int
    message: str


# Practice Zone models
class ProblemSummary(BaseModel):
    problem_id: str
    title: str
    difficulty: str
    tags: List[str]
    xp_reward: int
    is_practice_problem: bool = False


class TestCase(BaseModel):
    input: str
    expected_output: str
    is_hidden: bool = False


class ProblemDetail(BaseModel):
    problem_id: str
    title: str
    content: str  # Problem description
    starter_code: str
    difficulty: str
    tags: List[str]
    xp_reward: int
    public_test_cases: List[TestCase]


class CodeSubmission(BaseModel):
    user_code: str
    language_id: int = 71  # Default to Python


class TestResult(BaseModel):
    test_case_number: int
    passed: bool
    output: Optional[str] = None
    expected_output: Optional[str] = None
    error: Optional[str] = None
    is_hidden: bool = False


class SubmissionResult(BaseModel):
    overall_passed: bool
    results: List[TestResult]
    xp_reward: int = 0
