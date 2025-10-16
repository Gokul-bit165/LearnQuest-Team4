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
