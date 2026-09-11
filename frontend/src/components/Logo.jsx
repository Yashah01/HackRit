import React from 'react';

export default function Logo({ className = "w-10 h-10", iconOnly = false, size = 40 }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className={`${className} rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/20 relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/30`}
        style={{ width: size, height: size }}
      >
        {/* Subtle dynamic gloss highlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/25 opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Academic and Scheduling Shield SVG Icon */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 drop-shadow-xs relative z-10"
        >
          {/* Graduation Cap Top Diamond */}
          <path
            d="M24 6L6 16L24 26L42 16L24 6Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          {/* Cap Lower Base Arc */}
          <path
            d="M12 20.5V30C12 36.6 17.4 42 24 42C30.6 42 36 36.6 36 30V20.5L24 27.2L12 20.5Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
          {/* Central Clock Dial Accent (Time Management theme) */}
          <circle
            cx="24"
            cy="31"
            r="6.5"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M24 28V31.5H27"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Graduation Tassel and Cord */}
          <path
            d="M40 18V30C40 31.1 39.1 32 38 32C36.9 32 36 31.1 36 30V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl text-slate-900 tracking-tight leading-none">
              College Life
            </span>
            <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
              SCHEDULER
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold tracking-normal mt-0.5 hidden sm:block">
            Academic Routine and Planning Engine
          </span>
        </div>
      )}
    </div>
  );
}
