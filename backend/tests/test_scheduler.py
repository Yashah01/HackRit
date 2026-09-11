import json
from datetime import date
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import User, PlanningPeriod, RecurringActivity, Event, Course
from app.auth import hash_password, create_access_token

# In-memory test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def create_test_user(db_session, email="student@college.edu", name="Test Student"):
    user = User(
        name=name,
        email=email,
        hashed_password=hash_password("Password123!")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return user, {"Authorization": f"Bearer {token}"}


# ==========================================
# TEST 1: Basic Recurrence (Single Day)
# ==========================================
def test_1_basic_recurrence_single_day(client, db_session):
    user, headers = create_test_user(db_session)

    # Period: April 2026
    p_resp = client.post("/api/planning-periods/", json={
        "name": "Spring",
        "start_date": "2026-04-01",
        "end_date": "2026-04-30",
        "is_active": True
    }, headers=headers)
    period_id = p_resp.json()["id"]

    # Activity: Gym only on Monday
    client.post("/api/activities/", json={
        "title": "Gym Monday",
        "category": "Gym",
        "days_of_week": ["Mon"],
        "start_time": "18:00",
        "end_time": "19:00",
        "planning_period_id": period_id
    }, headers=headers)

    # 2026-04-06 is Monday -> Should appear
    mon_resp = client.get("/api/schedule/day/2026-04-06", headers=headers)
    assert mon_resp.status_code == 200
    mon_items = mon_resp.json()["items"]
    assert len(mon_items) == 1
    assert mon_items[0]["title"] == "Gym Monday"

    # 2026-04-07 is Tuesday -> Should NOT appear
    tue_resp = client.get("/api/schedule/day/2026-04-07", headers=headers)
    assert tue_resp.status_code == 200
    assert len(tue_resp.json()["items"]) == 0


# ==========================================
# TEST 2: Multiple Weekdays (Mon, Wed, Fri)
# ==========================================
def test_2_multiple_weekdays(client, db_session):
    user, headers = create_test_user(db_session)

    p_resp = client.post("/api/planning-periods/", json={
        "name": "Spring",
        "start_date": "2026-04-01",
        "end_date": "2026-04-30",
        "is_active": True
    }, headers=headers)
    period_id = p_resp.json()["id"]

    client.post("/api/activities/", json={
        "title": "Gym Routine",
        "category": "Gym",
        "days_of_week": ["Mon", "Wed", "Fri"],
        "start_time": "18:00",
        "end_time": "19:00",
        "planning_period_id": period_id
    }, headers=headers)

    # 2026-04-06 (Mon), 2026-04-08 (Wed), 2026-04-10 (Fri)
    for d in ["2026-04-06", "2026-04-08", "2026-04-10"]:
        resp = client.get(f"/api/schedule/day/{d}", headers=headers)
        assert len(resp.json()["items"]) == 1
        assert resp.json()["items"][0]["title"] == "Gym Routine"

    # 2026-04-07 (Tue), 2026-04-09 (Thu), 2026-04-11 (Sat), 2026-04-12 (Sun)
    for d in ["2026-04-07", "2026-04-09", "2026-04-11", "2026-04-12"]:
        resp = client.get(f"/api/schedule/day/{d}", headers=headers)
        assert len(resp.json()["items"]) == 0


# ==========================================
# TEST 3: Planning Period Boundary Respect
# ==========================================
def test_3_planning_period_boundaries(client, db_session):
    user, headers = create_test_user(db_session)

    # Period strictly: 1 April 2026 -> 30 June 2026
    p_resp = client.post("/api/planning-periods/", json={
        "name": "Spring",
        "start_date": "2026-04-01",
        "end_date": "2026-06-30",
        "is_active": True
    }, headers=headers)
    period_id = p_resp.json()["id"]

    client.post("/api/activities/", json={
        "title": "College Lectures",
        "category": "College",
        "days_of_week": ["Mon"],
        "start_time": "09:00",
        "end_time": "15:00",
        "planning_period_id": period_id
    }, headers=headers)

    # Before start date: 2026-03-30 (Monday in March) -> MUST NOT generate
    before_resp = client.get("/api/schedule/day/2026-03-30", headers=headers)
    assert len(before_resp.json()["items"]) == 0

    # Inside period: 2026-04-06 (Monday in April) -> MUST generate
    inside_resp = client.get("/api/schedule/day/2026-04-06", headers=headers)
    assert len(inside_resp.json()["items"]) == 1

    # After end date: 2026-07-06 (Monday in July) -> MUST NOT generate
    after_resp = client.get("/api/schedule/day/2026-07-06", headers=headers)
    assert len(after_resp.json()["items"]) == 0


# ==========================================
# TEST 4: One-Time Event
# ==========================================
def test_4_one_time_event(client, db_session):
    user, headers = create_test_user(db_session)

    client.post("/api/events/", json={
        "title": "Mathematics Test",
        "event_type": "Test",
        "start_date": "2026-04-14",
        "end_date": "2026-04-14",
        "start_time": "10:00",
        "end_time": "11:00"
    }, headers=headers)

    # 14 April -> Present
    d14 = client.get("/api/schedule/day/2026-04-14", headers=headers)
    assert len(d14.json()["items"]) == 1
    assert d14.json()["items"][0]["title"] == "Mathematics Test"
    assert d14.json()["items"][0]["source_type"] == "event"

    # 13 April & 15 April -> Absent
    assert len(client.get("/api/schedule/day/2026-04-13", headers=headers).json()["items"]) == 0
    assert len(client.get("/api/schedule/day/2026-04-15", headers=headers).json()["items"]) == 0


# ==========================================
# TEST 5: Multi-Day Event
# ==========================================
def test_5_multi_day_event(client, db_session):
    user, headers = create_test_user(db_session)

    # College Trip: 10 May -> 12 May 2026
    client.post("/api/events/", json={
        "title": "College Trip",
        "event_type": "Trip",
        "start_date": "2026-05-10",
        "end_date": "2026-05-12",
        "is_all_day": True
    }, headers=headers)

    # All 3 days must display the trip
    for d in ["2026-05-10", "2026-05-11", "2026-05-12"]:
        resp = client.get(f"/api/schedule/day/{d}", headers=headers)
        items = resp.json()["items"]
        assert len(items) == 1
        assert items[0]["title"] == "College Trip"
        assert items[0]["is_multi_day"] is True

    # 9 May and 13 May must not display the trip
    assert len(client.get("/api/schedule/day/2026-05-09", headers=headers).json()["items"]) == 0
    assert len(client.get("/api/schedule/day/2026-05-13", headers=headers).json()["items"]) == 0


# ==========================================
# TEST 6: Overlapping Schedule Merging & Sorting
# ==========================================
def test_6_overlapping_commitments(client, db_session):
    user, headers = create_test_user(db_session)

    p_resp = client.post("/api/planning-periods/", json={
        "name": "Spring",
        "start_date": "2026-04-01",
        "end_date": "2026-06-30"
    }, headers=headers)

    # Recurring College: Monday-Friday 09:00 - 15:00
    client.post("/api/activities/", json={
        "title": "College Classes",
        "days_of_week": ["Sat"],  # 2026-04-25 is Saturday
        "start_time": "09:00",
        "end_time": "15:00",
        "planning_period_id": p_resp.json()["id"]
    }, headers=headers)

    # Special Event on same Saturday: 16:00 - 21:00
    client.post("/api/events/", json={
        "title": "Cultural Fest",
        "event_type": "Fest",
        "start_date": "2026-04-25",
        "end_date": "2026-04-25",
        "start_time": "16:00",
        "end_time": "21:00"
    }, headers=headers)

    resp = client.get("/api/schedule/day/2026-04-25", headers=headers)
    items = resp.json()["items"]
    assert len(items) == 2
    # Chronological sort: 09:00 College first, 16:00 Fest second
    assert items[0]["title"] == "College Classes"
    assert items[0]["start_time"] == "09:00"
    assert items[1]["title"] == "Cultural Fest"
    assert items[1]["start_time"] == "16:00"


# ==========================================
# TEST 7: Multi-User Data Isolation
# ==========================================
def test_7_multi_user_data_isolation(client, db_session):
    user_a, headers_a = create_test_user(db_session, email="alice@college.edu", name="Alice")
    user_b, headers_b = create_test_user(db_session, email="bob@college.edu", name="Bob")

    # Alice creates a planning period and secret event
    client.post("/api/events/", json={
        "title": "Alice Secret Study Session",
        "start_date": "2026-04-14",
        "end_date": "2026-04-14"
    }, headers=headers_a)

    # Bob checks 2026-04-14 -> must NOT see Alice's event
    bob_resp = client.get("/api/schedule/day/2026-04-14", headers=headers_b)
    assert len(bob_resp.json()["items"]) == 0

    # Alice checks 2026-04-14 -> sees her event
    alice_resp = client.get("/api/schedule/day/2026-04-14", headers=headers_a)
    assert len(alice_resp.json()["items"]) == 1
    assert alice_resp.json()["items"][0]["title"] == "Alice Secret Study Session"


# ==========================================
# TEST 8: Validation (Invalid Dates / Times)
# ==========================================
def test_8_input_validation(client, db_session):
    user, headers = create_test_user(db_session)

    # End date < start date in planning period
    resp1 = client.post("/api/planning-periods/", json={
        "name": "Invalid Period",
        "start_date": "2026-06-30",
        "end_date": "2026-04-01"
    }, headers=headers)
    assert resp1.status_code == 422 or resp1.status_code == 400

    # End time <= start time in activity
    resp2 = client.post("/api/activities/", json={
        "title": "Invalid Activity",
        "days_of_week": ["Mon"],
        "start_time": "18:00",
        "end_time": "17:00"
    }, headers=headers)
    assert resp2.status_code == 422 or resp2.status_code == 400


# ==========================================
# TEST 9: Empty Schedule
# ==========================================
def test_9_empty_schedule(client, db_session):
    user, headers = create_test_user(db_session)

    # Requesting schedule for user with no activities or events
    day_resp = client.get("/api/schedule/day/2026-04-10", headers=headers)
    assert day_resp.status_code == 200
    assert day_resp.json()["total_items"] == 0
    assert day_resp.json()["items"] == []

    week_resp = client.get("/api/schedule/week/2026-04-10", headers=headers)
    assert week_resp.status_code == 200
    assert len(week_resp.json()["days"]) == 7


# ==========================================
# TEST 10: Attendance Calculations & Alerts
# ==========================================
def test_10_attendance_calculations(client, db_session):
    user, headers = create_test_user(db_session)

    # Course with >=75% attendance: 24/30 = 80.0%
    # Target 75%: 24/0.75 - 30 = 32 - 30 = 2 safe bunks
    c1 = client.post("/api/attendance/courses", json={
        "name": "Data Structures",
        "code": "CS201",
        "target_percentage": 75.0,
        "total_classes": 30,
        "attended_classes": 24
    }, headers=headers).json()

    assert c1["current_percentage"] == 80.0
    assert c1["is_critical"] is False
    assert c1["safe_bunks"] == 2
    assert c1["classes_needed"] == 0

    # Course with <75% attendance: 18/26 = ~69.2%
    # Below target -> is_critical is True
    c2 = client.post("/api/attendance/courses", json={
        "name": "Computer Networks",
        "code": "CS203",
        "target_percentage": 75.0,
        "total_classes": 26,
        "attended_classes": 18
    }, headers=headers).json()

    assert c2["current_percentage"] == 69.2
    assert c2["is_critical"] is True
    assert c2["safe_bunks"] == 0
    assert c2["classes_needed"] > 0
