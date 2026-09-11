// Client-side standalone engine for College Life Scheduler
// Ensures 100% full functionality when deployed as a static site on Netlify

const STORAGE_KEYS = {
  USER: 'cls_standalone_user',
  PERIODS: 'cls_standalone_periods',
  ACTIVITIES: 'cls_standalone_activities',
  EVENTS: 'cls_standalone_events',
  COURSES: 'cls_standalone_courses',
  ATTENDANCE: 'cls_standalone_attendance_records',
};

// Initial default seed dataset from specification
function getDefaultData() {
  return {
    periods: [
      {
        id: 1,
        name: 'Spring Semester 2026',
        start_date: '2026-04-01',
        end_date: '2026-06-30',
        is_active: true,
      },
    ],
    activities: [
      {
        id: 1,
        planning_period_id: 1,
        title: 'College Lectures and Labs',
        category: 'college',
        days_of_week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        start_time: '09:00',
        end_time: '15:00',
        location: 'Academic Block A',
        color: '#4F46E5',
        notes: 'Mandatory undergraduate degree courses',
      },
      {
        id: 2,
        planning_period_id: 1,
        title: 'Fitness and Gym Session',
        category: 'gym',
        days_of_week: ['Mon', 'Wed', 'Fri'],
        start_time: '18:00',
        end_time: '19:00',
        location: 'Campus Recreation Center',
        color: '#059669',
        notes: 'Strength conditioning and cardio',
      },
      {
        id: 3,
        planning_period_id: 1,
        title: 'Advanced Mathematics Tuition',
        category: 'tuition',
        days_of_week: ['Tue', 'Thu'],
        start_time: '19:30',
        end_time: '21:00',
        location: 'Study Hub 3',
        color: '#7C3AED',
        notes: 'Engineering Calculus and Linear Algebra',
      },
    ],
    events: [
      {
        id: 1,
        title: 'Mathematics Sessional Test',
        event_type: 'Test',
        start_date: '2026-04-14',
        end_date: '2026-04-14',
        is_multi_day: false,
        start_time: '10:00',
        end_time: '11:30',
        is_all_day: false,
        location: 'Exam Hall 102',
        color: '#E11D48',
        notes: 'Chapters 1 to 4 Calculus Midterm',
      },
      {
        id: 2,
        title: 'Applied Physics Lab Practical',
        event_type: 'Exam',
        start_date: '2026-04-22',
        end_date: '2026-04-22',
        is_multi_day: false,
        start_time: '14:00',
        end_time: '17:00',
        is_all_day: false,
        location: 'Optics Laboratory',
        color: '#D97706',
        notes: 'Bring lab manual and certified record notebook',
      },
      {
        id: 3,
        title: 'Annual University Cultural Fest',
        event_type: 'Fest',
        start_date: '2026-04-25',
        end_date: '2026-04-25',
        is_multi_day: false,
        start_time: '16:00',
        end_time: '21:00',
        is_all_day: false,
        location: 'University Open Grounds',
        color: '#9333EA',
        notes: 'Evening concerts, competitions and club stalls',
      },
      {
        id: 4,
        title: 'Semester Final Examination',
        event_type: 'Exam',
        start_date: '2026-05-05',
        end_date: '2026-05-05',
        is_multi_day: false,
        start_time: '09:30',
        end_time: '12:30',
        is_all_day: false,
        location: 'Central Examination Complex',
        color: '#DC2626',
        notes: 'Core subjects theoretical paper',
      },
      {
        id: 5,
        title: 'College Mountain Trip and Trek',
        event_type: 'Trip',
        start_date: '2026-05-10',
        end_date: '2026-05-12',
        is_multi_day: true,
        start_time: '06:00',
        end_time: '20:00',
        is_all_day: true,
        location: 'Pine Valley Heights',
        color: '#0891B2',
        notes: '3 day hiking and camping expedition with batchmates',
      },
    ],
    courses: [
      {
        id: 1,
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        total_classes: 38,
        attended_classes: 32,
        target_percentage: 75.0,
      },
      {
        id: 2,
        name: 'Database Management Systems',
        code: 'CS202',
        total_classes: 36,
        attended_classes: 27,
        target_percentage: 75.0,
      },
      {
        id: 3,
        name: 'Computer Networks',
        code: 'CS203',
        total_classes: 26,
        attended_classes: 18,
        target_percentage: 75.0,
      },
      {
        id: 4,
        name: 'Operating Systems',
        code: 'CS204',
        total_classes: 30,
        attended_classes: 27,
        target_percentage: 75.0,
      },
    ],
  };
}

