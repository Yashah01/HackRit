import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  CalendarCheck
} from 'lucide-react';
import { api } from '../api';

export default function UpcomingView({ onOpenAddEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('All');

  const fetchUpcoming = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUpcomingEvents(50);
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this event?')) {
      try {
        await api.deleteEvent(id);
        fetchUpcoming();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filterOptions = ['All', 'Test', 'Exam', 'Fest', 'Trip', 'Assignment'];

  const filteredEvents = events.filter((evt) => {
    if (filterType === 'All') return true;
    return (evt.event_type || '').toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600 mb-1.5 font-display">
              <Sparkles className="w-4 h-4" />
              <span>Future Commitments Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">Upcoming Events</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Chronological roadmap of tests, exams, university fests, and trips
            </p>
          </div>

          <button
            onClick={onOpenAddEvent}
            className="btn-press flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 transition cursor-pointer self-start sm:self-auto font-display"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Special Event</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setFilterType(opt)}
            className={`btn-press px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap font-display ${
              filterType === opt
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                : 'bg-white/90 text-slate-600 hover:bg-slate-100/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 glass-card rounded-3xl">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3 font-bold font-display">Gathering upcoming commitments...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 px-4 glass-card rounded-3xl border border-dashed border-slate-300">
          <CalendarCheck className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 font-display">No Upcoming Events Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
            {filterType !== 'All'
              ? `No events matching filter "${filterType}".`
              : 'Add upcoming tests, exams, or trips using the button above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((evt) => {
            const isTrip = evt.event_type?.toLowerCase() === 'trip' || evt.is_multi_day;
            const isExam = evt.event_type?.toLowerCase().includes('exam') || evt.event_type?.toLowerCase().includes('test');
            const isUrgent = evt.days_until >= 0 && evt.days_until <= 2;

            return (
              <div
                key={evt.id}
                className="card-hover glass-card rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between gap-4 transition-all relative overflow-hidden"
                style={{ borderTopWidth: '5px', borderTopColor: evt.color || '#059669' }}
              >
                <div>
                  {/* Top Bar: Event Type & Countdown Badge without emojis and without hyphens */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl font-display ${
                        isExam
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          : isTrip
                          ? 'bg-sky-50 text-sky-700 border border-sky-200/80'
                          : 'bg-purple-50 text-purple-700 border border-purple-200/80'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{evt.event_type || 'Event'}</span>
                    </span>

                    <span
                      className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full font-display shadow-2xs ${
                        isUrgent
                          ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white animate-pulse'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{evt.relative_text}</span>
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug font-display">
                    {evt.title}
                  </h3>

                  {/* Date & Time details without hyphens */}
                  <div className="space-y-2 mt-3.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2 font-display">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800">
                        {evt.is_multi_day
                          ? `${evt.start_date} to ${evt.end_date} (Multi Day)`
                          : evt.start_date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-display">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold">
                        {evt.is_all_day
                          ? 'All Day'
                          : evt.start_time && evt.end_time
                          ? `${evt.start_time} to ${evt.end_time}`
                          : evt.start_time || 'Scheduled'}
                      </span>
                    </div>

                    {evt.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-600">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  {evt.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50/90 p-3 rounded-2xl border border-slate-100 mt-3.5 font-medium">
                      {evt.notes}
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px] font-semibold font-display">
                    {evt.days_until >= 0 ? `${evt.days_until} days remaining` : 'Ongoing'}
                  </span>
                  <button
                    onClick={() => handleDelete(evt.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer rounded-xl hover:bg-rose-50"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
