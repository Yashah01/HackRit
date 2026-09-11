import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.database import engine, Base
from app.routers import (
    auth_router,
    planning_router,
    activities_router,
    events_router,
    schedule_router,
    attendance_router,
    demo_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically create tables if not existing
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="College Life Scheduler API",
    description="Multi-user, student-focused scheduling and academic planning engine.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite dev server and production frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router)
app.include_router(planning_router.router)
app.include_router(activities_router.router)
app.include_router(events_router.router)
app.include_router(schedule_router.router)
app.include_router(attendance_router.router)
app.include_router(demo_router.router)


@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "healthy"}


# Locate compiled frontend assets
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")

if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # If file exists in frontend dist root (e.g. favicon or manifest), serve it
    file_path = os.path.join(FRONTEND_DIST, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    # Fallback to SPA index.html
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)

    return {
        "app": "College Life Scheduler API",
        "status": "online",
        "docs": "/docs",
        "message": "Frontend build not found. Run 'npm run build' inside frontend/"
    }
