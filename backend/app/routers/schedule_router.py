from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import DaySchedule, WeekScheduleResponse, TodayPlanResponse, UpcomingEventItem
from app.auth import get_current_user
from app.engine import (
    build_schedule_for_date, build_week_schedule,
    build_today_plan, build_upcoming_events
)

router = APIRouter(prefix="/api/schedule", tags=["Schedule Engine"])


@router.get("/today", response_model=TodayPlanResponse)
def get_today_schedule(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Returns today's plan including happening now, up next, and scheduled timeline."""
    return build_today_plan(db, user.id)


@router.get("/day/{target_date}", response_model=DaySchedule)
def get_day_schedule(
    target_date: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Returns the full generated schedule for a specific date (YYYY-MM-DD)."""
    try:
        parsed_date = date.fromisoformat(target_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    return build_schedule_for_date(db, user.id, parsed_date)


@router.get("/week/{target_date}", response_model=WeekScheduleResponse)
def get_week_schedule(
    target_date: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Returns the generated 7-day schedule for the week containing target_date (YYYY-MM-DD)."""
    try:
        parsed_date = date.fromisoformat(target_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    return build_week_schedule(db, user.id, parsed_date)


@router.get("/upcoming", response_model=List[UpcomingEventItem])
def get_upcoming(
    limit: int = Query(default=20, ge=1, le=100),
    from_date: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Returns upcoming events ordered chronologically with countdown metadata."""
    parsed_date = date.today()
    if from_date:
        try:
            parsed_date = date.fromisoformat(from_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    return build_upcoming_events(db, user.id, from_date=parsed_date, limit=limit)