function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function ensureStandaloneSeeded() {
  if (!localStorage.getItem(STORAGE_KEYS.PERIODS)) {
    const d = getDefaultData();
    saveStorage(STORAGE_KEYS.PERIODS, d.periods);
    saveStorage(STORAGE_KEYS.ACTIVITIES, d.activities);
    saveStorage(STORAGE_KEYS.EVENTS, d.events);
    saveStorage(STORAGE_KEYS.COURSES, d.courses);
    saveStorage(STORAGE_KEYS.ATTENDANCE, []);
  }
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDateDisplay(d) {
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export const mockEngine = {
  login: async (email, password) => {
    const user = {
      id: 1,
      name: email.split('@')[0] || 'College Student',
      email: email,
      college_name: 'Metropolitan University',
    };
    saveStorage(STORAGE_KEYS.USER, user);
    return {
      access_token: 'standalone_token_cls',
      token_type: 'bearer',
      user,
    };
  },

  register: async (name, email) => {
    const user = {
      id: 1,
      name: name || 'College Student',
      email: email,
      college_name: 'Metropolitan University',
    };
    saveStorage(STORAGE_KEYS.USER, user);
    return {
      access_token: 'standalone_token_cls',
      token_type: 'bearer',
      user,
    };
  },

  demoLogin: async () => {
    ensureStandaloneSeeded();
    const user = {
      id: 1,
      name: 'Alex Rivers',
      email: 'alex@college.edu',
      college_name: 'Metropolitan University',
    };
    saveStorage(STORAGE_KEYS.USER, user);
    return {
      access_token: 'standalone_token_cls',
      token_type: 'bearer',
      user,
    };
  },

  getMe: async () => {
    return loadStorage(STORAGE_KEYS.USER, {
      id: 1,
      name: 'Alex Rivers',
      email: 'alex@college.edu',
      college_name: 'Metropolitan University',
    });
  },

  seedDemo: async () => {
    const d = getDefaultData();
    saveStorage(STORAGE_KEYS.PERIODS, d.periods);
    saveStorage(STORAGE_KEYS.ACTIVITIES, d.activities);
    saveStorage(STORAGE_KEYS.EVENTS, d.events);
    saveStorage(STORAGE_KEYS.COURSES, d.courses);
    saveStorage(STORAGE_KEYS.ATTENDANCE, []);
    return { message: 'Demo data seeded successfully' };
  },

  getPlanningPeriods: async () => {
    ensureStandaloneSeeded();
    return loadStorage(STORAGE_KEYS.PERIODS, []);
  },

  createPlanningPeriod: async (data) => {
    ensureStandaloneSeeded();
    const periods = loadStorage(STORAGE_KEYS.PERIODS, []);
    const newPeriod = { id: Date.now(), ...data };
    if (newPeriod.is_active) {
      periods.forEach((p) => { p.is_active = false; });
    }
    periods.push(newPeriod);
    saveStorage(STORAGE_KEYS.PERIODS, periods);
    return newPeriod;
  },

  deletePlanningPeriod: async (id) => {
    const periods = loadStorage(STORAGE_KEYS.PERIODS, []);
    saveStorage(STORAGE_KEYS.PERIODS, periods.filter((p) => p.id !== id));
    return { message: 'Deleted' };
  },

  getActivities: async () => {
    ensureStandaloneSeeded();
    return loadStorage(STORAGE_KEYS.ACTIVITIES, []);
  },

  createActivity: async (data) => {
    ensureStandaloneSeeded();
    const acts = loadStorage(STORAGE_KEYS.ACTIVITIES, []);
    const newAct = { id: Date.now(), ...data };
    acts.push(newAct);
    saveStorage(STORAGE_KEYS.ACTIVITIES, acts);
    return newAct;
  },

  deleteActivity: async (id) => {
    const acts = loadStorage(STORAGE_KEYS.ACTIVITIES, []);
    saveStorage(STORAGE_KEYS.ACTIVITIES, acts.filter((a) => a.id !== id));
    return { message: 'Deleted' };
  },

  getEvents: async () => {
    ensureStandaloneSeeded();
    return loadStorage(STORAGE_KEYS.EVENTS, []);
  },

  createEvent: async (data) => {
    ensureStandaloneSeeded();
    const evts = loadStorage(STORAGE_KEYS.EVENTS, []);
    const newEvt = { id: Date.now(), ...data };
    evts.push(newEvt);
    saveStorage(STORAGE_KEYS.EVENTS, evts);
    return newEvt;
  },

  deleteEvent: async (id) => {
    const evts = loadStorage(STORAGE_KEYS.EVENTS, []);
    saveStorage(STORAGE_KEYS.EVENTS, evts.filter((e) => e.id !== id));
    return { message: 'Deleted' };
  },

  getDaySchedule: async (dateStr) => {
    ensureStandaloneSeeded();
    const periods = loadStorage(STORAGE_KEYS.PERIODS, []);
    const activities = loadStorage(STORAGE_KEYS.ACTIVITIES, []);
    const events = loadStorage(STORAGE_KEYS.EVENTS, []);

    const targetDate = new Date(dateStr + 'T00:00:00');
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][targetDate.getDay()];
    const dayShort = WEEKDAYS[targetDate.getDay()];

    const items = [];

    // Check active planning period boundaries
    const activePeriod = periods.find((p) => p.is_active) || periods[0];
    const isWithinBoundary = activePeriod && dateStr >= activePeriod.start_date && dateStr <= activePeriod.end_date;

    if (isWithinBoundary) {
      for (const act of activities) {
        if (act.days_of_week && act.days_of_week.includes(dayShort)) {
          items.push({
            id: `routine_${act.id}`,
            title: act.title,
            category: act.category,
            start_time: act.start_time,
            end_time: act.end_time,
            is_all_day: false,
            location: act.location,
            notes: act.notes,
            color: act.color || '#4F46E5',
            source_type: 'recurring',
            source_id: act.id,
            status: 'upcoming',
          });
        }
      }
    }

    // Special events
    for (const evt of events) {
      const match = evt.is_multi_day
        ? dateStr >= evt.start_date && dateStr <= evt.end_date
        : evt.start_date === dateStr;

      if (match) {
        items.push({
          id: `event_${evt.id}`,
          title: evt.title,
          category: evt.event_type || 'Event',
          start_time: evt.start_time,
          end_time: evt.end_time,
          is_all_day: evt.is_all_day,
          location: evt.location,
          notes: evt.notes,
          color: evt.color || '#059669',
          source_type: 'event',
          source_id: evt.id,
          status: 'upcoming',
          is_multi_day: evt.is_multi_day,
          multi_day_start: evt.start_date,
          multi_day_end: evt.end_date,
        });
      }
    }

    // Chronological sort
    items.sort((a, b) => {
      const ta = a.start_time || '00:00';
      const tb = b.start_time || '00:00';
      return ta.localeCompare(tb);
    });

    return {
      date: dateStr,
      formatted_date: formatDateDisplay(targetDate),
      day_name: dayName,
      is_in_planning_period: isWithinBoundary,
      planning_period_name: activePeriod ? activePeriod.name : null,
      total_items: items.length,
      items,
    };
  },

  getWeekSchedule: async (dateStr) => {
    const base = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = base.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(base);
    monday.setDate(base.getDate() + diffToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      const iso = cur.toISOString().split('T')[0];
      const dayData = await mockEngine.getDaySchedule(iso);
      days.push({
        ...dayData,
        is_today: iso === new Date().toISOString().split('T')[0],
      });
    }

    const periods = loadStorage(STORAGE_KEYS.PERIODS, []);
    const active = periods.find((p) => p.is_active) || periods[0];

    return {
      start_date: days[0].date,
      end_date: days[6].date,
      planning_period_name: active ? active.name : null,
      days,
    };
  },

  getUpcomingEvents: async () => {
    ensureStandaloneSeeded();
    const events = loadStorage(STORAGE_KEYS.EVENTS, []);
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr + 'T00:00:00');

    const mapped = events.map((evt) => {
      const start = new Date(evt.start_date + 'T00:00:00');
      const diffMs = start - today;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      let rel = `${diffDays} days away`;
      if (diffDays === 0) rel = 'Today';
      else if (diffDays === 1) rel = 'Tomorrow';
      else if (diffDays > 1 && diffDays <= 7) rel = `In ${diffDays} days`;
      else if (diffDays < 0) rel = 'Ongoing';

      return {
        ...evt,
        days_until: diffDays,
        relative_text: rel,
      };
    });

    mapped.sort((a, b) => a.start_date.localeCompare(b.start_date));
    return mapped;
  },

  getCourses: async () => {
    ensureStandaloneSeeded();
    const courses = loadStorage(STORAGE_KEYS.COURSES, []);
    return courses.map((c) => {
      const pct = c.total_classes > 0 ? Math.round((c.attended_classes / c.total_classes) * 1000) / 10 : 100.0;
      const target = c.target_percentage || 75.0;
      const isCritical = pct < target;

      let safeBunks = 0;
      let needed = 0;

      if (!isCritical) {
        let tempTotal = c.total_classes;
        while ((c.attended_classes / (tempTotal + 1)) * 100 >= target) {
          tempTotal++;
          safeBunks++;
        }
      } else {
        let tempAttended = c.attended_classes;
        let tempTotal = c.total_classes;
        while ((tempAttended / tempTotal) * 100 < target) {
          tempAttended++;
          tempTotal++;
          needed++;
        }
      }

      return {
        ...c,
        current_percentage: pct,
        is_critical: isCritical,
        safe_bunks: safeBunks,
        classes_needed: needed,
      };
    });
  },

  createCourse: async (data) => {
    ensureStandaloneSeeded();
    const courses = loadStorage(STORAGE_KEYS.COURSES, []);
    const newCourse = {
      id: Date.now(),
      name: data.name,
      code: data.code,
      total_classes: Number(data.total_classes) || 0,
      attended_classes: Number(data.attended_classes) || 0,
      target_percentage: Number(data.target_percentage) || 75.0,
    };
    courses.push(newCourse);
    saveStorage(STORAGE_KEYS.COURSES, courses);
    return newCourse;
  },

  deleteCourse: async (id) => {
    const courses = loadStorage(STORAGE_KEYS.COURSES, []);
    saveStorage(STORAGE_KEYS.COURSES, courses.filter((c) => c.id !== id));
    return { message: 'Deleted' };
  },

  logAttendance: async (data) => {
    ensureStandaloneSeeded();
    const courses = loadStorage(STORAGE_KEYS.COURSES, []);
    const c = courses.find((item) => item.id === data.course_id);
    if (c) {
      if (data.status === 'present') {
        c.attended_classes += 1;
        c.total_classes += 1;
      } else if (data.status === 'absent') {
        c.total_classes += 1;
      }
      saveStorage(STORAGE_KEYS.COURSES, courses);
    }
    return { message: 'Attendance logged' };
  },

  getAttendanceRecords: async () => {
    return loadStorage(STORAGE_KEYS.ATTENDANCE, []);
  },

  getAttendanceSummary: async () => {
    const courses = await mockEngine.getCourses();
    const totalAttended = courses.reduce((acc, c) => acc + c.attended_classes, 0);
    const totalClasses = courses.reduce((acc, c) => acc + c.total_classes, 0);
    const overallPct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 100.0;
    const criticalCount = courses.filter((c) => c.is_critical).length;

    return {
      total_courses: courses.length,
      total_classes: totalClasses,
      total_attended: totalAttended,
      overall_percentage: overallPct,
      critical_courses: criticalCount,
    };
  },
};
