import React from 'react';
import {
  CalendarDays,
  Clock,
  Sparkles,
  Repeat,
  GraduationCap,
  Plus,
  Compass,
  Zap
} from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, onOpenAddModal }) {
  const tabs = [
    { id: 'today', label: "Today's Plan", icon: Clock, desc: 'Immediate daily commitments' },
    { id: 'calendar', label: 'Weekly Calendar', icon: CalendarDays, desc: '7 day generated schedule' },
    { id: 'upcoming', label: 'Upcoming Events', icon: Sparkles, desc: 'Exams, fests and trips' },
    { id: 'routines', label: 'Routines and Periods', icon: Repeat, desc: 'Weekly rules and boundaries' },
    { id: 'attendance', label: 'Attendance', icon: GraduationCap, desc: 'Academic tracker and safe bunks' },
  ];

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden lg:flex flex-col w-68 shrink-0 p-4 min-h-[calc(100vh-4rem)]">
        <div className="glass-panel p-4 rounded-3xl border border-slate-200/85 shadow-sm flex flex-col flex-1">
          {/* Quick Action Button with vibrant gradient */}
          <button
            onClick={onOpenAddModal}
            className="btn-press w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-extrabold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 cursor-pointer mb-6"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="font-display tracking-tight">Create New Entry</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-2 flex-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-start gap-3.5 px-3.5 py-3 rounded-2xl text-left transition-all duration-200 cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-500/25 translate-x-1'
                      : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100/80 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold font-display leading-tight tracking-tight">{tab.label}</div>
                    <div
                      className={`text-[11px] font-normal leading-tight mt-0.5 ${
                        isActive ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {tab.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Scheduling Engine Feature Widget */}
          <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/60 border border-indigo-100/80 text-xs shadow-2xs">
            <div className="flex items-center gap-1.5 font-black text-indigo-950 mb-1 font-display">
              <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-200" />
              <span>Smart Expansion</span>
            </div>
            <p className="leading-relaxed text-slate-500 text-[11px] font-medium">
              Define recurring rules once. The system automatically places them across your entire planning period.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar with Blur and Elevation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/90 px-3 py-2 flex items-center justify-around shadow-2xl transition-all">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] transition-all duration-200 cursor-pointer ${
                isActive ? 'text-indigo-600 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl ${isActive ? 'bg-indigo-50 ring-1 ring-indigo-200' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              </div>
              <span className="truncate max-w-[55px] mt-0.5 font-display">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}

        {/* Mobile Quick Action FAB */}
        <button
          onClick={onOpenAddModal}
          className="btn-press flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 cursor-pointer -mt-5 active:scale-90 transition-transform duration-150 ring-2 ring-white"
          aria-label="Add new"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </nav>
    </>
  );
}
