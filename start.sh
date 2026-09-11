#!/bin/bash
echo "========================================================="
echo "      COLLEGE LIFE SCHEDULER - AUTOMATED LAUNCHER"
echo "========================================================="
echo ""

echo "[1/2] Starting FastAPI Backend on http://0.0.0.0:8000..."
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

echo "[2/2] Starting React Frontend on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================================="
echo " Application is running!"
echo " - Unified App (Frontend + Backend): http://localhost:8000"
echo " - Vite Dev Mode:                  http://localhost:5173"
echo " - API Docs (Swagger UI):           http://localhost:8000/docs"
echo "========================================================="
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
