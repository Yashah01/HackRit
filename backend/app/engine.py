import json
from datetime import date, datetime, timedelta, time
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models import PlanningPeriod, RecurringActivity, Event
from app.schemas import (
    ScheduleItem, DaySchedule, WeekScheduleResponse,
    TodayPlanResponse, UpcomingEventItem
)

WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
FULL_DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def get_weekday_code(d: date) -> str:
    """Returns 'Mon', 'Tue', etc. for a given date."""
    return WEEKDAY_NAMES[d.weekday()]


def parse_days_of_week(raw: str) -> List[str]:
    """Parses JSON or comma-separated days of week string."""
    try:
        return json.loads(raw)
    except Exception:
        return [d.strip() for d in raw.split(",") if d.strip()]


def is_time_between(check_time: time, start_str: Optional[str], end_str: Optional[str]) -> bool:
    """Determines if a given time falls between start_time and end_time (HH:MM)."""
    if not start_str or not end_str:
        return False
    try:
        sh, sm = map(int, start_str.split(":"))
        eh, em = map(int, end_str.split(":"))
        start_t = time(sh, sm)
        end_t = time(eh, em)
        return start_t <= check_time <= end_t
    except Exception:
        return False


def get_item_status(item_date: date, start_str: Optional[str], end_str: Optional[str], current_dt: datetime) -> str:
    """Computes whether a schedule item is past, now, or upcoming."""
    current_date = current_dt.date()
    current_time = current_dt.time()

    if item_date < current_date:
        return "past"
    elif item_date > current_date:
        return "upcoming"

    # item_date == current_date
    if not start_str or not end_str:
        return "now"

    try:
        sh, sm = map(int, start_str.split(":"))
        eh, em = map(int, end_str.split(":"))
        start_t = time(sh, sm)
        end_t = time(eh, em)

        if current_time < start_t:
            return "upcoming"
        elif start_t <= current_time <= end_t:
            return "now"
        else:
            return "past"
    except Exception:
        return "upcoming"


def get_active_planning_periods_for_user(db: Session, user_id: int) -> List[PlanningPeriod]:
    return db.query(PlanningPeriod).filter(
        PlanningPeriod.user_id == user_id,
        PlanningPeriod.is_active == True
    ).all()


def build_schedule_for_date(
    db: Session,
    user_id: int,
    target_date: date,
    current_dt: Optional[datetime] = None
) -> DaySchedule:
    """Core Scheduling Engine logic for a single day.
    Expands recurring activities bounded by planning periods and merges with events."""
    if current_dt is None:
        current_dt = datetime.now()

    weekday_code = get_weekday_code(target_date)
    full_day_name = FULL_DAY_NAMES[target_date.weekday()]
    items: List[ScheduleItem] = []

    # 1. Fetch recurring activities for user
    activities = db.query(RecurringActivity).filter(RecurringActivity.user_id == user_id).all()

    # Pre-fetch planning periods lookup
    periods_by_id = {
        p.id: p for p in db.query(PlanningPeriod).filter(PlanningPeriod.user_id == user_id).all()
    }

    for act in activities:
        # Check planning period boundaries
        if act.planning_period_id:
            period = periods_by_id.get(act.planning_period_id)
            if not period or not period.is_active:
                continue
            if target_date < period.start_date or target_date > period.end_date:
                # Outside planning period boundaries!
                continue
        else:
            # If no planning period assigned, check if user has active periods
            active_periods = [p for p in periods_by_id.values() if p.is_active]
            if active_periods:
                # Must fall within at least one active period
                in_any = any(p.start_date <= target_date <= p.end_date for p in active_periods)
                if not in_any:
                    continue

        # Check weekday match
        act_days = parse_days_of_week(act.days_of_week)
        if weekday_code in act_days:
            status = get_item_status(target_date, act.start_time, act.end_time, current_dt)
            items.append(ScheduleItem(
                id=f"rec_{act.id}_{target_date.isoformat()}",
                source_id=act.id,
                source_type="recurring",
                title=act.title,
                category=act.category or "College",
                date=target_date.isoformat(),
                start_time=act.start_time,
                end_time=act.end_time,
                is_all_day=False,
                is_multi_day=False,
                location=act.location,
                notes=act.notes,
                color=act.color or "#4F46E5",
                status=status
            ))

    # 2. Fetch events overlapping target_date
    events = db.query(Event).filter(
        Event.user_id == user_id,
        Event.start_date <= target_date,
        Event.end_date >= target_date
    ).all()

    for evt in events:
        is_multi_day = evt.start_date != evt.end_date
        status = get_item_status(target_date, evt.start_time, evt.end_time, current_dt)
        items.append(ScheduleItem(
            id=f"evt_{evt.id}_{target_date.isoformat()}",
            source_id=evt.id,
            source_type="event",
            title=evt.title,
            category=evt.event_type or "Event",
            date=target_date.isoformat(),
            start_time=evt.start_time,
            end_time=evt.end_time,
            is_all_day=evt.is_all_day,
            is_multi_day=is_multi_day,
            multi_day_start=evt.start_date.isoformat() if is_multi_day else None,
            multi_day_end=evt.end_date.isoformat() if is_multi_day else None,
            location=evt.location,
            notes=evt.notes,
            color=evt.color or "#059669",
            status=status
        ))

    # 3. Sort chronologically:
    # All-day and multi-day events without time first, then by start_time
    def sort_key(item: ScheduleItem):
        if item.is_all_day or not item.start_time:
            return (0, "")
        return (1, item.start_time)

    items.sort(key=sort_key)

    return DaySchedule(
        date=target_date.isoformat(),
        day_name=full_day_name,
        formatted_date=target_date.strftime("%d %B %Y"),
        is_today=(target_date == current_dt.date()),
        items=items,
        total_items=len(items)
    )


