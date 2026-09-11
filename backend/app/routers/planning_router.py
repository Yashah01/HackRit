from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, PlanningPeriod
from app.schemas import PlanningPeriodCreate, PlanningPeriodUpdate, PlanningPeriodResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/planning-periods", tags=["Planning Periods"])


@router.get("/", response_model=List[PlanningPeriodResponse])
def get_planning_periods(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(PlanningPeriod).filter(
        PlanningPeriod.user_id == user.id
    ).order_by(PlanningPeriod.start_date.desc()).all()


@router.post("/", response_model=PlanningPeriodResponse)
def create_planning_period(
    period_data: PlanningPeriodCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if period_data.end_date < period_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot precede start date"
        )

    # If new period is active, optionally deactivate other periods
    if period_data.is_active:
        db.query(PlanningPeriod).filter(
            PlanningPeriod.user_id == user.id
        ).update({"is_active": False})

    period = PlanningPeriod(
        user_id=user.id,
        name=period_data.name.strip(),
        start_date=period_data.start_date,
        end_date=period_data.end_date,
        is_active=period_data.is_active
    )
    db.add(period)
    db.commit()
    db.refresh(period)
    return period


@router.put("/{period_id}", response_model=PlanningPeriodResponse)
def update_planning_period(
    period_id: int,
    update_data: PlanningPeriodUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    period = db.query(PlanningPeriod).filter(
        PlanningPeriod.id == period_id,
        PlanningPeriod.user_id == user.id
    ).first()
    if not period:
        raise HTTPException(status_code=404, detail="Planning period not found")

    new_start = update_data.start_date or period.start_date
    new_end = update_data.end_date or period.end_date
    if new_end < new_start:
        raise HTTPException(status_code=400, detail="End date cannot precede start date")

    if update_data.name is not None:
        period.name = update_data.name.strip()
    if update_data.start_date is not None:
        period.start_date = update_data.start_date
    if update_data.end_date is not None:
        period.end_date = update_data.end_date
    if update_data.is_active is not None:
        if update_data.is_active:
            # Set other periods to inactive
            db.query(PlanningPeriod).filter(
                PlanningPeriod.user_id == user.id,
                PlanningPeriod.id != period_id
            ).update({"is_active": False})
        period.is_active = update_data.is_active

    db.commit()
    db.refresh(period)
    return period


@router.delete("/{period_id}")
def delete_planning_period(
    period_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    period = db.query(PlanningPeriod).filter(
        PlanningPeriod.id == period_id,
        PlanningPeriod.user_id == user.id
    ).first()
    if not period:
        raise HTTPException(status_code=404, detail="Planning period not found")

    db.delete(period)
    db.commit()
    return {"message": "Planning period deleted successfully"}
