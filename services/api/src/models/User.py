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
