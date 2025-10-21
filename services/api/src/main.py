from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.health import router as health_router
from .routes.auth import router as auth_router
from .routes.courses import router as courses_router
from .routes.quizzes import router as quizzes_router
from .routes.users import router as users_router
from .routes.ai import router as ai_router
from .routes.lessons import router as lessons_router
from .routes.problems import router as problems_router
from .routes.admin import router as admin_router  # base admin router
from .routes.admin_users import router as admin_users_router

app = FastAPI(title="Learn Quest API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Web frontend
        "http://localhost:5173",  # Web frontend dev server
        "http://localhost:5174",  # Admin frontend
        "http://localhost:8080",  # Alternative admin port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173", 
        "http://127.0.0.1:5174",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(quizzes_router)
app.include_router(users_router)
app.include_router(ai_router)
app.include_router(lessons_router)
app.include_router(problems_router)
app.include_router(admin_router)
app.include_router(admin_users_router)

@app.get("/")
async def root():
    return {"message": "Learn Quest API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