def build_week_schedule(
    db: Session,
    user_id: int,
    reference_date: date,
    current_dt: Optional[datetime] = None
) -> WeekScheduleResponse:
    """Builds a full 7-day week schedule starting from Monday containing reference_date."""
    if current_dt is None:
        current_dt = datetime.now()

    # Calculate Monday of this week (weekday() returns 0 for Monday)
    start_of_week = reference_date - timedelta(days=reference_date.weekday())
    end_of_week = start_of_week + timedelta(days=6)

    # Active planning period name
    active_periods = get_active_planning_periods_for_user(db, user_id)
    planning_period_name = None
    is_within = False
    if active_periods:
        active = active_periods[0]
        planning_period_name = f"{active.name} ({active.start_date.strftime('%b %d')} - {active.end_date.strftime('%b %d')})"
        # Check if week overlaps with active planning period
        is_within = not (end_of_week < active.start_date or start_of_week > active.end_date)

    days: List[DaySchedule] = []
    for day_offset in range(7):
        current_day = start_of_week + timedelta(days=day_offset)
        days.append(build_schedule_for_date(db, user_id, current_day, current_dt))

    return WeekScheduleResponse(
        week_start=start_of_week.isoformat(),
        week_end=end_of_week.isoformat(),
        planning_period_name=planning_period_name,
        is_within_planning_period=is_within if active_periods else True,
        days=days
    )


def build_today_plan(
    db: Session,
    user_id: int,
    target_date: Optional[date] = None,
    current_dt: Optional[datetime] = None
) -> TodayPlanResponse:
    """Builds Today's Plan with 'happening now', 'up next', and schedule cards."""
    if current_dt is None:
        current_dt = datetime.now()
    if target_date is None:
        target_date = current_dt.date()

    day_schedule = build_schedule_for_date(db, user_id, target_date, current_dt)

    # Find current item and next item
    current_item: Optional[ScheduleItem] = None
    next_item: Optional[ScheduleItem] = None

    upcoming_candidates: List[ScheduleItem] = []
    for item in day_schedule.items:
        if item.status == "now" and current_item is None:
            current_item = item
        elif item.status == "upcoming":
            upcoming_candidates.append(item)

    if upcoming_candidates:
        next_item = upcoming_candidates[0]

    # Calculate statistics
    college_count = sum(1 for i in day_schedule.items if i.category.lower() == "college")
    fitness_count = sum(1 for i in day_schedule.items if i.category.lower() in ["gym", "sports", "fitness"])
    event_count = sum(1 for i in day_schedule.items if i.source_type == "event")

    stats = {
        "total_commitments": day_schedule.total_items,
        "college_classes": college_count,
        "fitness_sessions": fitness_count,
        "special_events": event_count,
    }

    return TodayPlanResponse(
        date=target_date.isoformat(),
        day_name=FULL_DAY_NAMES[target_date.weekday()],
        formatted_date=target_date.strftime("%A, %d %B %Y"),
        current_time=current_dt.strftime("%I:%M %p"),
        current_item=current_item,
        next_item=next_item,
        items=day_schedule.items,
        stats=stats
    )


def build_upcoming_events(
    db: Session,
    user_id: int,
    from_date: Optional[date] = None,
    limit: int = 20
) -> List[UpcomingEventItem]:
    """Returns future events in chronological order with human-readable countdowns."""
    if from_date is None:
        from_date = date.today()

    events = db.query(Event).filter(
        Event.user_id == user_id,
        Event.end_date >= from_date
    ).order_by(Event.start_date.asc(), Event.start_time.asc()).limit(limit).all()

    results: List[UpcomingEventItem] = []
    for evt in events:
        days_until = (evt.start_date - from_date).days
        if days_until < 0:
            # Multi-day event currently in progress
            relative_text = "Ongoing now"
        elif days_until == 0:
            relative_text = "Today"
        elif days_until == 1:
            relative_text = "Tomorrow"
        elif days_until < 7:
            relative_text = f"In {days_until} days ({FULL_DAY_NAMES[evt.start_date.weekday()]})"
        elif days_until < 14:
            relative_text = "Next week"
        elif days_until < 30:
            relative_text = f"In {days_until // 7} weeks"
        else:
            relative_text = f"In {days_until // 30} month(s)"

        results.append(UpcomingEventItem(
            id=evt.id,
            title=evt.title,
            event_type=evt.event_type or "Event",
            start_date=evt.start_date.isoformat(),
            end_date=evt.end_date.isoformat(),
            start_time=evt.start_time,
            end_time=evt.end_time,
            is_all_day=evt.is_all_day,
            is_multi_day=(evt.start_date != evt.end_date),
            location=evt.location,
            notes=evt.notes,
            color=evt.color or "#059669",
            days_until=days_until,
            relative_text=relative_text
        ))

    return results
