import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';

export default function RoutinesView({
  onOpenAddRoutine,
  onOpenAddPeriod,
  onDemoSeed,
  isSeeding
}) {
  const [periods, setPeriods] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pData, aData] = await Promise.all([
        api.getPlanningPeriods(),
        api.getActivities(),
      ]);
      setPeriods(pData);
      setActivities(aData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteActivity = async (id) => {
    if (window.confirm('Delete this recurring activity rule?')) {
      try {
        await api.deleteActivity(id);
        fetchData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDeletePeriod = async (id) => {
    if (window.confirm('Delete this planning period? Activities attached will remain.')) {
      try {
        await api.deletePlanningPeriod(id);
        fetchData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const dayLetters = [
    { code: 'Mon', label: 'M' },
    { code: 'Tue', label: 'T' },
    { code: 'Wed', label: 'W' },
    { code: 'Thu', label: 'T' },
    { code: 'Fri', label: 'F' },
    { code: 'Sat', label: 'S' },
    { code: 'Sun', label: 'S' },
  ];

  return (
    <div className="space-y-8 pb-20 lg:pb-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600 mb-1.5 font-display">
              <Repeat className="w-4 h-4" />
              <span>Recurring Rules and Boundaries</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Routines and Planning Period
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Define your routine once. The scheduling engine automatically populates every calendar date.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={onOpenAddPeriod}
              className="btn-press px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200 shadow-2xs font-display"
            >
              Add Planning Period
            </button>
            <button
              onClick={onOpenAddRoutine}
              className="btn-press flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 transition cursor-pointer font-display"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Recurring Routine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Routine Callout Banner without emojis and without hyphens */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-7 text-white shadow-xl shadow-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all border border-indigo-900/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="space-y-2 max-w-xl relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
            <span className="text-xs font-black uppercase tracking-wider text-indigo-300 font-display">
              One Click Specification Scenario
            </span>
          </div>
          <h3 className="text-xl font-black font-display tracking-tight">Try the College Student Demo Routine</h3>
          <p className="text-xs text-indigo-200/90 leading-relaxed font-medium">
            Instantly loads: Planning Period (1 April to 30 June), College (Monday to Friday 09:00 to 15:00),
            Gym (Mon, Wed, Fri 18:00 to 19:00), Tuition (Tue, Thu 19:30 to 21:00), Tests, Fests, and Trips.
          </p>
        </div>
        <button
          onClick={onDemoSeed}
          disabled={isSeeding}
          className="btn-press px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs shadow-lg shadow-indigo-500/30 transition cursor-pointer whitespace-nowrap self-start md:self-auto disabled:opacity-50 font-display relative z-10"
        >
          {isSeeding ? 'Loading Scenario...' : 'Load Demo Routine'}
        </button>
      </div>

      {/* Section 1: Active Planning Periods without emojis and without hyphens */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 font-display">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Planning Periods (Schedule Boundaries)</span>
          </h2>
          <span className="text-xs text-slate-400 font-bold font-display">{periods.length} registered</span>
        </div>

        {periods.length === 0 ? (
          <div className="p-8 glass-card rounded-3xl border border-dashed border-slate-300 text-center">
            <p className="text-xs text-slate-500 font-medium">No planning periods defined yet.</p>
            <button
              onClick={onOpenAddPeriod}
              className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 font-display"
            >
              Create your first planning period (e.g. 1 April to 30 June)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {periods.map((p) => (
              <div
                key={p.id}
                className={`card-hover p-5 rounded-3xl border glass-card shadow-2xs flex items-center justify-between gap-4 transition-all ${
                  p.is_active ? 'border-emerald-300 ring-2 ring-emerald-200/50' : 'border-slate-200/90'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-slate-900 text-sm font-display">{p.name}</span>
                    {p.is_active && (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-display">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2 font-display font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.start_date} to {p.end_date}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleDeletePeriod(p.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                  title="Delete period"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Recurring Activities */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 font-display">
            <Repeat className="w-4 h-4 text-indigo-600" />
            <span>Recurring Weekly Routines</span>
          </h2>
          <span className="text-xs text-slate-400 font-bold font-display">{activities.length} routine rules</span>
        </div>

        {activities.length === 0 ? (
          <div className="p-8 glass-card rounded-3xl border border-dashed border-slate-300 text-center">
            <p className="text-xs text-slate-500 font-medium">No recurring routines configured.</p>
            <button
              onClick={onOpenAddRoutine}
              className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 font-display"
            >
              Add a routine rule (e.g. Gym Mon, Wed, Fri 18:00 to 19:00)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((act) => {
              const activeDays = act.days_of_week || [];
              return (
                <div
                  key={act.id}
                  className="card-hover p-5 rounded-3xl border glass-card shadow-2xs flex flex-col justify-between gap-4 transition-all"
                  style={{ borderLeftWidth: '5px', borderLeftColor: act.color || '#4F46E5' }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-display">
                        {act.category}
                      </span>
                      <button
                        onClick={() => handleDeleteActivity(act.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                        title="Delete routine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="font-black text-slate-900 text-base font-display leading-snug">{act.title}</h3>

                    {/* Time Slot without hyphens */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold mt-2 font-display">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{act.start_time} to {act.end_time}</span>
                    </div>

                    {act.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{act.location}</span>
                      </div>
                    )}

                    {/* Days of Week Badges */}
                    <div className="flex items-center gap-1.5 mt-4">
                      {dayLetters.map((d) => {
                        const isMatch = activeDays.includes(d.code);
                        return (
                          <div
                            key={d.code}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black transition-all font-display ${
                              isMatch
                                ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm ring-1 ring-indigo-200 scale-105'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                            title={d.code}
                          >
                            {d.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {act.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50/90 p-3 rounded-2xl border border-slate-100 font-medium">
                      {act.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
