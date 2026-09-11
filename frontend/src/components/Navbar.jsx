import React, { useState } from 'react';
import { Calendar, Sparkles, LogOut, RefreshCw, ChevronDown, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar({ activePeriod, onDemoSeed, isSeeding }) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Academic Themed Logo */}
        <Logo size={42} />

        {/* Center: Active Planning Period Badge with glowing live dot */}
        {activePeriod && (
          <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-100 text-xs text-slate-700 border border-slate-200 shadow-2xs transition-all">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-slate-900 font-display">{activePeriod.name}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 font-medium">
              {activePeriod.start_date} to {activePeriod.end_date}
            </span>
          </div>
        )}

        {/* Right Actions: Seed Demo Routine & Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={onDemoSeed}
            disabled={isSeeding}
            className="btn-press flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-indigo-50 via-violet-50 to-indigo-100/70 text-indigo-700 hover:from-indigo-100 hover:to-violet-100 border border-indigo-200/90 shadow-xs cursor-pointer disabled:opacity-50 transition-all"
            title="Load the demo student schedule from specification"
          >
            {isSeeding ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 fill-indigo-200" />
            )}
            <span className="hidden sm:inline">Load Demo Routine</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="btn-press flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-slate-100/90 border border-transparent hover:border-slate-200 transition-all duration-200 cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs ring-2 ring-indigo-100">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:block text-xs">
                <p className="font-bold text-slate-900 leading-tight font-display">{user?.name || 'Student'}</p>
                <p className="text-[10px] text-slate-500 font-medium leading-tight truncate max-w-[120px]">{user?.email}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-3xl bg-white/95 backdrop-blur-xl shadow-xl border border-slate-200/90 py-2.5 z-50 animate-pop-in"
                onClick={() => setShowDropdown(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 font-display">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                </div>
                {activePeriod && (
                  <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 md:hidden text-[11px]">
                    <p className="font-bold text-slate-700">{activePeriod.name}</p>
                    <p className="text-slate-500 font-medium">{activePeriod.start_date} to {activePeriod.end_date}</p>
                  </div>
                )}
                <div className="p-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors duration-150 cursor-pointer font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
