from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class Topic(BaseModel):
    topic_id: str
    title: str
    content_url: Optional[str] = None
    image_url: Optional[str] = None


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

