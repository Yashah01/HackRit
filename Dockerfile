# Multi-stage Dockerfile: Frontend Build + Python Backend Server
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Final Stage: Python FastAPI Backend
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV DATABASE_URL="sqlite:///./college_scheduler.db"

# Install backend dependencies
COPY backend/pyproject.toml backend/
RUN pip install --no-cache-dir fastapi "uvicorn[standard]" sqlalchemy pydantic python-multipart pyjwt bcrypt pytest httpx email-validator

COPY backend/ /app/backend/
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 8000

WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
