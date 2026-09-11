from datetime import date, datetime
from typing import List, Optional, Union
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# User Schemas
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[int] = None


# Planning Period Schemas
class PlanningPeriodBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    start_date: date
    end_date: date
    is_active: bool = True

    @field_validator("end_date")
    @classmethod
    def validate_dates(cls, v, info):
        if "start_date" in info.data and v < info.data["start_date"]:
            raise ValueError("End date cannot precede start date")
        return v


class PlanningPeriodCreate(PlanningPeriodBase):
    pass


class PlanningPeriodUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class PlanningPeriodResponse(PlanningPeriodBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime


# Recurring Activity Schemas
VALID_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


class RecurringActivityBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    category: str = Field(default="College")
    days_of_week: List[str] = Field(..., min_length=1)
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    planning_period_id: Optional[int] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    color: Optional[str] = "#4F46E5"

    @field_validator("days_of_week")
    @classmethod
    def validate_weekdays(cls, days):
        for d in days:
            if d not in VALID_WEEKDAYS:
                raise ValueError(f"Invalid weekday: {d}. Must be one of {VALID_WEEKDAYS}")
        return days

    @field_validator("end_time")
    @classmethod
    def validate_times(cls, v, info):
        if "start_time" in info.data and v <= info.data["start_time"]:
            raise ValueError("End time must be after start time")
        return v


class RecurringActivityCreate(RecurringActivityBase):
    pass


class RecurringActivityUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    days_of_week: Optional[List[str]] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    planning_period_id: Optional[int] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    color: Optional[str] = None


class RecurringActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    planning_period_id: Optional[int]
    title: str
    category: str
    days_of_week: List[str]
    start_time: str
    end_time: str
    location: Optional[str]
    notes: Optional[str]
    color: str
    created_at: datetime


# Event Schemas
class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    event_type: str = Field(default="Event")
    start_date: date
    end_date: date
    start_time: Optional[str] = Field(default=None)
    end_time: Optional[str] = Field(default=None)
    is_all_day: bool = False
    location: Optional[str] = None
    notes: Optional[str] = None
    color: Optional[str] = "#059669"

    @field_validator("end_date")
    @classmethod
    def validate_event_dates(cls, v, info):
        if "start_date" in info.data and v < info.data["start_date"]:
            raise ValueError("End date cannot precede start date")
        return v

    @field_validator("end_time")
    @classmethod
    def validate_event_times(cls, v, info):
        if (
            v
            and "start_time" in info.data
            and info.data["start_time"]
            and "start_date" in info.data
            and "end_date" in info.data
            and info.data["start_date"] == info.data["end_date"]
        ):
            if v < info.data["start_time"]:
                raise ValueError("End time cannot be earlier than start time on same-day event")
        return v


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    event_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_all_day: Optional[bool] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    color: Optional[str] = None


class EventResponse(EventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime


# Attendance Schemas
class CourseBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    code: Optional[str] = None
    target_percentage: float = Field(default=75.0, ge=0.0, le=100.0)
    total_classes: int = Field(default=0, ge=0)
    attended_classes: int = Field(default=0, ge=0)


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    target_percentage: Optional[float] = None
    total_classes: Optional[int] = None
    attended_classes: Optional[int] = None


class CourseResponse(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    current_percentage: float
    is_critical: bool
    safe_bunks: int
    classes_needed: int
    created_at: datetime


class AttendanceRecordCreate(BaseModel):
    course_id: int
    date: date
    status: str = Field(..., pattern=r"^(present|absent|cancelled)$")
    notes: Optional[str] = None


class AttendanceRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    course_id: int
    course_name: Optional[str] = None
    date: date
    status: str
    notes: Optional[str]
    created_at: datetime


# Schedule Schemas
class ScheduleItem(BaseModel):
    id: str  # "rec_{id}_{date}" or "evt_{id}_{date}"
    source_id: int
    source_type: str  # "recurring" or "event"
    title: str
    category: str
    date: str  # YYYY-MM-DD
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_all_day: bool = False
    is_multi_day: bool = False
    multi_day_start: Optional[str] = None
    multi_day_end: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    color: str
    status: Optional[str] = "upcoming"  # past, now, upcoming


class DaySchedule(BaseModel):
    date: str
    day_name: str
    formatted_date: str
    is_today: bool
    items: List[ScheduleItem]
    total_items: int


class WeekScheduleResponse(BaseModel):
    week_start: str
    week_end: str
    planning_period_name: Optional[str] = None
    is_within_planning_period: bool = True
    days: List[DaySchedule]


class TodayPlanResponse(BaseModel):
    date: str
    day_name: str
    formatted_date: str
    current_time: str
    current_item: Optional[ScheduleItem] = None
    next_item: Optional[ScheduleItem] = None
    items: List[ScheduleItem]
    stats: dict


class UpcomingEventItem(BaseModel):
    id: int
    title: str
    event_type: str
    start_date: str
    end_date: str
    start_time: Optional[str]
    end_time: Optional[str]
    is_all_day: bool
    is_multi_day: bool
    location: Optional[str]
    notes: Optional[str]
    color: str
    days_until: int
    relative_text: str  # "Today", "Tomorrow", "In 3 days", "Next week"
