from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from datetime import datetime
import random

from ..auth import get_current_user
from ..database import get_collection
from ..code_executor import CodeExecutor  # type: ignore
import os
import httpx

router = APIRouter(prefix="/api/cert-tests", tags=["cert-tests-runtime"])


@router.get("/specs")
async def list_public_specs(current_user=Depends(get_current_user)):
    """Return grouped certification specs for the candidate UI.
    Output: [{ cert_id, difficulties: [{ name, question_count, duration_minutes, pass_percentage }], prerequisite_course_id? }]
    """
    specs = get_collection("cert_test_specs")
    items = list(specs.find({}))
    grouped: dict[str, dict] = {}
    for it in items:
        cert_id = it.get("cert_id")
        if not cert_id:
            continue
        diff = it.get("difficulty")
        if cert_id not in grouped:
            grouped[cert_id] = {
                "cert_id": cert_id,
                "difficulties": [],
                "prerequisite_course_id": it.get("prerequisite_course_id", "") or "",
            }
        grouped[cert_id]["difficulties"].append({
            "name": diff,
            "question_count": int(it.get("question_count", 10)),
            "duration_minutes": int(it.get("duration_minutes", 30)),
            "pass_percentage": int(it.get("pass_percentage", 70)),
        })
    return list(grouped.values())

