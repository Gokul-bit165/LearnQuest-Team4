"""
Simplified AI endpoints for Learn Quest.
Provides basic AI coaching functionality using Ollama.
"""

import os
import requests
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from ..auth import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

class Message(BaseModel):
    role: str
    content: str

class CoachRequest(BaseModel):
    messages: List[Message]

class CoachResponse(BaseModel):
    response: str

@router.post("/coach", response_model=CoachResponse)
async def ai_coach(
    request: CoachRequest, 
    current_user: User = Depends(get_current_user)
):
    """
    AI Coach endpoint for personalized learning guidance and motivation.
    This is Questie, a friendly AI learning coach focused on personalization and motivation.
    """
    try:
        # Get complete user profile from database
        from ..database import get_collection
        from bson import ObjectId
        
        users_collection = get_collection("users")
        user_data = users_collection.find_one({"_id": ObjectId(current_user.id)})
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Create Questie's system prompt with user data
        system_prompt = f"""You are 'Questie,' a friendly and encouraging AI learning coach for the Learn Quest platform. You are like a personal friend and mentor.

Your goal is to motivate the user by asking them questions about their progress, celebrating their achievements (like leveling up or high quiz scores), and helping them decide what to learn next based on their history. Do not answer deep technical questions; instead, gently guide them to the 'AI Tutor' within a specific course for that.

Here is the user's current status:
- Name: {user_data.get('name', 'Student')}
- Level: {user_data.get('level', 1)}
- XP: {user_data.get('xp', 0)}
- Recent quiz history: {user_data.get('quiz_history', [])}
- Enrolled courses: {user_data.get('enrolled_courses', [])}

Use this information to have a personalized and motivational conversation. Be encouraging, ask about their learning goals, celebrate their progress, and suggest next steps. Keep responses conversational and friendly."""

        # Prepare messages for Ollama
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add chat history
        for msg in request.messages:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Call Ollama with llama3
        payload = {
            "model": "llama3",
            "messages": messages,
            "stream": False
        }
        
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        
        ai_response = result.get("message", {}).get("content", "I'm here to help you on your learning journey!")
        
        return CoachResponse(response=ai_response)
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Coach service unavailable: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Coach processing failed: {str(e)}"
        )

@router.get("/health")
async def ai_health():
    """Check if AI services are available"""
    try:
        # Check if Ollama is available
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        response.raise_for_status()
        
        models = response.json().get("models", [])
        llama3_available = any("llama3" in model.get("name", "") for model in models)
        
        return {
            "status": "healthy",
            "ollama_available": True,
            "llama3_available": llama3_available,
            "models": [model.get("name") for model in models]
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "ollama_available": False,
            "error": str(e)
        }
