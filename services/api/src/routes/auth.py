from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from datetime import timedelta
from ..models.user import User
from ..auth import verify_password, create_access_token, get_current_user
from ..database import get_collection

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Authenticate user and return JWT token"""
    try:
        # Get user from database
        users_collection = get_collection("users")
        user_data = users_collection.find_one({"email": request.email})
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Verify password
        if not verify_password(request.password, user_data["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": str(user_data["_id"])}, 
            expires_delta=access_token_expires
        )
        
        # Prepare user data for response (exclude password_hash)
        user_response = {
            "id": str(user_data["_id"]),
            "name": user_data["name"],
            "email": user_data["email"],
            "avatar_url": user_data.get("avatar_url"),
            "auth_provider": user_data.get("auth_provider", "email"),
            "xp": user_data.get("xp", 0),
            "level": user_data.get("level", 1),
            "badges": user_data.get("badges", [])
        }
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
        "auth_provider": current_user.auth_provider,
        "xp": current_user.xp,
        "level": current_user.level,
        "badges": current_user.badges,
        "enrolled_courses": current_user.enrolled_courses,
        "quiz_history": current_user.quiz_history
    }
