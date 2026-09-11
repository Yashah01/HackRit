import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { api } from '../api';

export default function PeriodModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('Spring 2026 Semester');
  const [startDate, setStartDate] = useState('2026-04-01');
  const [endDate, setEndDate] = useState('2026-06-30');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createPlanningPeriod({
        name,
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
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
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-4 animate-pop-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center ring-1 ring-indigo-200/60">
              <Calendar className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 className="text-lg font-black text-slate-900 font-display">Add Planning Period</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Period Name *</label>
            <input
              type="text"
              required
              placeholder="Spring 2026 Semester"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Start Date *</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-display">End Date *</label>
            <input
              type="date"
              required
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 py-0.5">
            <input
              type="checkbox"
              id="periodActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="periodActive" className="text-xs font-bold text-slate-700 cursor-pointer font-display">
              Set as current active planning period
            </label>
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
              {submitting ? 'Saving...' : 'Create Period'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
