from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class Topic(BaseModel):
    topic_id: str
    title: str
    content_url: Optional[str] = None


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

"""
Course model - Database schema for courses
"""
from typing import List, Optional
from datetime import datetime

class Course:
    """
    Course model representing a learning course.
    """
    def __init__(
        self,
        id: str,
        title: str,
        description: str,
        level: str,
        duration: str,
        instructor_id: str,
        topics: Optional[List[str]] = None,
        prerequisites: Optional[List[str]] = None,
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.title = title
        self.description = description
        self.level = level
        self.duration = duration
        self.instructor_id = instructor_id
        self.topics = topics or []
        self.prerequisites = prerequisites or []
        self.created_at = created_at or datetime.now()
    
    def to_dict(self):
        """Convert to dictionary representation"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "level": self.level,
            "duration": self.duration,
            "instructor_id": self.instructor_id,
            "topics": self.topics,
            "prerequisites": self.prerequisites,
            "created_at": self.created_at.isoformat()
        }