@router.post("/attempts")
async def start_attempt(payload: Dict[str, Any], current_user=Depends(get_current_user)):
    topic_id = payload.get("topic_id")
    difficulty = payload.get("difficulty")
    user_name = payload.get("user_name")
    print(f"DEBUG: Received start_attempt request - topic_id: {topic_id}, difficulty: {difficulty}")
    
    if not topic_id or not difficulty:
        raise HTTPException(status_code=400, detail="topic_id and difficulty are required")

    specs = get_collection("cert_test_specs")
    # Case-insensitive search for difficulty
    spec = specs.find_one({
        "cert_id": topic_id, 
        "difficulty": {"$regex": f"^{difficulty}$", "$options": "i"}
    })
    print(f"DEBUG: Query result - spec found: {spec is not None}")
    if not spec:
        # Try to list available specs for debugging
        available_specs = list(specs.find({}, {"cert_id": 1, "difficulty": 1}))
        print(f"DEBUG: Available specs: {available_specs}")
        raise HTTPException(status_code=404, detail=f"Test spec not found for topic_id='{topic_id}', difficulty='{difficulty}'")

    # Enforce prerequisite course completion if configured
    prereq_course_id = (spec.get("prerequisite_course_id") or "").strip()
    if prereq_course_id:
        users = get_collection("users")
        courses = get_collection("courses")
        from bson import ObjectId
        user_doc = users.find_one({"_id": ObjectId(str(current_user.id))})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        # Ensure baseline progress fields exist
        init_update = {}
        if "completed_topics" not in user_doc:
            init_update["completed_topics"] = []
        if "completed_modules" not in user_doc:
            init_update["completed_modules"] = []
        if init_update:
            users.update_one({"_id": user_doc["_id"]}, {"$set": init_update})
            user_doc.update(init_update)

        course = None
        try:
            course = courses.find_one({"_id": ObjectId(prereq_course_id)})
        except Exception:
            course = courses.find_one({"id": prereq_course_id})
        if not course:
            raise HTTPException(status_code=400, detail="Prerequisite course not found")

        # Collect all topic_ids in the course
        required_topic_ids: list[str] = []
        for m in course.get("modules", []):
            for t in m.get("topics", []):
                tid = t.get("topic_id") or t.get("id")
                if isinstance(tid, str):
                    required_topic_ids.append(tid)

        user_completed = set(user_doc.get("completed_topics", []) or [])
        remaining = [tid for tid in required_topic_ids if tid not in user_completed]
        if remaining:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "PREREQUISITE_NOT_COMPLETED",
                    "message": "Complete the prerequisite course before attempting this test",
                    "remaining_topics": remaining,
                    "prerequisite_course_id": prereq_course_id,
                },
            )
    settings = {
        "question_count": spec.get("question_count") if spec else 10,
        "duration_minutes": spec.get("duration_minutes") if spec else 30,
        "pass_percentage": spec.get("pass_percentage") if spec else 70,
        "randomize": spec.get("randomize", True) if spec else True,
        "restrict_copy_paste": spec.get("restrict_copy_paste", False) if spec else False,
        "bank_ids": spec.get("bank_ids", []) if spec else [],
        "prerequisite_course_id": prereq_course_id,
    }

    # Fetch questions from question_ids (coding problems) or banks
    questions = []
    question_ids = spec.get("question_ids", []) if spec else []
    bank_ids = spec.get("bank_ids", []) if spec else []
    
    # Load from problems collection if question_ids exist
    if question_ids:
        problems_collection = get_collection("problems")
        from bson import ObjectId
        # Fetch all problems for these IDs
        for qid in question_ids:
            try:
                problem = problems_collection.find_one({"_id": ObjectId(qid)})
                if problem:
                    # Convert ObjectId to string and clean up the problem data
                    problem["_id"] = str(problem["_id"])
                    problem["id"] = str(problem["_id"])
                    questions.append(problem)
            except Exception as e:
                print(f"Error fetching problem {qid}: {e}")
                continue
    
    # Load from question banks if bank_ids exist
    elif bank_ids:
        banks_collection = get_collection("cert_test_banks")
        from bson import ObjectId
        question_pool = []
        
        for bid in bank_ids:
            try:
                bank = banks_collection.find_one({"_id": ObjectId(bid)})
            except Exception:
                bank = banks_collection.find_one({"file_name": bid})
            
            if bank and isinstance(bank.get("questions"), list):
                # Filter for coding questions only (type="code")
                coding_questions = [
                    q for q in bank["questions"] 
                    if q.get("type", "").lower() == "code"
                ]
                question_pool.extend(coding_questions)
        
        # Randomize and select questions
        question_count = settings.get("question_count", 10)
        if settings.get("randomize", True):
            random.shuffle(question_pool)
        
        questions = question_pool[:question_count]
        
        # Process questions: separate public and hidden test cases
        for q in questions:
            if "test_cases" in q:
                all_tests = q.get("test_cases", [])
                public_tests = [tc for tc in all_tests if not tc.get("is_hidden", False)]
                hidden_tests = [tc for tc in all_tests if tc.get("is_hidden", False)]
                
                q["public_test_cases"] = public_tests
                q["hidden_test_cases"] = hidden_tests
                q["all_test_cases"] = all_tests
        
        print(f"DEBUG: Loaded {len(questions)} coding questions from {len(bank_ids)} banks")

    attempts = get_collection("cert_attempts")
    doc = {
        "user_id": str(current_user.id),
        "user_name": user_name,
        "topic_id": topic_id,
        "difficulty": difficulty,
        "settings": settings,
        "created_at": datetime.utcnow(),
        "status": "active",
    }
    ins = attempts.insert_one(doc)
    
    # Include restrictions from spec
    restrictions = {
        "copy_paste": spec.get("restrict_copy_paste", False) if spec else False,
        "tab_switching": spec.get("restrict_tab_switching", False) if spec else False,
        "right_click": spec.get("restrict_right_click", False) if spec else False,
        "enable_fullscreen": spec.get("enable_fullscreen", False) if spec else False,
        "enable_proctoring": spec.get("enable_proctoring", False) if spec else False,
        "allowed_languages": spec.get("allowed_languages", ["python", "javascript", "cpp", "c", "java"]) if spec else ["python", "javascript", "cpp", "c", "java"],
    }
    
    return {
        "attempt_id": str(ins.inserted_id), 
        "settings": settings,
        "questions": questions,
        "duration_minutes": settings["duration_minutes"],
        "restrictions": restrictions
    }


