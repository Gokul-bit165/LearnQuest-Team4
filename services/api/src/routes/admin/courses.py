from typing import List
from fastapi import Depends, HTTPException, status
from bson import ObjectId
from pydantic import BaseModel
from datetime import datetime
import uuid
import re
from ...database import get_collection
from ...models.user import User
from ...auth import require_admin_user
from . import router as admin_router


def slugify(title: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9\s-]", "", title).strip().lower()
    slug = re.sub(r"[\s-]+", "-", slug)
    return slug


class TopicRequest(BaseModel):
    title: str
    content: str


class ModuleRequest(BaseModel):
    title: str
    topics: List[TopicRequest] = []


class CreateCourseRequest(BaseModel):
    title: str
    description: str
    xp_reward: int
    modules: List[ModuleRequest] = []


@admin_router.post("/courses", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_course(request: CreateCourseRequest, _: User = Depends(require_admin_user)):
    courses = get_collection("courses")

    # Generate slug and check duplicates
    course_slug = slugify(request.title)
    existing = courses.find_one({"slug": course_slug})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Course with this title already exists")

    # Build nested modules/topics with ids
    modules = []
    for order_index, module in enumerate(request.modules, start=1):
        module_id = str(uuid.uuid4())
        topics = []
        for topic in module.topics:
            topics.append({
                "topic_id": str(uuid.uuid4()),
                "title": topic.title,
                "content_url": None,
                "content": topic.content,
            })
        modules.append({
            "module_id": module_id,
            "title": module.title,
            "order": order_index,
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
        "updated_at": now,
    }

    res = courses.insert_one(course_doc)
    doc = courses.find_one({"_id": res.inserted_id})
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


@admin_router.put("/courses/{course_id}", response_model=dict)
async def update_course(course_id: str, payload: dict, _: User = Depends(require_admin_user)):
    courses = get_collection("courses")
    res = courses.update_one({"_id": ObjectId(course_id)}, {"$set": payload})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    doc = courses.find_one({"_id": ObjectId(course_id)})
    doc["id"] = str(doc["_id"]) 
    del doc["_id"]
    return doc


@admin_router.delete("/courses/{course_id}", status_code=204)
async def delete_course(course_id: str, _: User = Depends(require_admin_user)):
    courses = get_collection("courses")
    res = courses.delete_one({"_id": ObjectId(course_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    # Also consider deleting quizzes referencing this course in a real system
    return None


