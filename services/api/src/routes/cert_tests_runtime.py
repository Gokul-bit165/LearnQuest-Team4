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
    if not topic_id or not difficulty:
        raise HTTPException(status_code=400, detail="topic_id and difficulty are required")

    specs = get_collection("cert_test_specs")
    spec = specs.find_one({"cert_id": topic_id, "difficulty": difficulty})
    if not spec:
        raise HTTPException(status_code=404, detail="Test spec not found")

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
    return {"attempt_id": str(ins.inserted_id), "settings": settings}


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

    # Load questions from selected banks
    pool = []
    from bson import ObjectId
    if bank_ids:
        for bid in bank_ids:
            try:
                b = banks.find_one({"_id": ObjectId(bid)})
            except Exception:
                b = banks.find_one({"file_name": bid})
            if b and isinstance(b.get("questions"), list):
                pool.extend(b["questions"]) 
    else:
        # If no banks specified, take all
        for b in banks.find({}):
            if isinstance(b.get("questions"), list):
                pool.extend(b["questions"]) 

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