@router.get("/attempts/{attempt_id}/questions")
async def get_attempt_questions(attempt_id: str, current_user=Depends(get_current_user)):
    attempts = get_collection("cert_attempts")
    banks = get_collection("cert_test_banks")
    att = attempts.find_one({"_id": attempts._Database__collection.database.client.get_default_database().client.get_default_database().codec_options.document_class()._id.__class__(attempt_id)})
    # Fallback: find by string _id if above fails in some envs
    if not att:
        from bson import ObjectId
        try:
            att = attempts.find_one({"_id": ObjectId(attempt_id)})
        except Exception:
            att = None
    if not att:
        raise HTTPException(status_code=404, detail="Attempt not found")

    if str(att.get("user_id")) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")

    settings = att.get("settings", {})
    question_count = int(settings.get("question_count", 10))
    randomize = bool(settings.get("randomize", True))
    bank_ids = settings.get("bank_ids", [])

    # Load questions from selected banks (coding questions only)
    pool = []
    from bson import ObjectId
    if bank_ids:
        for bid in bank_ids:
            try:
                b = banks.find_one({"_id": ObjectId(bid)})
            except Exception:
                b = banks.find_one({"file_name": bid})
            if b and isinstance(b.get("questions"), list):
                # Filter for coding questions only
                coding_questions = [
                    q for q in b["questions"] 
                    if q.get("type", "").lower() == "code"
                ]
                pool.extend(coding_questions)
    else:
        # If no banks specified, take all coding questions
        for b in banks.find({}):
            if isinstance(b.get("questions"), list):
                coding_questions = [
                    q for q in b["questions"] 
                    if q.get("type", "").lower() == "code"
                ]
                pool.extend(coding_questions)

    if not pool:
        return {"questions": []}

    if randomize:
        random.shuffle(pool)

    selected = pool[:question_count]
    # Strip heavy fields if any
    return {"questions": selected}


@router.post("/submit")
async def submit_attempt(payload: Dict[str, Any], current_user=Depends(get_current_user)):
    attempt_id = payload.get("attempt_id")
    answers = payload.get("answers", {})
    if not attempt_id:
        raise HTTPException(status_code=400, detail="attempt_id is required")

    attempts = get_collection("cert_attempts")
    banks = get_collection("cert_test_banks")
    from bson import ObjectId
    try:
        att = attempts.find_one({"_id": ObjectId(attempt_id)})
    except Exception:
        att = None
    if not att:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if str(att.get("user_id")) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")

    settings = att.get("settings", {})
    bank_ids = settings.get("bank_ids", [])
    pool = []
    if bank_ids:
        for bid in bank_ids:
            try:
                b = banks.find_one({"_id": ObjectId(bid)})
            except Exception:
                b = banks.find_one({"file_name": bid})
            if b and isinstance(b.get("questions"), list):
                pool.extend(b["questions"]) 
    else:
        for b in banks.find({}):
            if isinstance(b.get("questions"), list):
                pool.extend(b["questions"]) 

    # Simple grading for MCQ only; code problems expect external judge (not implemented here)
    total_mcq = 0
    correct_mcq = 0
    for q in pool:
        if (q.get("type") or "mcq").lower() == "mcq":
            total_mcq += 1
            qid = str(q.get("_id") or q.get("title"))
            if isinstance(answers.get(qid), int) and answers.get(qid) == q.get("correct_answer"):
                correct_mcq += 1

    test_score = int((correct_mcq / total_mcq) * 100) if total_mcq else 0
    pass_percentage = int(settings.get("pass_percentage", 70))
    final_score = test_score
    passed = final_score >= pass_percentage

    attempts.update_one({"_id": att["_id"]}, {"$set": {
        "status": "completed",
        "completed_at": datetime.utcnow(),
        "result": {
            "test_score": test_score,
            "final_score": final_score,
            "passed": passed,
        }
    }})

    return {"test_score": test_score, "final_score": final_score, "passed": passed}


