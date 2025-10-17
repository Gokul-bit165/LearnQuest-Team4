from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.health import router as health_router
from .routes.auth import router as auth_router
from .routes.courses import router as courses_router
from .routes.quizzes import router as quizzes_router
from .routes.users import router as users_router

app = FastAPI(title="Learn Quest API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(quizzes_router)
app.include_router(users_router)

@app.get("/")
async def root():
    return {"message": "Learn Quest API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
