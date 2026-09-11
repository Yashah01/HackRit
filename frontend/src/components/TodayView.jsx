import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Repeat,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Dumbbell,
  GraduationCap,
  Flame,
  ArrowUpRight,
  Radio
} from 'lucide-react';
import { api } from '../api';

export default function TodayView({ onQuickLogAttendance }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveClock, setLiveClock] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSchedule = async (dateStr) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDaySchedule(dateStr);
      setScheduleData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(selectedDate);
  }, [selectedDate]);

  const changeDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const jumpToToday = () => {
    const now = new Date();
    setSelectedDate(now.toISOString().split('T')[0]);
  };

  const jumpToDemoDate = () => {
    setSelectedDate('2026-04-14');
  };

  const isTodaySelected = selectedDate === new Date().toISOString().split('T')[0];

  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('college') || cat.includes('class') || cat.includes('study')) {
      return <BookOpen className="w-4 h-4 text-indigo-600" />;
    }
    if (cat.includes('gym') || cat.includes('sport') || cat.includes('fitness')) {
      return <Dumbbell className="w-4 h-4 text-emerald-600" />;
    }
    if (cat.includes('exam') || cat.includes('test')) {
      return <AlertCircle className="w-4 h-4 text-rose-600" />;
    }
    if (cat.includes('fest') || cat.includes('trip') || cat.includes('event')) {
      return <Sparkles className="w-4 h-4 text-purple-600" />;
    }
    return <Clock className="w-4 h-4 text-slate-600" />;
  };

  // Find active and upcoming items for the spotlight
  const currentItem = scheduleData?.items?.find((i) => i.status === 'now');
  const nextItem = scheduleData?.items?.find((i) => i.status === 'upcoming');
  const completedCount = scheduleData?.items?.filter((i) => i.status === 'past').length || 0;
  const totalCount = scheduleData?.total_items || 0;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in">
      {/* Header & Date Controls */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/90 border border-indigo-100 text-indigo-700 text-xs font-black font-display tracking-wider uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                <span>Daily Agenda</span>
              </div>

              {/* Real time clock pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 text-xs font-mono font-bold border border-slate-200/80 shadow-2xs">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{liveClock}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              {scheduleData?.day_name ? `${scheduleData.day_name}, ${scheduleData.formatted_date}` : "Today's Plan"}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Real time schedule populated automatically by the recurrence engine
            </p>
          </div>

          {/* Date Selector Navigation without hyphens */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <button
                onClick={() => changeDate(-1)}
                className="btn-press p-2 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-transparent hover:bg-white focus:outline-none transition cursor-pointer font-display"
              />
              <button
                onClick={() => changeDate(1)}
                className="btn-press p-2 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {!isTodaySelected && (
              <button
                onClick={jumpToToday}
                className="btn-press px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-700 shadow-2xs transition cursor-pointer font-display"
              >
                Today
              </button>
            )}

            <button
              onClick={jumpToDemoDate}
              className="btn-press px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 border border-indigo-200/90 text-xs font-extrabold text-indigo-700 shadow-2xs transition cursor-pointer whitespace-nowrap font-display"
              title="Jump to 14 April 2026 with Math Test"
            >
              Test Day (14 April)
            </button>
          </div>
        </div>

        {/* Day Progress Meter */}
        {totalCount > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 font-display">Day Progress</span>
              <div className="w-44 bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/50">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                  style={{ width: `${completionPercent}%` }}
                ></div>
              </div>
              <span className="text-xs font-black text-indigo-600 font-display">{completionPercent}%</span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">
              {completedCount} of {totalCount} commitments completed
            </span>
          </div>
        )}
      </div>

      {/* Spotlight Card: Happening Now / Next Up Hero */}
      {currentItem ? (
        <div className="p-7 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden card-hover">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 translate-y-10 w-40 h-40 rounded-full bg-violet-400/20 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-200 font-display">
                  HAPPENING NOW
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-display">{currentItem.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-100 font-medium">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl backdrop-blur-xs">
                  <Clock className="w-3.5 h-3.5 text-indigo-200" />
                  <span className="font-bold">{currentItem.start_time} to {currentItem.end_time}</span>
                </div>
                {currentItem.location && (
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl backdrop-blur-xs">
                    <MapPin className="w-3.5 h-3.5 text-indigo-200" />
                    <span>{currentItem.location}</span>
                  </div>
                )}
                <span className="capitalize px-2.5 py-1 rounded-xl bg-white/15 font-semibold text-[11px]">
                  {currentItem.category}
                </span>
              </div>
            </div>

            {currentItem.category?.toLowerCase() === 'college' && (
              <button
                onClick={() => onQuickLogAttendance && onQuickLogAttendance(currentItem.title, selectedDate)}
                className="btn-press self-start md:self-auto px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs shadow-lg transition cursor-pointer flex items-center gap-2 font-display"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Mark Present</span>
              </button>
            )}
          </div>
        </div>
      ) : nextItem ? (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg flex items-center justify-between gap-4 card-hover border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-300 ring-1 ring-white/20">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 font-display">
                UP NEXT TODAY
              </span>
              <p className="font-black text-white text-lg leading-snug font-display">{nextItem.title}</p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Starts at {nextItem.start_time} {nextItem.location ? `at ${nextItem.location}` : ''}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Summary Cards with Modern Neumorphic/Glass Accents */}
      {scheduleData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-3xl card-hover relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 font-display">Total Agenda</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-200 transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2 font-display">{scheduleData.total_items}</p>
            <div className="mt-2 text-[11px] font-semibold text-slate-400">
              {scheduleData.total_items === 1 ? '1 commitment' : `${scheduleData.total_items} commitments`}
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl card-hover relative overflow-hidden group bg-gradient-to-br from-indigo-50/80 via-white to-white border-indigo-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 font-display">Weekly Routine</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-indigo-950 mt-2 font-display">
              {scheduleData.items.filter((i) => i.source_type === 'recurring').length}
            </p>
            <div className="mt-2 text-[11px] font-semibold text-indigo-600/80">
              Regular classes and activities
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl card-hover relative overflow-hidden group bg-gradient-to-br from-violet-50/80 via-white to-white border-violet-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-violet-700 font-display">Special Events</span>
              <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 group-hover:bg-violet-200 transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-violet-950 mt-2 font-display">
              {scheduleData.items.filter((i) => i.source_type === 'event').length}
            </p>
            <div className="mt-2 text-[11px] font-semibold text-violet-600/80">
              Exams, fests and trips
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl card-hover relative overflow-hidden group bg-gradient-to-br from-emerald-50/80 via-white to-white border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 font-display">Day Status</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 font-black text-2xl text-emerald-950 font-display flex items-center gap-2">
              {scheduleData.total_items > 0 ? (
                <>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active</span>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span className="text-slate-500">Free Day</span>
                </>
              )}
            </div>
            <div className="mt-2 text-[11px] font-semibold text-emerald-700/80">
              {completedCount} completed
            </div>
          </div>
        </div>
      )}

      {/* Main Timeline Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 glass-card rounded-3xl">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3 font-bold font-display">Calculating day commitments...</p>
        </div>
      ) : error ? (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          Error: {error}
        </div>
      ) : scheduleData?.items?.length === 0 ? (
        <div className="text-center py-20 px-4 glass-card rounded-3xl border border-dashed border-slate-300 relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-50 to-violet-50 text-indigo-500 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800 font-display">Schedule Open and Free</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 font-medium leading-relaxed">
            No regular lectures, routines or special events fall on this date ({selectedDate}). Enjoy your free time or prepare for upcoming milestones!
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={jumpToDemoDate}
              className="btn-press px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 cursor-pointer font-display"
            >
              Jump to Demo Test Day (14 April)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {scheduleData?.items?.map((item, idx) => {
            const isRecurring = item.source_type === 'recurring';
            const isNow = item.status === 'now';

            return (
              <div
                key={item.id || idx}
                className={`card-hover relative p-5 sm:p-6 rounded-3xl border transition-all ${
                  isNow
                    ? 'bg-gradient-to-r from-indigo-50/95 via-violet-50/90 to-white border-indigo-300/90 shadow-md ring-2 ring-indigo-300/50'
                    : 'glass-card border-slate-200/85 hover:border-indigo-200/90 shadow-2xs'
                }`}
                style={{ borderLeftWidth: '5px', borderLeftColor: item.color || '#4F46E5' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Category Icon Badge */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 shadow-2xs"
                      style={{
                        backgroundColor: `${item.color}15`,
                        borderColor: `${item.color}35`,
                      }}
                    >
                      {getCategoryIcon(item.category)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight font-display">
                          {item.title}
                        </span>

                        {/* Source Badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border font-display ${
                            isRecurring
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                          }`}
                        >
                          {isRecurring ? <Repeat className="w-3 h-3 stroke-[2.5]" /> : <Sparkles className="w-3 h-3 stroke-[2.5]" />}
                          {isRecurring ? 'Weekly Routine' : 'Special Event'}
                        </span>

                        {/* Multi Day badge */}
                        {item.is_multi_day && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80 font-display">
                            Multi Day ({item.multi_day_start} to {item.multi_day_end})
                          </span>
                        )}

                        {/* Now badge */}
                        {isNow && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-600 text-white animate-pulse font-display shadow-xs">
                            ACTIVE NOW
                          </span>
                        )}
                      </div>

                      {/* Time slot without hyphens */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 font-display">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {item.is_all_day
                              ? 'All Day'
                              : item.start_time && item.end_time
                              ? `${item.start_time} to ${item.end_time}`
                              : item.start_time || 'Scheduled'}
                          </span>
                        </div>

                        {item.location && (
                          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.location}</span>
                          </div>
                        )}

                        <span className="text-slate-300">/</span>
                        <span className="capitalize font-semibold text-slate-500">{item.category}</span>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-2.5 font-medium bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Attendance Log shortcut */}
                  {item.category?.toLowerCase() === 'college' && (
                    <div className="shrink-0 self-center hidden sm:flex flex-col gap-1">
                      <button
                        onClick={() => onQuickLogAttendance && onQuickLogAttendance(item.title, selectedDate)}
                        className="btn-press flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs font-extrabold transition-all shadow-2xs cursor-pointer font-display"
                        title="Mark Attendance for this lecture"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                        <span>Log Attendance</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
