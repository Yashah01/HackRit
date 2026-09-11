from datetime import datetime, timezone, date
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Date, DateTime, Float, ForeignKey
)
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now)

    planning_periods = relationship("PlanningPeriod", back_populates="user", cascade="all, delete-orphan")
    recurring_activities = relationship("RecurringActivity", back_populates="user", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="user", cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="user", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="user", cascade="all, delete-orphan")


class PlanningPeriod(Base):
    __tablename__ = "planning_periods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="planning_periods")
    recurring_activities = relationship("RecurringActivity", back_populates="planning_period")


class RecurringActivity(Base):
    __tablename__ = "recurring_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    planning_period_id = Column(Integer, ForeignKey("planning_periods.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50), default="College")  # College, Gym, Tuition, Study, Club, Sports, Personal
    days_of_week = Column(String(255), nullable=False)  # JSON string: e.g. '["Mon", "Wed", "Fri"]'
    start_time = Column(String(10), nullable=False)  # "09:00"
    end_time = Column(String(10), nullable=False)    # "15:00"
    location = Column(String(150), nullable=True)
    notes = Column(Text, nullable=True)
    color = Column(String(30), default="#4F46E5")
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="recurring_activities")
    planning_period = relationship("PlanningPeriod", back_populates="recurring_activities")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    event_type = Column(String(50), default="Event")  # Test, Exam, Fest, Cultural, Trip, Assignment, Personal
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    start_time = Column(String(10), nullable=True)   # "10:00"
    end_time = Column(String(10), nullable=True)     # "11:00"
    is_all_day = Column(Boolean, default=False)
    location = Column(String(150), nullable=True)
    notes = Column(Text, nullable=True)
    color = Column(String(30), default="#059669")
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="events")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=True)
    target_percentage = Column(Float, default=75.0)
    total_classes = Column(Integer, default=0)
    attended_classes = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="courses")
    attendance_records = relationship("AttendanceRecord", back_populates="course", cascade="all, delete-orphan")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)  # "present", "absent", "cancelled"
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="attendance_records")
    course = relationship("Course", back_populates="attendance_records")
