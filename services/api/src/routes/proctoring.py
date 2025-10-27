"""
Proctoring API endpoints
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime

from ..auth import get_current_user
from ..database import get_collection
from ..services.proctoring import get_proctoring_service

router = APIRouter(prefix="/api/ai", tags=["proctoring"])


class ProctorImageRequest(BaseModel):
    attempt_id: str
    image_base64: str  # base64 encoded image
    timestamp: Optional[str] = None


@router.post("/proctor")
async def proctor_image(
    request: ProctorImageRequest,
    current_user=Depends(get_current_user)
):
    """
    Process an image for proctoring violations
    """
    try:
        # Get proctoring service
        proctoring_service = get_proctoring_service()
        
        # Process image
        result = proctoring_service.process_image(request.image_base64)
        
        # Log violations to the attempt if any found
        if result['violations']:
            attempts_collection = get_collection("certification_attempts")
            
            # Get attempt
            attempt_doc = attempts_collection.find_one({
                "_id": ObjectId(request.attempt_id)
            })
            
            if attempt_doc and attempt_doc.get("status") in ["started", "in_progress"]:
                # Calculate behavior score penalty
                penalty = proctoring_service.calculate_behavior_penalty(result['violations'])
                
                # Create event
                event = {
                    "type": "violation_detected",
                    "violations": result['violations'],
                    "penalty": penalty,
                    "metadata": result['metadata'],
                    "timestamp": request.timestamp or datetime.utcnow().isoformat()
                }
                
                # Update behavior score
                new_behavior_score = max(0, attempt_doc.get("behavior_score", 100) + penalty)
                
                # Log to attempt
                attempts_collection.update_one(
                    {"_id": ObjectId(request.attempt_id)},
                    {
                        "$push": {"proctoring_logs": event},
                        "$set": {
                            "behavior_score": new_behavior_score,
                            "status": "in_progress"
                        }
                    }
                )
        
        return {
            "status": "ok",
            "violations": result['violations'],
            "metadata": result['metadata'],
            "face_detected": result['face_detected'],
            "person_count": result['person_count']
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process proctoring image: {str(e)}"
        )


@router.post("/proctor/file")
async def proctor_image_file(
    attempt_id: str,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    """
    Process an uploaded image file for proctoring
    """
    try:
        # Read file
        contents = await file.read()
        
        # Convert to base64
        import base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Create request
        request = ProctorImageRequest(
            attempt_id=attempt_id,
            image_base64=image_base64
        )
        
        # Process using the main endpoint
        return await proctor_image(request, current_user)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process proctoring file: {str(e)}"
        )


class AudioEventRequest(BaseModel):
    attempt_id: str
    audio_features: dict  # RMS, voice_activity, etc.
    timestamp: Optional[str] = None


@router.post("/proctor/audio")
async def log_audio_event(
    request: AudioEventRequest,
    current_user=Depends(get_current_user)
):
    """
    Log audio-based proctoring events
    """
    try:
        attempts_collection = get_collection("certification_attempts")
        
        # Get attempt
        attempt_doc = attempts_collection.find_one({
            "_id": ObjectId(request.attempt_id)
        })
        
        if not attempt_doc:
            raise HTTPException(status_code=404, detail="Attempt not found")
        
        if attempt_doc.get("status") not in ["started", "in_progress"]:
            return {"status": "ignored", "reason": "test_not_active"}
        
        # Detect audio anomalies
        violations = []
        rms = request.audio_features.get("rms", 0)
        voice_activity = request.audio_features.get("voice_activity", False)
        multiple_speakers = request.audio_features.get("multiple_speakers", False)
        
        if rms > 0.8:  # Loud noise threshold
            violations.append("loud_noise")
        
        if multiple_speakers:
            violations.append("multiple_voice_sources")
        
        if not voice_activity and rms < 0.01:
            violations.append("prolonged_silence")
        
        # Create event
        event = {
            "type": "audio_event",
            "violations": violations,
            "audio_features": request.audio_features,
            "timestamp": request.timestamp or datetime.utcnow().isoformat()
        }
        
        # Calculate penalty
        penalty = -5 if violations else 0
        
        # Update behavior score
        new_behavior_score = max(0, attempt_doc.get("behavior_score", 100) + penalty)
        
        # Log to attempt
        attempts_collection.update_one(
            {"_id": ObjectId(request.attempt_id)},
            {
                "$push": {"proctoring_logs": event},
                "$set": {
                    "behavior_score": new_behavior_score
                }
            }
        )
        
        return {
            "status": "ok",
            "violations": violations,
            "behavior_score": new_behavior_score
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to log audio event: {str(e)}"
        )
