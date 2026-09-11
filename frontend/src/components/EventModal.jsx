import React, { useState } from 'react';
import { X, Sparkles, Calendar, Clock, MapPin } from 'lucide-react';
import { api } from '../api';

export default function EventModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('Test');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#DC2626');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createEvent({
        title,
        event_type: eventType,
        start_date: startDate,
        end_date: endDate,
        start_time: isAllDay ? null : startTime,
        end_time: isAllDay ? null : endTime,
        is_all_day: isAllDay,
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

  const handleTypeChange = (type) => {
    setEventType(type);
    if (type === 'Test') setColor('#DC2626');
    else if (type === 'Exam') setColor('#EA580C');
    else if (type === 'Fest') setColor('#7C3AED');
    else if (type === 'Trip') {
      setColor('#0284C7');
      setIsAllDay(true);
    } else setColor('#059669');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-opacity duration-200">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-4 max-h-[90vh] overflow-y-auto animate-pop-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center ring-1 ring-emerald-200/60">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 className="text-lg font-black text-slate-900 font-display">Add Special Event</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Event Title *</label>
            <input
              type="text"
              required
              placeholder="Mathematics Test or College Trip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Event Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['Test', 'Exam', 'Fest', 'Trip', 'Assignment', 'Meeting', 'Personal'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`btn-press py-2 px-2 rounded-xl text-xs font-extrabold transition cursor-pointer border font-display ${
                    eventType === t
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200/90'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate < e.target.value) setEndDate(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-display">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 py-0.5">
            <input
              type="checkbox"
              id="allDay"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="allDay" className="text-xs font-bold text-slate-700 cursor-pointer font-display">
              All Day or Multi Day Event (no specific time)
            </label>
          </div>

          {!isAllDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-display">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Location (Optional)</label>
            <input
              type="text"
              placeholder="Exam Hall B or Campus Amphitheatre"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Notes (Optional)</label>
            <textarea
              rows="2"
              placeholder="Important syllabus or items to prepare"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium transition-all"
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
              {submitting ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
