from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Event
from app.schemas import EventCreate, EventUpdate, EventResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.get("/", response_model=List[EventResponse])
def get_events(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    event_type: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(Event).filter(Event.user_id == user.id)

    if start_date:
        query = query.filter(Event.end_date >= start_date)
    if end_date:
        query = query.filter(Event.start_date <= end_date)
    if event_type:
        query = query.filter(Event.event_type == event_type)

    return query.order_by(Event.start_date.asc(), Event.start_time.asc()).all()


@router.post("/", response_model=EventResponse)
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if event_data.end_date < event_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot precede start date"
        )

    if (
        event_data.start_date == event_data.end_date
        and event_data.start_time
        and event_data.end_time
        and event_data.end_time < event_data.start_time
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time cannot precede start time on same-day event"
        )

    new_event = Event(
        user_id=user.id,
        title=event_data.title.strip(),
        event_type=event_data.event_type or "Event",
        start_date=event_data.start_date,
        end_date=event_data.end_date,
        start_time=event_data.start_time,
        end_time=event_data.end_time,
        is_all_day=event_data.is_all_day,
        location=event_data.location,
        notes=event_data.notes,
        color=event_data.color or "#059669"
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    update_data: EventUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.user_id == user.id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    new_start_date = update_data.start_date or event.start_date
    new_end_date = update_data.end_date or event.end_date
    if new_end_date < new_start_date:
        raise HTTPException(status_code=400, detail="End date cannot precede start date")

    if update_data.title is not None:
        event.title = update_data.title.strip()
    if update_data.event_type is not None:
        event.event_type = update_data.event_type
    if update_data.start_date is not None:
        event.start_date = update_data.start_date
    if update_data.end_date is not None:
        event.end_date = update_data.end_date
    if update_data.start_time is not None:
        event.start_time = update_data.start_time
    if update_data.end_time is not None:
        event.end_time = update_data.end_time
    if update_data.is_all_day is not None:
        event.is_all_day = update_data.is_all_day
    if update_data.location is not None:
        event.location = update_data.location
    if update_data.notes is not None:
        event.notes = update_data.notes
    if update_data.color is not None:
        event.color = update_data.color

    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.user_id == user.id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}
