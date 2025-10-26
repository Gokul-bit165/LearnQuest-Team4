from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import os
import tempfile
import base64

from ..models.proctoring import (
    TestSession, ProctoringConfig, ProctoringSession, 
    CertificateRequest, CertificateResponse, ViolationType
)
from ..services.proctoring_service import ProctoringService
from ..services.realtime_monitor import RealTimeMonitor
from ..database import get_database

router = APIRouter(prefix="/api/proctoring", tags=["proctoring"])

# Initialize services
proctoring_service = ProctoringService(ProctoringConfig())
realtime_monitor = RealTimeMonitor(proctoring_service)

logger = logging.getLogger(__name__)

@router.post("/register-face")
async def register_user_face(
    user_id: str = Form(...),
    face_image: UploadFile = File(...)
):
    """Register user's face for identity verification"""
    try:
        # Save uploaded image temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            content = await face_image.read()
            temp_file.write(content)
            temp_file.flush()
            
            # Register face
            success = proctoring_service.register_user_face(user_id, temp_file.name)
            
            # Clean up temp file
            os.unlink(temp_file.name)
            
            if success:
                return {"message": "Face registered successfully", "user_id": user_id}
            else:
                raise HTTPException(status_code=400, detail="Failed to register face")
                
    except Exception as e:
        logger.error(f"Face registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/start-session")
async def start_proctoring_session(
    session_id: str,
    user_id: str,
    test_session_id: str,
    config: ProctoringConfig
):
    """Start a new proctoring session"""
    try:
        success = realtime_monitor.start_session(
            session_id=session_id,
            user_id=user_id,
            test_session_id=test_session_id,
            config=config
        )
        
        if success:
            return {"message": "Proctoring session started", "session_id": session_id}
        else:
            raise HTTPException(status_code=400, detail="Failed to start session")
            
    except Exception as e:
        logger.error(f"Session start error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stop-session/{session_id}")
async def stop_proctoring_session(session_id: str):
    """Stop a proctoring session"""
    try:
        success = realtime_monitor.stop_session(session_id)
        
        if success:
            return {"message": "Proctoring session stopped", "session_id": session_id}
        else:
            raise HTTPException(status_code=400, detail="Failed to stop session")
            
    except Exception as e:
        logger.error(f"Session stop error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-frame/{session_id}")
async def process_video_frame(
    session_id: str,
    frame_data: str = Form(...)
):
    """Process a video frame for proctoring analysis"""
    try:
        result = realtime_monitor.process_video_frame(session_id, frame_data)
        return result
        
    except Exception as e:
        logger.error(f"Frame processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session-status/{session_id}")
async def get_session_status(session_id: str):
    """Get current status of a proctoring session"""
    try:
        status = realtime_monitor.get_session_status(session_id)
        
        if status:
            return status
        else:
            raise HTTPException(status_code=404, detail="Session not found")
            
    except Exception as e:
        logger.error(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active-sessions")
async def get_active_sessions():
    """Get all active proctoring sessions"""
    try:
        sessions = realtime_monitor.get_all_active_sessions()
        return {"active_sessions": sessions}
        
    except Exception as e:
        logger.error(f"Active sessions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save-test-session")
async def save_test_session(test_session: TestSession):
    """Save test session results to database"""
    try:
        db = await get_database()
        collection = db["test_sessions"]
        
        # Convert to dict for MongoDB
        session_dict = test_session.dict()
        session_dict["created_at"] = datetime.now()
        
        # Insert or update
        result = collection.replace_one(
            {"user_id": test_session.user_id, "course_id": test_session.course_id},
            session_dict,
            upsert=True
        )
        
        return {
            "message": "Test session saved",
            "session_id": str(result.upserted_id) if result.upserted_id else "updated"
        }
        
    except Exception as e:
        logger.error(f"Save test session error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/issue-certificate")
async def issue_certificate(cert_request: CertificateRequest):
    """Issue a certificate based on test results"""
    try:
        # Calculate final score
        final_score = proctoring_service.calculate_final_score(
            cert_request.test_score,
            cert_request.behavior_score
        )
        
        # Check if certificate should be issued
        should_issue = proctoring_service.should_issue_certificate(
            final_score,
            cert_request.violations
        )
        
        # Generate certificate
        certificate_id = f"CERT_{cert_request.user_id}_{cert_request.course_id}_{int(datetime.now().timestamp())}"
        verification_code = f"V{certificate_id[-8:].upper()}"
        
        certificate_response = CertificateResponse(
            certificate_id=certificate_id,
            user_id=cert_request.user_id,
            course_id=cert_request.course_id,
            topic=cert_request.topic,
            difficulty=cert_request.difficulty,
            final_score=final_score,
            certificate_status="issued" if should_issue else "not_issued",
            issued_at=datetime.now(),
            verification_code=verification_code
        )
        
        # Save to database
        db = await get_database()
        certificates_collection = db["certificates"]
        
        cert_dict = certificate_response.dict()
        cert_dict["test_details"] = {
            "test_score": cert_request.test_score,
            "behavior_score": cert_request.behavior_score,
            "violations": [v.dict() for v in cert_request.violations],
            "test_duration": cert_request.test_duration,
            "total_questions": cert_request.total_questions,
            "correct_answers": cert_request.correct_answers
        }
        
        certificates_collection.insert_one(cert_dict)
        
        return certificate_response
        
    except Exception as e:
        logger.error(f"Certificate issuance error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/certificate/{certificate_id}")
async def get_certificate(certificate_id: str):
    """Get certificate details by ID"""
    try:
        db = await get_database()
        collection = db["certificates"]
        
        certificate = collection.find_one({"certificate_id": certificate_id})
        
        if certificate:
            # Remove MongoDB _id field
            certificate.pop("_id", None)
            return certificate
        else:
            raise HTTPException(status_code=404, detail="Certificate not found")
            
    except Exception as e:
        logger.error(f"Get certificate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-certificates/{user_id}")
async def get_user_certificates(user_id: str):
    """Get all certificates for a user"""
    try:
        db = await get_database()
        collection = db["certificates"]
        
        certificates = list(collection.find({"user_id": user_id}))
        
        # Remove MongoDB _id fields
        for cert in certificates:
            cert.pop("_id", None)
        
        return {"certificates": certificates}
        
    except Exception as e:
        logger.error(f"Get user certificates error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/verify-certificate/{verification_code}")
async def verify_certificate(verification_code: str):
    """Verify a certificate using verification code"""
    try:
        db = await get_database()
        collection = db["certificates"]
        
        certificate = collection.find_one({"verification_code": verification_code})
        
        if certificate:
            certificate.pop("_id", None)
            return {
                "valid": True,
                "certificate": certificate
            }
        else:
            return {"valid": False, "message": "Invalid verification code"}
            
    except Exception as e:
        logger.error(f"Certificate verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-sessions/{user_id}")
async def get_user_test_sessions(user_id: str):
    """Get all test sessions for a user"""
    try:
        db = await get_database()
        collection = db["test_sessions"]
        
        sessions = list(collection.find({"user_id": user_id}))
        
        # Remove MongoDB _id fields
        for session in sessions:
            session.pop("_id", None)
        
        return {"test_sessions": sessions}
        
    except Exception as e:
        logger.error(f"Get test sessions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
