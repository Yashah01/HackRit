import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  Percent
} from 'lucide-react';
import { api } from '../api';

function AttendanceRing({ percentage, target = 75, isCritical, size = 78, strokeWidth = 7.5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;
  const gradientId = `ringGrad-${isCritical ? 'crit' : 'safe'}-${Math.round(percentage)}`;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 drop-shadow-sm" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {isCritical ? (
              <>
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#be123c" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </>
            )}
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-sm font-black leading-none font-display ${isCritical ? 'text-rose-600' : 'text-emerald-600'}`}>
          {percentage}%
        </span>
        <span className="text-[9px] font-bold text-slate-400 mt-0.5 font-display">Target 75</span>
      </div>
    </div>
  );
}

export default function AttendanceView({ onOpenAddCourse }) {
  const [courses, setCourses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingId, setLoggingId] = useState(null);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cData, sData, rData] = await Promise.all([
        api.getCourses(),
        api.getAttendanceSummary(),
        api.getAttendanceRecords(),
      ]);
      setCourses(cData);
      setSummary(sData);
      setRecords(rData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleQuickLog = async (courseId, status) => {
    setLoggingId(courseId);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await api.logAttendance({
        course_id: courseId,
        date: todayStr,
        status: status,
      });
      await fetchAttendance();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoggingId(null);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Delete this course and its attendance history?')) {
      try {
        await api.deleteCourse(courseId);
        fetchAttendance();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600 mb-1.5 font-display">
              <GraduationCap className="w-4 h-4" />
              <span>Academic Attendance and Safe Bunk Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Attendance Manager
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Subject attendance tracking with real time safe bunk calculations and shortage warnings
            </p>
          </div>

          <button
            onClick={onOpenAddCourse}
            className="btn-press flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 transition cursor-pointer self-start sm:self-auto font-display"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Course or Subject</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Banner */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="glass-card p-4 sm:p-5 rounded-3xl card-hover">
            <p className="text-xs text-slate-500 font-bold font-display">Overall Attendance</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span
                className={`text-3xl sm:text-4xl font-black font-display ${
                  summary.overall_percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {summary.overall_percentage}%
              </span>
              <span className="text-[11px] text-slate-400 font-bold font-display">Target 75%</span>
            </div>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-3xl card-hover">
            <p className="text-xs text-slate-500 font-bold font-display">Classes Attended</p>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-1.5 font-display">
              {summary.total_attended} <span className="text-xs font-bold text-slate-400 font-display">/ {summary.total_classes}</span>
            </p>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-3xl card-hover">
            <p className="text-xs text-slate-500 font-bold font-display">Total Courses</p>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-1.5 font-display">{summary.total_courses}</p>
          </div>

          <div
            className={`glass-card p-4 sm:p-5 rounded-3xl card-hover border ${
              summary.critical_courses > 0
                ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
            }`}
          >
            <p className="text-xs font-bold font-display">Shortage Status</p>
            <div className="flex items-center gap-1.5 mt-2 font-black text-sm font-display">
              {summary.critical_courses > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 stroke-[2.5]" />
                  <span>{summary.critical_courses} course(s) at risk</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span>Threshold Maintained</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subject Cards with Circular Gauge */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 glass-card rounded-3xl">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3 font-bold">Loading course attendance metrics...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          Error: {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 px-4 glass-card rounded-3xl border border-dashed border-slate-300">
          <GraduationCap className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Courses Added</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">
            Track your semester courses and monitor your 75 percent threshold.
          </p>
          <button
            onClick={onOpenAddCourse}
            className="btn-press mt-4 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            Add First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const isCritical = course.is_critical;
            return (
              <div
                key={course.id}
                className={`card-hover p-6 rounded-3xl border glass-card shadow-xs flex flex-col justify-between gap-4 transition-all ${
                  isCritical ? 'border-rose-300 ring-2 ring-rose-200/50' : 'border-slate-200/90'
                }`}
              >
                <div>
                  {/* Top Bar: Subject name & Circular Progress Ring */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-base tracking-tight font-display">{course.name}</span>
                        {course.code && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-display">
                            {course.code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-semibold">
                        {course.attended_classes} attended out of {course.total_classes} classes
                      </p>
                      <p className="text-[11px] text-slate-400 font-bold mt-0.5 font-display">
                        Target: {course.target_percentage}% minimum
                      </p>
                    </div>

                    {/* Circular SVG Gauge */}
                    <AttendanceRing
                      percentage={course.current_percentage}
                      target={course.target_percentage}
                      isCritical={isCritical}
                    />
                  </div>

                  {/* Safe Bunk or Shortage Calculator Box */}
                  <div
                    className={`mt-4 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                      isCritical
                        ? 'bg-rose-50 text-rose-900 border border-rose-200/90'
                        : 'bg-emerald-50 text-emerald-900 border border-emerald-200/90'
                    }`}
                  >
                    {isCritical ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 stroke-[2.5]" />
                        <div>
                          <p className="font-black font-display">Attendance Shortage</p>
                          <p className="text-[11px] text-rose-700 leading-snug font-medium">
                            Must attend next <strong>{course.classes_needed}</strong> class(es) consecutively to reach {course.target_percentage}%.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                        <div>
                          <p className="font-black font-display">Attendance Safe</p>
                          <p className="text-[11px] text-emerald-700 leading-snug font-medium">
                            You can safely miss <strong>{course.safe_bunks}</strong> more class(es) while remaining above {course.target_percentage}%.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Log Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickLog(course.id, 'present')}
                      disabled={loggingId === course.id}
                      className="btn-press px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs transition cursor-pointer border border-emerald-200/80 shadow-2xs font-display"
                    >
                      + Present
                    </button>
                    <button
                      onClick={() => handleQuickLog(course.id, 'absent')}
                      disabled={loggingId === course.id}
                      className="btn-press px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs transition cursor-pointer border border-rose-200/80 shadow-2xs font-display"
                    >
                      + Absent
                    </button>
                    <button
                      onClick={() => handleQuickLog(course.id, 'cancelled')}
                      disabled={loggingId === course.id}
                      className="btn-press px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition cursor-pointer font-display"
                    >
                      Cancelled
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                    title="Delete course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attendance History Section */}
      {records.length > 0 && (
        <div className="glass-card rounded-3xl p-6 shadow-xs card-hover">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-indigo-600" />
            <span>Recent Attendance Records</span>
          </h3>
          <div className="divide-y divide-slate-100 text-xs font-medium">
            {records.slice(0, 8).map((rec) => (
              <div key={rec.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{rec.course_name}</span>
                  <span className="text-slate-400 ml-2 font-normal">{rec.date}</span>
                </div>
                <span
                  className={`capitalize px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                    rec.status === 'present'
                      ? 'bg-emerald-50 text-emerald-700'
                      : rec.status === 'absent'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
