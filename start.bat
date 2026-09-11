@echo off
title College Life Scheduler Launcher
echo =========================================================
echo       COLLEGE LIFE SCHEDULER - AUTOMATED LAUNCHER
echo =========================================================
echo.
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "College Scheduler - Backend" cmd /k "cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
start "College Scheduler - Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo =========================================================
echo  Application is running!
echo  - Unified App (Frontend + Backend): http://localhost:8000
echo  - Vite Dev Mode:                  http://localhost:5173
echo  - API Docs (Swagger UI):           http://localhost:8000/docs
echo =========================================================
echo.
echo Opening browser to http://localhost:5173 ...
start http://localhost:5173

pause
