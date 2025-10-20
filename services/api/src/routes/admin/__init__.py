from fastapi import APIRouter
from . import courses, quizzes, problems

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Include admin sub-routers
router.include_router(courses.router, prefix="/courses", tags=["admin-courses"])
router.include_router(quizzes.router, prefix="/quizzes", tags=["admin-quizzes"])
router.include_router(problems.router, prefix="/problems", tags=["admin-problems"])

