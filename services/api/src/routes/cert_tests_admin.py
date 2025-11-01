from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi import status
from typing import List
from datetime import datetime
import json

# Reuse existing auth and db helpers (relative imports from routes/)
from ..auth import require_admin_user  # type: ignore
from ..database import get_collection  # type: ignore

router = APIRouter(prefix="/api/admin/cert-tests", tags=["admin-cert-tests"])


def _parse_questions(file_bytes: bytes) -> List[dict]:
    try:
        data = json.loads(file_bytes.decode("utf-8"))
        if not isinstance(data, list):
            raise ValueError("JSON root must be a list of questions")
        parsed: List[dict] = []
        for q in data:
            if not isinstance(q, dict):
                continue
            qtype = (q.get("type") or "mcq").lower()
            title = q.get("title") or q.get("problem_statement")
            if not title:
                continue
            if qtype == "mcq":
                options = q.get("options", [])
                if not isinstance(options, list) or len(options) == 0:
                    continue
                # correct_answer must be an index (int)
                if not isinstance(q.get("correct_answer"), int):
                    continue
                parsed.append(q)
            elif qtype == "code":
                # Require test_cases list
                tcs = q.get("test_cases")
                if not isinstance(tcs, list) or len(tcs) == 0:
                    continue
                parsed.append(q)
            else:
                # Unknown type - skip
                continue
        return parsed
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid JSON: {e}")


@router.get("/banks")
async def list_banks(admin_user=Depends(require_admin_user)):
    col = get_collection("cert_test_banks")
    items = list(col.find({}, {"questions": 0}))
    for it in items:
        it["id"] = str(it.pop("_id"))
    return items


@router.post("/banks")
async def upload_banks(files: List[UploadFile] = File(...), admin_user=Depends(require_admin_user)):
    col = get_collection("cert_test_banks")
    saved = []
    for f in files:
        content = await f.read()
        questions = _parse_questions(content)
        doc = {
            "file_name": f.filename,
            "display_name": f.filename,
            "question_count": len(questions),
            "questions": questions,
            "created_at": datetime.utcnow(),
            "created_by": str(admin_user.id),
        }
        inserted = col.insert_one(doc)
        saved.append({"id": str(inserted.inserted_id), "file_name": f.filename, "question_count": len(questions)})
    return {"uploaded": saved}


@router.get("/banks/{bank_id}")
async def get_bank(bank_id: str, admin_user=Depends(require_admin_user)):
    """Get a specific question bank with all questions"""
    from bson import ObjectId
    col = get_collection("cert_test_banks")
    try:
        bank = col.find_one({"_id": ObjectId(bank_id)})
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid bank ID")
    
    if not bank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bank not found")
    
    bank["id"] = str(bank.pop("_id"))
    return bank


@router.delete("/banks/{bank_id}")
async def delete_bank(bank_id: str, admin_user=Depends(require_admin_user)):
    """Delete a question bank"""
    from bson import ObjectId
    col = get_collection("cert_test_banks")
    try:
        result = col.delete_one({"_id": ObjectId(bank_id)})
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid bank ID")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bank not found")
    
    return {"message": "Bank deleted successfully"}


@router.put("/banks/{bank_id}")
async def update_bank(bank_id: str, payload: dict, admin_user=Depends(require_admin_user)):
    """Update a question bank"""
    from bson import ObjectId
    col = get_collection("cert_test_banks")
    
    # Extract updatable fields
    update_fields = {}
    if "display_name" in payload:
        update_fields["display_name"] = payload["display_name"]
    if "questions" in payload:
        update_fields["questions"] = payload["questions"]
        update_fields["question_count"] = len(payload["questions"])
    
    if not update_fields:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    
    update_fields["updated_at"] = datetime.utcnow()
    update_fields["updated_by"] = str(admin_user.id)
    
    try:
        result = col.update_one({"_id": ObjectId(bank_id)}, {"$set": update_fields})
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid bank ID")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bank not found")
    
    return {"message": "Bank updated successfully"}


@router.get("/specs")
async def list_specs(admin_user=Depends(require_admin_user)):
    col = get_collection("cert_test_specs")
    items = list(col.find({}))
    for it in items:
        it["_id"] = str(it["_id"])
    return items


@router.get("/specs/{cert_id}/{difficulty}")
async def get_spec(cert_id: str, difficulty: str, admin_user=Depends(require_admin_user)):
    col = get_collection("cert_test_specs")
    spec = col.find_one({"cert_id": cert_id, "difficulty": difficulty})
    if not spec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Spec not found")
    spec["_id"] = str(spec["_id"])
    return spec


@router.post("/specs")
async def create_spec(payload: dict, admin_user=Depends(require_admin_user)):
    required = ["cert_id", "difficulty", "question_count", "duration_minutes", "pass_percentage"]
    for key in required:
        if key not in payload:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Missing field: {key}")

    # Support both bank_ids (MCQ) and problem_ids (coding problems)
    if "bank_ids" not in payload:
        payload["bank_ids"] = []
    
    # Map problem_ids to question_ids for consistency
    if "problem_ids" in payload:
        payload["question_ids"] = payload["problem_ids"]
    elif "question_ids" not in payload:
        payload["question_ids"] = []

    col = get_collection("cert_test_specs")
    payload["created_at"] = datetime.utcnow()
    payload["created_by"] = str(admin_user.id)

    col.update_one({"cert_id": payload["cert_id"], "difficulty": payload["difficulty"]}, {"$set": payload}, upsert=True)
    return {"message": "Spec saved"}


@router.delete("/specs/{cert_id}/{difficulty}")
async def delete_spec(cert_id: str, difficulty: str, admin_user=Depends(require_admin_user)):
    col = get_collection("cert_test_specs")
    res = col.delete_one({"cert_id": cert_id, "difficulty": difficulty})
    if res.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Spec not found")
    return {"message": "Spec deleted"}


@router.patch("/specs/{cert_id}/{difficulty}/status")
async def update_spec_status(cert_id: str, difficulty: str, payload: dict, admin_user=Depends(require_admin_user)):
    """Toggle active status or update status fields for a spec.
    Expected payload: { "active": bool }
    """
    col = get_collection("cert_test_specs")
    update_fields = {}
    if "active" in payload:
        update_fields["active"] = bool(payload["active"])  # normalize
    if not update_fields:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No updatable fields provided")
    res = col.update_one({"cert_id": cert_id, "difficulty": difficulty}, {"$set": update_fields})
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Spec not found")
    return {"message": "Spec updated", "updated": update_fields}


@router.post("/specs/{cert_id}/{difficulty}/delete")
async def delete_spec_fallback(cert_id: str, difficulty: str, admin_user=Depends(require_admin_user)):
    """Fallback deletion for environments that block DELETE method."""
    col = get_collection("cert_test_specs")
    res = col.delete_one({"cert_id": cert_id, "difficulty": difficulty})
    if res.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Spec not found")
    return {"message": "Spec deleted"}

