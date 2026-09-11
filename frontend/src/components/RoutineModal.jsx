import React, { useState, useEffect } from 'react';
import { X, Repeat, Clock, Calendar } from 'lucide-react';
import { api } from '../api';

export default function RoutineModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('College');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('15:00');
  const [planningPeriodId, setPlanningPeriodId] = useState('');
  const [periods, setPeriods] = useState([]);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const weekdays = [
    { code: 'Mon', label: 'Mon' },
    { code: 'Tue', label: 'Tue' },
    { code: 'Wed', label: 'Wed' },
    { code: 'Thu', label: 'Thu' },
    { code: 'Fri', label: 'Fri' },
    { code: 'Sat', label: 'Sat' },
    { code: 'Sun', label: 'Sun' },
  ];

  useEffect(() => {
    if (isOpen) {
      api.getPlanningPeriods().then((res) => {
        setPeriods(res);
        const active = res.find((p) => p.is_active);
        if (active) setPlanningPeriodId(active.id);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return;
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (cat === 'College') setColor('#4F46E5');
    else if (cat === 'Gym') setColor('#059669');
    else if (cat === 'Tuition') setColor('#D97706');
    else if (cat === 'Study') setColor('#2563EB');
    else if (cat === 'Club') setColor('#7C3AED');
    else setColor('#0F766E');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      setError('Please select at least one day of the week');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await api.createActivity({
        title,
        category,
        days_of_week: selectedDays,
        start_time: startTime,
        end_time: endTime,
        planning_period_id: planningPeriodId ? Number(planningPeriodId) : null,
        location: location.trim() || null,
        notes: notes.trim() || null,
        color,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-opacity duration-200">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-4 max-h-[90vh] overflow-y-auto animate-pop-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center ring-1 ring-indigo-200/60">
              <Repeat className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 className="text-lg font-black text-slate-900 font-display">Add Recurring Activity</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Activity Title *</label>
            <input
              type="text"
              required
              placeholder="College Timetable or Gym Routine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Category</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['College', 'Gym', 'Tuition', 'Study', 'Club', 'Sports'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => handleCategoryChange(c)}
                  className={`btn-press py-2 px-2 rounded-xl text-xs font-extrabold transition cursor-pointer border font-display ${
                    category === c
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200/90'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Weekday selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-display">
              Repeating Days of Week * ({selectedDays.length} selected)
            </label>
            <div className="grid grid-cols-7 gap-1">
              {weekdays.map((d) => {
                const active = selectedDays.includes(d.code);
                return (
                  <button
                    type="button"
                    key={d.code}
                    onClick={() => toggleDay(d.code)}
                    className={`btn-press py-2.5 rounded-xl text-xs font-black transition cursor-pointer border font-display ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-500 border-slate-200/90 hover:bg-slate-100'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Start Time *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-display">End Time *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
              />
            </div>
          </div>

          {/* Planning Period select without hyphens */}
          {periods.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-display">
                Bound to Planning Period
              </label>
              <select
                value={planningPeriodId}
                onChange={(e) => setPlanningPeriodId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
              >
                <option value="">User Active Period (Default)</option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.start_date} to {p.end_date})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Location (Optional)</label>
            <input
              type="text"
              placeholder="Block 3 Room 204 or Campus Fitness Center"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Notes (Optional)</label>
            <textarea
              rows="2"
              placeholder="Any instructions or notes about this routine"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
            ></textarea>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-press px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer font-display"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-press px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-black transition cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-500/20 font-display"
            >
              {submitting ? 'Creating Rule...' : 'Save Routine Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
