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
        if not verify_password(request.password, user_data["password"]):
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
            "role": user_data.get("role", "student"),
            "xp": user_data.get("xp", 0),
            "level": user_data.get("level", 1),
            "badges": user_data.get("badges", []),
            "completed_topics": user_data.get("completed_topics", []),
            "completed_modules": user_data.get("completed_modules", [])
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
    """Get current user information (fresh from DB to include progress fields)."""
    users_collection = get_collection("users")
    doc = users_collection.find_one({"_id": __import__('bson').ObjectId(current_user.id)})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", current_user.name),
        "email": doc.get("email", current_user.email),
        "avatar_url": doc.get("avatar_url"),
        "auth_provider": doc.get("auth_provider", "email"),
        "role": doc.get("role", "student"),
        "xp": doc.get("xp", 0),
        "level": doc.get("level", 1),
        "badges": doc.get("badges", []),
        "enrolled_courses": doc.get("enrolled_courses", []),
        "quiz_history": doc.get("quiz_history", []),
        "completed_topics": doc.get("completed_topics", []),
        "completed_modules": doc.get("completed_modules", [])
    }
