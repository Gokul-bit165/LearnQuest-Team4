from fastapi import FastAPI
from .routes.health import router as health_router

app = FastAPI(title="Learn Quest API")

app.include_router(health_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
