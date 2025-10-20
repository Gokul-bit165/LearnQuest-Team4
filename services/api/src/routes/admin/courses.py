from typing import List, Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from bson import ObjectId
from pydantic import BaseModel
from datetime import datetime
import uuid
import re
from ...database import get_collection
from ...models.user import User
from ...auth import require_admin_user
from fastapi import APIRouter

router = APIRouter(tags=["admin-courses"])


def slugify(title: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9\s-]", "", title).strip().lower()
    slug = re.sub(r"[\s-]+", "-", slug)
    return slug


class CardRequest(BaseModel):
    type: str  # "theory", "mcq", "code", "fill-in-blank"
    content: str
    xp_reward: int = 10
    explanation: Optional[str] = None
    
    # MCQ specific fields
    choices: Optional[List[str]] = None
    correct_choice_index: Optional[int] = None
    
    # Code specific fields
    starter_code: Optional[str] = None
    test_cases: Optional[List[Dict[str, Any]]] = None
    is_practice_problem: bool = False  # Whether this code card should appear in Practice Zone
    difficulty: Optional[str] = "Medium"  # Easy, Medium, Hard
    tags: Optional[List[str]] = []  # Tags for filtering
    
    # Fill-in-blank specific fields
    blanks: Optional[List[str]] = None
    correct_answers: Optional[List[str]] = None


class TopicRequest(BaseModel):
    title: str
    xp_reward: int = 50
    cards: List[CardRequest] = []


class ModuleRequest(BaseModel):
    title: str
    order: int
    topics: List[TopicRequest] = []


class CreateCourseRequest(BaseModel):
    title: str
    description: str
    xp_reward: int
    modules: List[ModuleRequest] = []


@router.get("/", response_model=List[dict])
async def list_courses(_: User = Depends(require_admin_user)):
    """Get all courses for admin management"""
    courses = get_collection("courses")
    course_list = list(courses.find().sort("title", 1))
    
    # Convert ObjectId to string for JSON serialization
    for course in course_list:
        course["id"] = str(course["_id"])
        del course["_id"]
    
    return course_list


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_course(request: CreateCourseRequest, _: User = Depends(require_admin_user)):
    courses = get_collection("courses")

    # Generate slug and check duplicates
    course_slug = slugify(request.title)
    existing = courses.find_one({"slug": course_slug})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Course with this title already exists")

    # Build nested modules/topics/cards with ids
    modules = []
    for module in request.modules:
        module_id = str(uuid.uuid4())
        topics = []
        for topic in module.topics:
            topic_id = str(uuid.uuid4())
            cards = []
            for card in topic.cards:
                card_id = str(uuid.uuid4())
                card_doc = {
                    "card_id": card_id,
                    "type": card.type,
                    "content": card.content,
                    "xp_reward": card.xp_reward,
                    "explanation": card.explanation,
                }
                
                # Add type-specific fields
                if card.type == "mcq" and card.choices:
                    card_doc["choices"] = card.choices
                    card_doc["correct_choice_index"] = card.correct_choice_index
                elif card.type == "code":
                    card_doc["starter_code"] = card.starter_code
                    card_doc["test_cases"] = card.test_cases or []
                    card_doc["is_practice_problem"] = card.is_practice_problem
                    card_doc["difficulty"] = card.difficulty or "Medium"
                    card_doc["tags"] = card.tags or []
                elif card.type == "fill-in-blank":
                    card_doc["blanks"] = card.blanks or []
                    card_doc["correct_answers"] = card.correct_answers or []
                
                cards.append(card_doc)
            
            topics.append({
                "topic_id": topic_id,
                "title": topic.title,
                "xp_reward": topic.xp_reward,
                "cards": cards,
            })
        
        modules.append({
            "module_id": module_id,
            "title": module.title,
            "order": module.order,
            "topics": topics,
        })

    now = datetime.utcnow()
    course_doc = {
        "title": request.title,
        "slug": course_slug,
        "description": request.description,
        "xp_reward": request.xp_reward,
        "modules": modules,
        "created_at": now,
        "updated_at": now
    }

    res = courses.insert_one(course_doc)
    doc = courses.find_one({"_id": res.inserted_id})
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


@router.put("/{course_id}", response_model=dict)
async def update_course(course_id: str, payload: dict, _: User = Depends(require_admin_user)):
    courses = get_collection("courses")
    res = courses.update_one({"_id": ObjectId(course_id)}, {"$set": payload})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    doc = courses.find_one({"_id": ObjectId(course_id)})
    doc["id"] = str(doc["_id"]) 
    del doc["_id"]
    return doc


@router.get("/{course_id}", response_model=dict)
async def get_course(course_id: str, _: User = Depends(require_admin_user)):
    courses = get_collection("courses")
    doc = courses.find_one({"_id": ObjectId(course_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Course not found")
    doc["id"] = str(doc["_id"]) 
    del doc["_id"]
    return doc


@router.delete("/{course_id}", status_code=204)
async def delete_course(course_id: str, _: User = Depends(require_admin_user)):
    courses = get_collection("courses")
    res = courses.delete_one({"_id": ObjectId(course_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    # Also consider deleting quizzes referencing this course in a real system
    return None


