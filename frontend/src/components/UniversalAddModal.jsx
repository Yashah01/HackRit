import React from 'react';
import { X, Sparkles, Repeat, Calendar, GraduationCap } from 'lucide-react';

export default function UniversalAddModal({
  isOpen,
  onClose,
  onSelectEvent,
  onSelectRoutine,
  onSelectPeriod,
  onSelectCourse,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-opacity duration-200">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-4 animate-pop-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 font-display">What would you like to add?</h2>
            <p className="text-xs text-slate-500 font-medium">Choose commitment type to build your schedule</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => {
              onClose();
              onSelectEvent();
            }}
            className="btn-press w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/60 transition-all cursor-pointer text-left group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform ring-1 ring-emerald-200/60">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 font-display">Special Event</p>
              <p className="text-[11px] text-slate-500 font-medium">Test, Exam, College Fest, or Multi Day Trip</p>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectRoutine();
            }}
            className="btn-press w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/60 transition-all cursor-pointer text-left group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform ring-1 ring-indigo-200/60">
              <Repeat className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 font-display">Recurring Routine</p>
              <p className="text-[11px] text-slate-500 font-medium">College timetable, Gym, or Tuition rule</p>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectPeriod();
            }}
            className="btn-press w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80 transition-all cursor-pointer text-left group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform ring-1 ring-slate-200">
              <Calendar className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 font-display">Planning Period</p>
              <p className="text-[11px] text-slate-500 font-medium">Define calendar boundaries (e.g. 1 Apr to 30 Jun)</p>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectCourse();
            }}
            className="btn-press w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 hover:border-violet-300 hover:bg-violet-50/60 transition-all cursor-pointer text-left group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center group-hover:scale-105 transition-transform ring-1 ring-violet-200/60">
              <GraduationCap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 font-display">Course or Subject</p>
              <p className="text-[11px] text-slate-500 font-medium">Track 75 percent attendance criteria and safe bunks</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
