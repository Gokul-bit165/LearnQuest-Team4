from typing import List
from fastapi import Depends, HTTPException
from bson import ObjectId
from ...database import get_collection
from ...models.user import User
from ...auth import require_admin_user
from . import router as admin_router


@admin_router.post("/courses", response_model=dict)
async def create_course(payload: dict, _: User = Depends(require_admin_user)):
    courses = get_collection("courses")
    payload.setdefault("created_at", None)
    payload.setdefault("updated_at", None)
    res = courses.insert_one(payload)
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