@router.post("/finish")
async def finish_attempt(payload: Dict[str, Any], current_user=Depends(get_current_user)):
    """Finish a certification test attempt. This endpoint marks the attempt as completed.
    Expects: { attempt_id: str }
    Returns: { message: str, result: {...} }
    """
    attempt_id = payload.get("attempt_id")
    if not attempt_id:
        raise HTTPException(status_code=400, detail="attempt_id is required")

    attempts = get_collection("cert_attempts")
    from bson import ObjectId
    
    try:
        att = attempts.find_one({"_id": ObjectId(attempt_id)})
    except Exception:
        att = None
    
    if not att:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if str(att.get("user_id")) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")

    # Check if already completed
    if att.get("status") == "completed":
        return {
            "message": "Test already completed",
            "result": att.get("result", {})
        }

    # Mark as completed
    attempts.update_one(
        {"_id": att["_id"]}, 
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.utcnow(),
            }
        }
    )

    # Return the result if it exists, otherwise return basic completion info
    result = att.get("result", {})
    if not result:
        result = {
            "test_score": 0,
            "final_score": 0,
            "passed": False,
            "message": "Test submitted without grading. Please review your answers."
        }

    return {
        "message": "Test submitted successfully",
        "result": result
    }


@router.post("/run-code")
async def run_code_for_cert(payload: Dict[str, Any], current_user=Depends(get_current_user)):
    """Run code against provided test cases for certification coding questions.
    Expects: { language_id: int, source_code: str, test_cases: [{input, expected_output, is_hidden?}] }
    Returns: { overall_passed, results: [{ test_case_number, passed, input, output, expected_output, error? }], compile_output?, runtime_error? }
    """
    language_id = payload.get("language_id")
    source_code = payload.get("source_code")
    test_cases: List[Dict[str, Any]] = payload.get("test_cases", [])

    if not isinstance(language_id, int) or not isinstance(source_code, str) or not isinstance(test_cases, list):
        raise HTTPException(status_code=400, detail="language_id, source_code, and test_cases are required")

    public_tests = [tc for tc in test_cases if not tc.get("is_hidden", False)] or test_cases
    if not public_tests:
        raise HTTPException(status_code=400, detail="No test cases provided")

    judge0_url = os.getenv("JUDGE0_URL", "http://judge0:2358")
    results: List[Dict[str, Any]] = []
    overall_passed = True

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            for idx, tc in enumerate(public_tests, start=1):
                payload_req = {
                    "language_id": language_id,
                    "source_code": source_code,
                    "stdin": tc.get("input", "")
                }
                try:
                    resp = await client.post(
                        f"{judge0_url}/submissions/?base64_encoded=false&wait=true",
                        json=payload_req
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    stdout = (data.get("stdout") or "").strip()
                    stderr = data.get("stderr")
                    compile_output = data.get("compile_output")
                    message = data.get("message")

                    # Fallback to local executor if Judge0 reports internal error
                    if message and "Internal Error" in str(data.get("status", {}).get("description", "")):
                        local = CodeExecutor.execute_code(source_code, language_id, tc.get("input", ""))
                        stdout = (local.get("stdout") or "").strip()
                        stderr = local.get("stderr")
                        compile_output = local.get("compile_output")

                    expected = (tc.get("expected_output", "") or "").strip()
                    passed = (stderr is None) and (compile_output is None) and (stdout == expected)
                    if not passed:
                        overall_passed = False
                    results.append({
                        "test_case_number": idx,
                        "passed": passed,
                        "input": tc.get("input", ""),
                        "output": stdout,
                        "expected_output": expected,
                        "error": stderr or compile_output or None,
                    })
                except httpx.HTTPError as e:
                    overall_passed = False
                    results.append({
                        "test_case_number": idx,
                        "passed": False,
                        "input": tc.get("input", ""),
                        "output": "",
                        "expected_output": (tc.get("expected_output", "") or "").strip(),
                        "error": str(e),
                    })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution failed: {e}")

    return {
        "overall_passed": overall_passed,
        "results": results,
    }

