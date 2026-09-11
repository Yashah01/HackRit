# College Life Scheduler

> **"A student does not manage every occurrence individually. They define how their life works, and the system builds the schedule for them."**

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://college-life-scheduler-netlify.vercel.app)

🌐 **Live Demo (Vercel)**: [https://college-life-scheduler-netlify.vercel.app](https://college-life-scheduler-netlify.vercel.app)


**College Life Scheduler** is a full-stack, multi-user scheduling and academic planning system designed specifically for the unique time management patterns of college students. It combines **recurring weekly routines** (College, Gym, Tuition) within **time bounded planning periods**, merges them with **one time tests** and **multi day trips or fests**, automatically computes attendance percentages with safe bunk limits, and presents a responsive calendar for Desktop (Windows, Mac, Linux) and Mobile (Android, iOS).

---

## Key Features

1. **Deterministic Scheduling Engine**:
   - Expands weekly recurring activities across arbitrary date ranges.
   - Strictly enforces planning period boundaries (e.g. 1 April to 30 June).
   - Dynamically resolves and overlays one time events and multi day commitments (e.g. trips spanning May 10 to 12).
   - Sorts items chronologically with conflict tolerance and live status (`Happening Now`, `Upcoming`, `Completed`).

2. **Core Modules**:
   - **Today's Plan**: Instant daily view with live clock, current activity spotlight, and one-tap class attendance logging.
   - **Weekly Calendar**: 7-day grid view on desktop and touch-friendly day-switcher pills on mobile.
   - **Upcoming Events**: Chronological feed with countdown chips (`Today`, `Tomorrow`, `In 3 days`, `In 2 weeks`).
   - **Routines & Planning Period Hub**: Time-bounded recurring activity builder with day-of-week toggles and planning period manager.
   - **Attendance Tracker**: Subject cards, 75% target threshold indicator, and **Safe Bunk Calculator** (tells you how many classes you can safely miss or must attend to reach 75%).

3. **Multi-User Data Isolation & Security**:
   - User registration and login using JWT tokens and bcrypt password hashing.
   - Data isolation: every activity, period, event, and course is strictly scoped to the authenticated student.

4. **1-Click Demo Student Seeder**:
   - In the top navbar or Routines view, click **"Load Demo Routine"** to instantly load the exact roadmap scenario:
     - **Planning Period**: 1 April 2026 → 30 June 2026 ("Spring 2026 Semester")
     - **Recurring Routine**: College (Mon–Fri 09:00–15:00), Gym (Mon/Wed/Fri 18:00–19:00), Tuition (Tue/Thu 19:30–21:00)
     - **Special Events**: Mathematics Test (14 April), Physics Practical (22 April), Cultural Fest (25 April), Semester Exam (5 May), Mountain Trip (10–12 May)
     - **Courses & Attendance**: Data Structures (84.2%), DBMS (75.0%), Computer Networks (69.2% - Shortage Warning), OS (90.0%)

---

## Architecture and Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│                   React + Tailwind UI                  │
│       Desktop Sidebar + Mobile Bottom Navigation       │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON (Proxy /api)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI REST Backend                 │
│  ├── Scheduling Engine (Recurrence Expansion & Merge)  │
│  ├── JWT Authentication & User Isolation               │
│  └── Attendance Bunk Calculator                        │
└───────────────────────────┬────────────────────────────┘
                            │ SQLAlchemy
                            ▼
┌────────────────────────────────────────────────────────┐
│             SQLite (Default) / PostgreSQL              │
└────────────────────────────────────────────────────────┘
```

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, date-fns |
| **Backend** | Python 3.14 / 3.11+, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy, PyJWT, Bcrypt |
| **Database** | SQLite (zero configuration default) / PostgreSQL (`DATABASE_URL`) |
| **Testing** | Pytest (10 automated roadmap test cases) |

---

## Quick Start

### 1. Launch Backend
```bash
cd backend
# Using uv (recommended)
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Or using standard pip & venv
python -m venv .venv
# activate venv
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

### 2. Launch Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Running Automated Tests

Run the complete 10-point test suite covering recurrence expansion, multi day overlap, planning period boundaries, multi user isolation, and attendance metrics:

```bash
cd backend
uv run pytest
```

---

## Cross Platform Compatibility

- **Desktop (Windows, Mac, Linux)**: Full 7-column calendar grid, collapsible sidebar, desktop time slots.
- **Mobile (Android, iOS)**: Bottom navigation bar, swipeable day-picker pills, one-hand friendly touch actions.
