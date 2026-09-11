import React, { useState } from 'react';
import { Sparkles, Check, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function AuthView() {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-800/20 animate-pop-in">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="p-8 sm:p-10 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-6">
              <Logo size={48} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 leading-tight font-display">
              Define your routine once. We build your semester.
            </h1>

            <p className="text-xs text-indigo-100 mt-3 leading-relaxed font-medium">
              Centralize your college routine, gym, tuition, exams, fests, and attendance in one intelligent system.
            </p>

            <div className="space-y-3 mt-8">
              {[
                'Automatic weekly recurrence expansion',
                'Time bounded planning period constraints',
                'Special tests and multi day trip tracking',
                'Academic attendance and safe bunk calculator',
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-indigo-50 font-medium">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-300 stroke-[2.5]" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-indigo-500/40 text-[11px] text-indigo-200 flex items-center justify-between font-display font-semibold relative z-10">
            <span>Multi User Isolated Architecture</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> JWT Secured
            </span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              {isRegister ? 'Create Student Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isRegister
                ? 'Join College Life Scheduler to organize your semester'
                : 'Sign in to access your generated schedule and attendance'}
            </p>
          </div>

          {/* Instant 1-Click Demo Login Button without hyphens and without emojis */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn-press w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer mb-5 disabled:opacity-50 font-display"
          >
            <Sparkles className="w-4 h-4 text-white fill-white/20" />
            <span>Instant Demo Student Login</span>
          </button>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider font-display">Or with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-display">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer shadow-md shadow-slate-900/10 mt-3 disabled:opacity-50 font-display"
            >
              {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-extrabold transition cursor-pointer font-display"
            >
              {isRegister ? 'Already have an account? Sign In' : 'New student? Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
