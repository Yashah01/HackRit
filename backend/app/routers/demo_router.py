import json
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, PlanningPeriod, RecurringActivity, Event, Course, AttendanceRecord
from app.auth import get_current_user

router = APIRouter(prefix="/api/demo", tags=["Demo Seeder"])


@router.post("/seed")
def seed_demo_data(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Populates user account with the exact College Life Scheduler demonstration data."""
    # 1. Clean existing data for this user
    db.query(AttendanceRecord).filter(AttendanceRecord.user_id == user.id).delete()
    db.query(Course).filter(Course.user_id == user.id).delete()
    db.query(Event).filter(Event.user_id == user.id).delete()
    db.query(RecurringActivity).filter(RecurringActivity.user_id == user.id).delete()
    db.query(PlanningPeriod).filter(PlanningPeriod.user_id == user.id).delete()
    db.commit()

    # 2. Planning Period: 1 April 2026 -> 30 June 2026
    planning_period = PlanningPeriod(
        user_id=user.id,
        name="Spring 2026 Semester",
        start_date=date(2026, 4, 1),
        end_date=date(2026, 6, 30),
        is_active=True
    )
    db.add(planning_period)
    db.commit()
    db.refresh(planning_period)

    # 3. Recurring Activities
    college = RecurringActivity(
        user_id=user.id,
        planning_period_id=planning_period.id,
        title="College Timetable (Lectures & Labs)",
        category="College",
        days_of_week=json.dumps(["Mon", "Tue", "Wed", "Thu", "Fri"]),
        start_time="09:00",
        end_time="15:00",
        location="Campus Academic Block 3",
        notes="Core engineering classes and laboratory sessions",
        color="#4F46E5"
    )

    gym = RecurringActivity(
        user_id=user.id,
        planning_period_id=planning_period.id,
        title="Gym Workout",
        category="Gym",
        days_of_week=json.dumps(["Mon", "Wed", "Fri"]),
        start_time="18:00",
        end_time="19:00",
        location="Campus Fitness Center",
        notes="Push/Pull/Legs split and cardio",
        color="#059669"
    )

    tuition = RecurringActivity(
        user_id=user.id,
        planning_period_id=planning_period.id,
        title="Mathematics & Algorithms Tuition",
        category="Tuition",
        days_of_week=json.dumps(["Tue", "Thu"]),
        start_time="19:30",
        end_time="21:00",
        location="Tuition Academy / Online",
        notes="Exam preparation and problem solving",
        color="#D97706"
    )

    db.add_all([college, gym, tuition])

    # 4. Special Events
    math_test = Event(
        user_id=user.id,
        title="Mathematics Midterm Test",
        event_type="Test",
        start_date=date(2026, 4, 14),
        end_date=date(2026, 4, 14),
        start_time="10:00",
        end_time="11:00",
        location="Exam Hall B",
        notes="Calculus, Linear Algebra, Probability",
        color="#DC2626"
    )

    physics_practical = Event(
        user_id=user.id,
        title="Physics Practical Exam",
        event_type="Exam",
        start_date=date(2026, 4, 22),
        end_date=date(2026, 4, 22),
        start_time="11:00",
        end_time="13:00",
        location="Optics Laboratory",
        notes="Bring practical record and lab manual",
        color="#EA580C"
    )

    fest = Event(
        user_id=user.id,
        title="College Cultural Fest (Euphoria)",
        event_type="Fest",
        start_date=date(2026, 4, 25),
        end_date=date(2026, 4, 25),
        start_time="16:00",
        end_time="21:00",
        location="Main University Amphitheatre",
        notes="Music concert, dance competition, food stalls",
        color="#7C3AED"
    )

    sem_exam = Event(
        user_id=user.id,
        title="Semester Final Examination",
        event_type="Exam",
        start_date=date(2026, 5, 5),
        end_date=date(2026, 5, 5),
        start_time="09:00",
        end_time="12:00",
        location="Central Auditorium Hall",
        notes="Comprehensive semester paper",
        color="#DC2626"
    )

    trip = Event(
        user_id=user.id,
        title="College Mountain Trip and Trek",
        event_type="Trip",
        start_date=date(2026, 5, 10),
        end_date=date(2026, 5, 12),
        is_all_day=True,
        location="Manali and Solang Valley",
        notes="3 Day adventure club trip with classmates",
        color="#0284C7"
    )

    db.add_all([math_test, physics_practical, fest, sem_exam, trip])

    # 5. Courses & Attendance
    c1 = Course(
        user_id=user.id,
        name="Data Structures & Algorithms",
        code="CS201",
        target_percentage=75.0,
        total_classes=38,
        attended_classes=32
    )
    c2 = Course(
        user_id=user.id,
        name="Database Management Systems",
        code="CS202",
        target_percentage=75.0,
        total_classes=28,
        attended_classes=21
    )
    c3 = Course(
        user_id=user.id,
        name="Computer Networks",
        code="CS203",
        target_percentage=75.0,
        total_classes=26,
        attended_classes=18  # 69.2% -> below 75% critical alert!
    )
    c4 = Course(
        user_id=user.id,
        name="Operating Systems",
        code="CS204",
        target_percentage=75.0,
        total_classes=30,
        attended_classes=27
    )

    db.add_all([c1, c2, c3, c4])
    db.commit()

    return {
        "status": "success",
        "message": "Demo student routine successfully seeded!",
        "planning_period": "1 April 2026 to 30 June 2026",
        "recurring_activities_count": 3,
        "special_events_count": 5,
        "courses_count": 4
    }
