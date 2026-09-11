// Centralized API client for College Life Scheduler
// Automatically connects to FastAPI backend or falls back to in-browser engine for Netlify deployments

import { mockEngine } from './mockEngine';

const API_BASE = '/api';
let isMockMode = false;

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('cls_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('cls_token');
    localStorage.removeItem('cls_user');
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `Request failed with status ${response.status}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return response.json();
}

async function executeWithFallback(apiCall, mockCall) {
  if (isMockMode) {
    return mockCall();
  }
  try {
    return await apiCall();
  } catch (err) {
    // If running on Netlify or static host where /api is not found, fallback to standalone engine
    isMockMode = true;
    return mockCall();
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    executeWithFallback(
      () =>
        apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }),
      () => mockEngine.login(email, password)
    ),

  register: (name, email, password) =>
    executeWithFallback(
      () =>
        apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        }),
      () => mockEngine.register(name, email, password)
    ),

  demoLogin: () =>
    executeWithFallback(
      () =>
        apiRequest('/auth/demo-login', {
          method: 'POST',
        }),
      () => mockEngine.demoLogin()
    ),

  getMe: () =>
    executeWithFallback(
      () => apiRequest('/auth/me'),
      () => mockEngine.getMe()
    ),

  // Planning Periods
  getPlanningPeriods: () =>
    executeWithFallback(
      () => apiRequest('/planning-periods/'),
      () => mockEngine.getPlanningPeriods()
    ),

  createPlanningPeriod: (data) =>
    executeWithFallback(
      () =>
        apiRequest('/planning-periods/', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      () => mockEngine.createPlanningPeriod(data)
    ),

  deletePlanningPeriod: (id) =>
    executeWithFallback(
      () =>
        apiRequest(`/planning-periods/${id}`, {
          method: 'DELETE',
        }),
      () => mockEngine.deletePlanningPeriod(id)
    ),

  // Recurring Activities
  getActivities: () =>
    executeWithFallback(
      () => apiRequest('/activities/'),
      () => mockEngine.getActivities()
    ),

  createActivity: (data) =>
    executeWithFallback(
      () =>
        apiRequest('/activities/', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      () => mockEngine.createActivity(data)
    ),

  deleteActivity: (id) =>
    executeWithFallback(
      () =>
        apiRequest(`/activities/${id}`, {
          method: 'DELETE',
        }),
      () => mockEngine.deleteActivity(id)
    ),

  // Events
  getEvents: (params = '') =>
    executeWithFallback(
      () => apiRequest(`/events/${params}`),
      () => mockEngine.getEvents()
    ),

  createEvent: (data) =>
    executeWithFallback(
      () =>
        apiRequest('/events/', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      () => mockEngine.createEvent(data)
    ),

  deleteEvent: (id) =>
    executeWithFallback(
      () =>
        apiRequest(`/events/${id}`, {
          method: 'DELETE',
        }),
      () => mockEngine.deleteEvent(id)
    ),

  // Schedule Engine
  getTodaySchedule: () => {
    const today = new Date().toISOString().split('T')[0];
    return api.getDaySchedule(today);
  },

  getDaySchedule: (dateStr) =>
    executeWithFallback(
      () => apiRequest(`/schedule/day/${dateStr}`),
      () => mockEngine.getDaySchedule(dateStr)
    ),

  getWeekSchedule: (dateStr) =>
    executeWithFallback(
      () => apiRequest(`/schedule/week/${dateStr}`),
      () => mockEngine.getWeekSchedule(dateStr)
    ),

  getUpcomingEvents: (limit = 25, fromDate = null) => {
    const url = fromDate
      ? `/schedule/upcoming?limit=${limit}&from_date=${fromDate}`
      : `/schedule/upcoming?limit=${limit}`;
    return executeWithFallback(
      () => apiRequest(url),
      () => mockEngine.getUpcomingEvents()
    );
  },

  // Attendance
  getCourses: () =>
    executeWithFallback(
      () => apiRequest('/attendance/courses'),
      () => mockEngine.getCourses()
    ),

  createCourse: (data) =>
    executeWithFallback(
      () =>
        apiRequest('/attendance/courses', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      () => mockEngine.createCourse(data)
    ),

  deleteCourse: (id) =>
    executeWithFallback(
      () =>
        apiRequest(`/attendance/courses/${id}`, {
          method: 'DELETE',
        }),
      () => mockEngine.deleteCourse(id)
    ),

  logAttendance: (data) =>
    executeWithFallback(
      () =>
        apiRequest('/attendance/log', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      () => mockEngine.logAttendance(data)
    ),

  getAttendanceRecords: (courseId = null) => {
    const url = courseId ? `/attendance/records?course_id=${courseId}` : '/attendance/records';
    return executeWithFallback(
      () => apiRequest(url),
      () => mockEngine.getAttendanceRecords()
    );
  },

  getAttendanceSummary: () =>
    executeWithFallback(
      () => apiRequest('/attendance/summary'),
      () => mockEngine.getAttendanceSummary()
    ),

  // Demo Seeder
  seedDemo: () =>
    executeWithFallback(
      () =>
        apiRequest('/demo/seed', {
          method: 'POST',
        }),
      () => mockEngine.seedDemo()
    ),
};
