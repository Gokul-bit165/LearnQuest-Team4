from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ...auth import get_current_user
from ...models.course import ProblemSummary, ProblemDetail, CodeSubmission, TestResult, SubmissionResult, TestCase
from ...models.user import User
from ...database import get_collection

router = APIRouter()

@router.get("/", response_model=List[ProblemSummary])
async def get_all_problems_admin(
    difficulty: Optional[str] = None,
    tag: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Fetch all problems for admin management (including inactive ones)."""
    questions = get_collection("questions")
    problems = []
    
    # Find all code questions (both practice and non-practice)
    query = {"type": "code"}
    if difficulty:
        query["difficulty"] = difficulty
    
    for question in questions.find(query):
        # Extract problem details
        problem_id = str(question["_id"])
        title = question.get("prompt", "Untitled Problem")
        difficulty = question.get("difficulty", "medium")
        tags = question.get("tags", [])
        xp_reward = question.get("xp_reward", 10)
        is_practice_problem = question.get("is_practice_problem", False)
        
        # Apply tag filter
        if tag and tag not in tags:
            continue
            
        problems.append(ProblemSummary(
            problem_id=problem_id,
            title=title,
            difficulty=difficulty,
            tags=tags,
            xp_reward=xp_reward,
            is_practice_problem=is_practice_problem
        ))
    
    return problems

@router.get("/{problem_id}", response_model=ProblemDetail)
async def get_problem_detail_admin(
    problem_id: str, 
    current_user: User = Depends(get_current_user)
):
    """Fetch full details for a single problem (admin view - includes all test cases)."""
    questions = get_collection("questions")
    
    # Find the problem question
    question = questions.find_one({
        "_id": ObjectId(problem_id),
        "type": "code"
    })
    
    if not question:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Extract all test cases (both public and hidden for admin)
    test_cases = question.get("test_cases", [])
    all_test_cases = [
        TestCase(
            input=tc.get("input", ""),
            expected_output=tc.get("expected_output", ""),
            is_hidden=tc.get("is_hidden", False)
        )
        for tc in test_cases
    ]
    
    return ProblemDetail(
        problem_id=str(question["_id"]),
        title=question.get("prompt", "Untitled Problem"),
        content=question.get("prompt", ""),
        starter_code=question.get("code_starter", ""),
        difficulty=question.get("difficulty", "medium"),
        tags=question.get("tags", []),
        xp_reward=question.get("xp_reward", 10),
        public_test_cases=all_test_cases  # Admin sees all test cases
    )

@router.post("/", response_model=dict)
async def create_problem(
    problem_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Create a new coding problem."""
    questions = get_collection("questions")
    
    # Validate required fields
    required_fields = ["prompt", "code_starter", "test_cases"]
    for field in required_fields:
        if field not in problem_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Prepare the problem document
    problem_doc = {
        "type": "code",
        "prompt": problem_data["prompt"],
        "code_starter": problem_data["code_starter"],
        "test_cases": problem_data["test_cases"],
        "difficulty": problem_data.get("difficulty", "medium"),
        "tags": problem_data.get("tags", []),
        "xp_reward": problem_data.get("xp_reward", 10),
        "explanation": problem_data.get("explanation", ""),
        "is_practice_problem": problem_data.get("is_practice_problem", False),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert the problem
    result = questions.insert_one(problem_doc)
    
    return {
        "message": "Problem created successfully",
        "problem_id": str(result.inserted_id)
    }

@router.put("/{problem_id}", response_model=dict)
async def update_problem(
    problem_id: str,
    problem_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Update an existing coding problem."""
    questions = get_collection("questions")
    
    # Check if problem exists
    existing_problem = questions.find_one({
        "_id": ObjectId(problem_id),
        "type": "code"
    })
    
    if not existing_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Prepare update data
    update_data = {
        "prompt": problem_data.get("prompt", existing_problem["prompt"]),
        "code_starter": problem_data.get("code_starter", existing_problem["code_starter"]),
        "test_cases": problem_data.get("test_cases", existing_problem["test_cases"]),
        "difficulty": problem_data.get("difficulty", existing_problem["difficulty"]),
        "tags": problem_data.get("tags", existing_problem["tags"]),
        "xp_reward": problem_data.get("xp_reward", existing_problem["xp_reward"]),
        "explanation": problem_data.get("explanation", existing_problem.get("explanation", "")),
        "is_practice_problem": problem_data.get("is_practice_problem", existing_problem.get("is_practice_problem", False)),
        "updated_at": datetime.utcnow()
    }
    
    # Update the problem
    questions.update_one(
        {"_id": ObjectId(problem_id)},
        {"$set": update_data}
    )
    
    return {"message": "Problem updated successfully"}

@router.delete("/{problem_id}", response_model=dict)
async def delete_problem(
    problem_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a coding problem."""
    questions = get_collection("questions")
    
    # Check if problem exists
    existing_problem = questions.find_one({
        "_id": ObjectId(problem_id),
        "type": "code"
    })
    
    if not existing_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Delete the problem
    questions.delete_one({"_id": ObjectId(problem_id)})
    
    return {"message": "Problem deleted successfully"}

@router.patch("/{problem_id}/toggle", response_model=dict)
async def toggle_problem_status(
    problem_id: str,
    status_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Toggle whether a problem appears in the Practice Zone."""
    questions = get_collection("questions")
    
    # Check if problem exists
    existing_problem = questions.find_one({
        "_id": ObjectId(problem_id),
        "type": "code"
    })
    
    if not existing_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Update the practice problem status
    questions.update_one(
        {"_id": ObjectId(problem_id)},
        {
            "$set": {
                "is_practice_problem": status_data.get("is_practice_problem", False),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Problem status updated successfully"}
