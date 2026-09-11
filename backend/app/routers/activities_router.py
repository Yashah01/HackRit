import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, RecurringActivity, PlanningPeriod
from app.schemas import RecurringActivityCreate, RecurringActivityUpdate, RecurringActivityResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/activities", tags=["Recurring Activities"])


def serialize_activity(act: RecurringActivity) -> RecurringActivityResponse:
    try:
        days = json.loads(act.days_of_week)
    except Exception:
        days = [d.strip() for d in act.days_of_week.split(",") if d.strip()]

    return RecurringActivityResponse(
        id=act.id,
        user_id=act.user_id,
        planning_period_id=act.planning_period_id,
        title=act.title,
        category=act.category,
        days_of_week=days,
        start_time=act.start_time,
        end_time=act.end_time,
        location=act.location,
        notes=act.notes,
        color=act.color,
        created_at=act.created_at
    )


@router.get("/", response_model=List[RecurringActivityResponse])
def get_activities(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    activities = db.query(RecurringActivity).filter(
        RecurringActivity.user_id == user.id
    ).order_by(RecurringActivity.start_time.asc()).all()
    return [serialize_activity(a) for a in activities]


@router.post("/", response_model=RecurringActivityResponse)
def create_activity(
    act_data: RecurringActivityCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Verify planning period ownership if provided
    if act_data.planning_period_id:
        period = db.query(PlanningPeriod).filter(
            PlanningPeriod.id == act_data.planning_period_id,
            PlanningPeriod.user_id == user.id
        ).first()
        if not period:
            raise HTTPException(status_code=404, detail="Specified planning period not found")
    else:
        # Default to user's first active planning period if available
        active = db.query(PlanningPeriod).filter(
            PlanningPeriod.user_id == user.id,
            PlanningPeriod.is_active == True
        ).first()
        if active:
            act_data.planning_period_id = active.id

    new_act = RecurringActivity(
        user_id=user.id,
        planning_period_id=act_data.planning_period_id,
        title=act_data.title.strip(),
        category=act_data.category or "College",
        days_of_week=json.dumps(act_data.days_of_week),
        start_time=act_data.start_time,
        end_time=act_data.end_time,
        location=act_data.location,
        notes=act_data.notes,
        color=act_data.color or "#4F46E5"
    )
    db.add(new_act)
    db.commit()
    db.refresh(new_act)
    return serialize_activity(new_act)


@router.put("/{act_id}", response_model=RecurringActivityResponse)
def update_activity(
    act_id: int,
    update_data: RecurringActivityUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    act = db.query(RecurringActivity).filter(
        RecurringActivity.id == act_id,
        RecurringActivity.user_id == user.id
    ).first()
    if not act:
        raise HTTPException(status_code=404, detail="Recurring activity not found")

    new_start = update_data.start_time or act.start_time
    new_end = update_data.end_time or act.end_time
    if new_end <= new_start:
        raise HTTPException(status_code=400, detail="End time must be after start time")

    if update_data.title is not None:
        act.title = update_data.title.strip()
    if update_data.category is not None:
        act.category = update_data.category
    if update_data.days_of_week is not None:
        act.days_of_week = json.dumps(update_data.days_of_week)
    if update_data.start_time is not None:
        act.start_time = update_data.start_time
    if update_data.end_time is not None:
        act.end_time = update_data.end_time
    if update_data.planning_period_id is not None:
        period = db.query(PlanningPeriod).filter(
            PlanningPeriod.id == update_data.planning_period_id,
            PlanningPeriod.user_id == user.id
        ).first()
        if not period:
            raise HTTPException(status_code=404, detail="Planning period not found")
        act.planning_period_id = update_data.planning_period_id
    if update_data.location is not None:
        act.location = update_data.location
    if update_data.notes is not None:
        act.notes = update_data.notes
    if update_data.color is not None:
        act.color = update_data.color

    db.commit()
    db.refresh(act)
    return serialize_activity(act)


@router.delete("/{act_id}")
def delete_activity(
    act_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    act = db.query(RecurringActivity).filter(
        RecurringActivity.id == act_id,
        RecurringActivity.user_id == user.id
    ).first()
    if not act:
        raise HTTPException(status_code=404, detail="Recurring activity not found")

    db.delete(act)
    db.commit()
    return {"message": "Recurring activity deleted successfully"}
