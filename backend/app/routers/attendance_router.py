import math
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Course, AttendanceRecord
from app.schemas import (
    CourseCreate, CourseUpdate, CourseResponse,
    AttendanceRecordCreate, AttendanceRecordResponse
)
from app.auth import get_current_user

router = APIRouter(prefix="/api/attendance", tags=["Attendance Tracker"])


def compute_course_metrics(course: Course) -> CourseResponse:
    total = course.total_classes
    attended = course.attended_classes
    target = course.target_percentage or 75.0

    if total == 0:
        pct = 100.0
        is_critical = False
        safe_bunks = 0
        classes_needed = 0
    else:
        pct = round((attended / total) * 100, 1)
        is_critical = pct < target

        if pct >= target:
            target_dec = target / 100.0
            if target_dec > 0:
                safe_bunks = max(0, int((attended / target_dec) - total))
            else:
                safe_bunks = 999
            classes_needed = 0
        else:
            safe_bunks = 0
            target_dec = target / 100.0
            if target_dec < 1.0:
                diff = (target_dec * total) - attended
                classes_needed = max(1, math.ceil(diff / (1.0 - target_dec)))
            else:
                classes_needed = 999

    return CourseResponse(
        id=course.id,
        user_id=course.user_id,
        name=course.name,
        code=course.code,
        target_percentage=target,
        total_classes=total,
        attended_classes=attended,
        current_percentage=pct,
        is_critical=is_critical,
        safe_bunks=safe_bunks,
        classes_needed=classes_needed,
        created_at=course.created_at
    )


@router.get("/courses", response_model=List[CourseResponse])
def get_courses(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    courses = db.query(Course).filter(Course.user_id == user.id).order_by(Course.name.asc()).all()
    return [compute_course_metrics(c) for c in courses]


@router.post("/courses", response_model=CourseResponse)
def create_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if course_data.attended_classes > course_data.total_classes:
        raise HTTPException(
            status_code=400,
            detail="Attended classes cannot exceed total classes"
        )

    new_course = Course(
        user_id=user.id,
        name=course_data.name.strip(),
        code=course_data.code.strip() if course_data.code else None,
        target_percentage=course_data.target_percentage,
        total_classes=course_data.total_classes,
        attended_classes=course_data.attended_classes
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return compute_course_metrics(new_course)


@router.put("/courses/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    update_data: CourseUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.user_id == user.id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    new_total = update_data.total_classes if update_data.total_classes is not None else course.total_classes
    new_attended = update_data.attended_classes if update_data.attended_classes is not None else course.attended_classes

    if new_attended > new_total:
        raise HTTPException(status_code=400, detail="Attended classes cannot exceed total classes")

    if update_data.name is not None:
        course.name = update_data.name.strip()
    if update_data.code is not None:
        course.code = update_data.code.strip() if update_data.code else None
    if update_data.target_percentage is not None:
        course.target_percentage = update_data.target_percentage
    course.total_classes = new_total
    course.attended_classes = new_attended

    db.commit()
    db.refresh(course)
    return compute_course_metrics(course)


@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.user_id == user.id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}


@router.post("/log", response_model=AttendanceRecordResponse)
def log_attendance(
    record_data: AttendanceRecordCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(
        Course.id == record_data.course_id,
        Course.user_id == user.id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Update counts based on status
    if record_data.status == "present":
        course.total_classes += 1
        course.attended_classes += 1
    elif record_data.status == "absent":
        course.total_classes += 1
    # cancelled does not alter total or attended

    record = AttendanceRecord(
        user_id=user.id,
        course_id=course.id,
        date=record_data.date,
        status=record_data.status,
        notes=record_data.notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return AttendanceRecordResponse(
        id=record.id,
        user_id=record.user_id,
        course_id=record.course_id,
        course_name=course.name,
        date=record.date,
        status=record.status,
        notes=record.notes,
        created_at=record.created_at
    )


@router.get("/records", response_model=List[AttendanceRecordResponse])
def get_attendance_records(
    course_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(AttendanceRecord).filter(AttendanceRecord.user_id == user.id)
    if course_id:
        query = query.filter(AttendanceRecord.course_id == course_id)

    records = query.order_by(AttendanceRecord.date.desc(), AttendanceRecord.id.desc()).limit(limit).all()

    # Pre-fetch course names
    courses_map = {c.id: c.name for c in db.query(Course).filter(Course.user_id == user.id).all()}

    res = []
    for r in records:
        res.append(AttendanceRecordResponse(
            id=r.id,
            user_id=r.user_id,
            course_id=r.course_id,
            course_name=courses_map.get(r.course_id, "Unknown"),
            date=r.date,
            status=r.status,
            notes=r.notes,
            created_at=r.created_at
        ))
    return res


@router.get("/summary")
def get_attendance_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    courses = db.query(Course).filter(Course.user_id == user.id).all()
    if not courses:
        return {
            "overall_percentage": 100.0,
            "total_courses": 0,
            "critical_courses": 0,
            "total_attended": 0,
            "total_classes": 0
        }

    total_attended = sum(c.attended_classes for c in courses)
    total_classes = sum(c.total_classes for c in courses)
    overall_pct = round((total_attended / total_classes) * 100, 1) if total_classes > 0 else 100.0
    critical = sum(1 for c in courses if (c.total_classes > 0 and (c.attended_classes / c.total_classes * 100) < (c.target_percentage or 75.0)))

    return {
        "overall_percentage": overall_pct,
        "total_courses": len(courses),
        "critical_courses": critical,
        "total_attended": total_attended,
        "total_classes": total_classes
    }
