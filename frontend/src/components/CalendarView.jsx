import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Repeat,
  MapPin,
  Compass,
  CalendarCheck
} from 'lucide-react';
import { api } from '../api';

export default function CalendarView({ onSelectDayForToday }) {
  const [currentDateStr, setCurrentDateStr] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileSelectedDayIndex, setMobileSelectedDayIndex] = useState(0);

  const fetchWeek = async (dateStr) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWeekSchedule(dateStr);
      setWeekData(data);
      const todayIdx = data.days.findIndex((d) => d.is_today);
      if (todayIdx !== -1) {
        setMobileSelectedDayIndex(todayIdx);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeek(currentDateStr);
  }, [currentDateStr]);

  const changeWeek = (weeks) => {
    const current = new Date(currentDateStr);
    current.setDate(current.getDate() + weeks * 7);
    setCurrentDateStr(current.toISOString().split('T')[0]);
  };

  const jumpToDate = (target) => {
    setCurrentDateStr(target);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in">
      {/* Week Header & Quick Switchers */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600 mb-1.5 font-display">
              <CalendarDays className="w-4 h-4" />
              <span>Weekly Schedule Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              {weekData ? `${weekData.days[0]?.formatted_date} to ${weekData.days[6]?.formatted_date}` : 'Weekly Calendar'}
            </h1>
            {weekData?.planning_period_name && (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active Period: <strong className="text-slate-700 font-display">{weekData.planning_period_name}</strong></span>
              </p>
            )}
          </div>

          {/* Controls: Prev / Today / Next & Demo Week Jumps without hyphens */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <button
                onClick={() => changeWeek(-1)}
                className="btn-press p-2 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => jumpToDate(new Date().toISOString().split('T')[0])}
                className="btn-press px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-white transition cursor-pointer shadow-2xs font-display"
              >
                This Week
              </button>
              <button
                onClick={() => changeWeek(1)}
                className="btn-press p-2 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Weeks without hyphens */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => jumpToDate('2026-04-14')}
                className="btn-press px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 text-indigo-700 text-xs font-extrabold transition cursor-pointer border border-indigo-200/80 shadow-2xs font-display"
                title="April 14 Week with Math Test"
              >
                Test Week (13 to 19 Apr)
              </button>
              <button
                onClick={() => jumpToDate('2026-04-25')}
                className="btn-press px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 text-xs font-extrabold transition cursor-pointer border border-purple-200/80 shadow-2xs font-display"
                title="Cultural Fest Week"
              >
                Fest Week (20 to 26 Apr)
              </button>
              <button
                onClick={() => jumpToDate('2026-05-11')}
                className="btn-press px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-50 to-cyan-50 hover:from-sky-100 hover:to-cyan-100 text-sky-700 text-xs font-extrabold transition cursor-pointer border border-sky-200/80 shadow-2xs font-display"
                title="College Trip Multi Day Event"
              >
                Trip Week (10 to 16 May)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl glass-card text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-5 font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-indigo-600 shadow-2xs"></span>
            <span className="font-bold text-slate-800">Weekly Routine</span>
            <span className="text-slate-400 font-normal">(College, Gym, Tuition)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 shadow-2xs"></span>
            <span className="font-bold text-slate-800">Special Events</span>
            <span className="text-slate-400 font-normal">(Tests, Fests, Trips)</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-indigo-600" />
          <span>Automated expansion across dates</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 glass-card rounded-3xl">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3 font-bold">Computing 7 day schedule expansion...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          Error: {error}
        </div>
      ) : (
        <>
          {/* MOBILE VIEW: Day Picker Tabs + Active Day Card Details */}
          <div className="lg:hidden space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {weekData?.days.map((day, idx) => {
                const isSelected = mobileSelectedDayIndex === idx;
                return (
                  <button
                    key={day.date}
                    onClick={() => setMobileSelectedDayIndex(idx)}
                    className={`btn-press shrink-0 flex flex-col items-center justify-center w-14 py-3 px-1 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border-transparent shadow-md shadow-indigo-200 font-bold scale-105'
                        : day.is_today
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-wider">{day.day_name.slice(0, 3)}</span>
                    <span className="text-base font-black my-0.5">{day.date.split('-')[2]}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {day.total_items}
                    </span>
                  </button>
                );
              })}
            </div>

            {weekData?.days[mobileSelectedDayIndex] && (
              <div className="glass-card rounded-3xl p-5 shadow-xs animate-pop-in">
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      {weekData.days[mobileSelectedDayIndex].day_name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{weekData.days[mobileSelectedDayIndex].formatted_date}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {weekData.days[mobileSelectedDayIndex].total_items} commitments
                  </span>
                </div>

                {weekData.days[mobileSelectedDayIndex].items.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8 font-medium">No commitments on this day.</p>
                ) : (
                  <div className="space-y-3">
                    {weekData.days[mobileSelectedDayIndex].items.map((item, i) => (
                      <div
                        key={item.id || i}
                        className="card-hover p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs flex flex-col gap-1.5"
                        style={{ borderLeftWidth: '4px', borderLeftColor: item.color || '#4F46E5' }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              item.source_type === 'recurring'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {item.source_type === 'recurring' ? 'Routine' : 'Event'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          <span className="font-bold text-slate-800">
                            {item.is_all_day
                              ? 'All Day'
                              : item.start_time && item.end_time
                              ? `${item.start_time} to ${item.end_time}`
                              : item.start_time || 'Scheduled'}
                          </span>
                          {item.location && <span className="text-slate-400">| {item.location}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DESKTOP VIEW: Full 7 Day Grid */}
          <div className="hidden lg:grid grid-cols-7 gap-3.5">
            {weekData?.days.map((day) => {
              return (
                <div
                  key={day.date}
                  className={`flex flex-col min-h-[540px] rounded-3xl border transition-all duration-300 ${
                    day.is_today
                      ? 'bg-gradient-to-b from-indigo-50/90 via-white to-white border-indigo-300/90 ring-2 ring-indigo-400/30 shadow-lg shadow-indigo-100/60'
                      : 'glass-card border-slate-200/80 hover:border-slate-300/90 shadow-2xs'
                  }`}
                >
                  {/* Day Column Header */}
                  <div className={`p-4 border-b flex items-center justify-between ${
                    day.is_today ? 'border-indigo-100 bg-indigo-50/60 rounded-t-3xl' : 'border-slate-100'
                  }`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-wider font-display">
                          {day.day_name.slice(0, 3)}
                        </p>
                        {day.is_today && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-bold font-display">{day.date.split('-').slice(1).join('/')}</p>
                    </div>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full font-display ${
                        day.is_today
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {day.total_items}
                    </span>
                  </div>

                  {/* Day Schedule Cards */}
                  <div className="p-3 space-y-2.5 flex-1 flex flex-col">
                    {day.items.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200/80 rounded-2xl my-2 bg-slate-50/40">
                        <CalendarCheck className="w-5 h-5 text-slate-300 mb-1" />
                        <span className="text-[11px] text-slate-400 font-bold font-display">Free Day</span>
                      </div>
                    ) : (
                      day.items.map((item, idx) => {
                        const isRecurring = item.source_type === 'recurring';
                        return (
                          <div
                            key={item.id || idx}
                            className="card-hover p-3 rounded-2xl border border-slate-200/90 bg-white shadow-xs flex flex-col gap-1.5 relative overflow-hidden"
                            style={{ borderLeftWidth: '4px', borderLeftColor: item.color || '#4F46E5' }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 font-display">
                                {item.title}
                              </span>
                            </div>

                            {/* Time slot without hyphens */}
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-bold font-display">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>
                                {item.is_all_day
                                  ? 'All Day'
                                  : item.start_time && item.end_time
                                  ? `${item.start_time} to ${item.end_time}`
                                  : item.start_time || 'Scheduled'}
                              </span>
                            </div>

                            {/* Location & Tags without hyphens */}
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded-md font-display ${
                                  isRecurring
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {isRecurring ? 'Routine' : 'Event'}
                              </span>
                              {item.is_multi_day && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 font-display">
                                  Multi Day
                                </span>
                              )}
                              {item.location && (
                                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[80px]">
                                  {item.location}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
