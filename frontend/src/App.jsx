import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './api';
import { CheckCircle2 } from 'lucide-react';

import Navbar from './components/Navbar';
import Navigation from './components/Navigation';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import UpcomingView from './components/UpcomingView';
import RoutinesView from './components/RoutinesView';
import AttendanceView from './components/AttendanceView';
import AuthView from './components/AuthView';

import EventModal from './components/EventModal';
import RoutineModal from './components/RoutineModal';
import PeriodModal from './components/PeriodModal';
import CourseModal from './components/CourseModal';
import UniversalAddModal from './components/UniversalAddModal';

function SchedulerApp() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [activePeriod, setActivePeriod] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState(null);

  // Modals state
  const [isUniversalAddOpen, setIsUniversalAddOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    fetchActivePeriod();
  };

  const fetchActivePeriod = async () => {
    try {
      const periods = await api.getPlanningPeriods();
      const active = periods.find((p) => p.is_active) || (periods.length > 0 ? periods[0] : null);
      setActivePeriod(active);
    } catch {
      setActivePeriod(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchActivePeriod();
    }
  }, [isAuthenticated, refreshKey]);

  const handleDemoSeed = async () => {
    setIsSeeding(true);
    try {
      await api.seedDemo();
      triggerRefresh();
      setSeedSuccessMsg('Demo routine seeded (1 April to 30 June: College, Gym, Tuition, Math Test, Cultural Fest and Trip)');
      setTimeout(() => setSeedSuccessMsg(null), 6000);
    } catch (err) {
      alert(`Failed to seed demo: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">
            Loading College Life Scheduler...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      {/* Ambient background glowing orbs & studio grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] animate-float-1" />
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-violet-500/10 blur-[120px] animate-float-2" />
        <div className="absolute bottom-10 left-1/3 w-[30rem] h-[30rem] rounded-full bg-sky-400/8 blur-[140px] animate-float-1" />
        <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>

      {/* Top Header Navbar */}
      <Navbar activePeriod={activePeriod} onDemoSeed={handleDemoSeed} isSeeding={isSeeding} />

      {/* Demo Success Toast without emojis and without hyphens */}
      {seedSuccessMsg && (
        <div className="relative z-30 bg-emerald-600 text-white text-xs px-4 py-3 text-center font-bold shadow-md animate-fade-in flex items-center justify-center gap-2 font-display">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{seedSuccessMsg}</span>
        </div>
      )}

      {/* Main App Body with Sidebar & Content */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto flex">
        {/* Navigation Sidebar / Mobile Bottom Bar */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => setIsUniversalAddOpen(true)}
        />

        {/* Dynamic Main View with smooth transition */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto transition-all duration-300">
          <div key={`${activeTab}-${refreshKey}`} className="animate-fade-in">
            {activeTab === 'today' && (
              <TodayView
                onQuickLogAttendance={() => {
                  setActiveTab('attendance');
                }}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                onSelectDayForToday={() => {
                  setActiveTab('today');
                }}
              />
            )}

            {activeTab === 'upcoming' && (
              <UpcomingView
                onOpenAddEvent={() => setIsEventModalOpen(true)}
              />
            )}

            {activeTab === 'routines' && (
              <RoutinesView
                onOpenAddRoutine={() => setIsRoutineModalOpen(true)}
                onOpenAddPeriod={() => setIsPeriodModalOpen(true)}
                onDemoSeed={handleDemoSeed}
                isSeeding={isSeeding}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceView
                onOpenAddCourse={() => setIsCourseModalOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Universal Launcher Modal */}
      <UniversalAddModal
        isOpen={isUniversalAddOpen}
        onClose={() => setIsUniversalAddOpen(false)}
        onSelectEvent={() => setIsEventModalOpen(true)}
        onSelectRoutine={() => setIsRoutineModalOpen(true)}
        onSelectPeriod={() => setIsPeriodModalOpen(true)}
        onSelectCourse={() => setIsCourseModalOpen(true)}
      />

      {/* Add Special Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSuccess={triggerRefresh}
      />

      {/* Add Recurring Activity Modal */}
      <RoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        onSuccess={triggerRefresh}
      />

      {/* Add Planning Period Modal */}
      <PeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onSuccess={triggerRefresh}
      />

      {/* Add Course Modal */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSuccess={triggerRefresh}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SchedulerApp />
    </AuthProvider>
  );
}
