import React, { useState } from 'react';
import ManagerNavbar from '../../components/navbar/ManagerNavbar';
import ManagerDashboard from './ManagerDashboard';
import MyCfls from './MyCfls';
import Performance from './Performance';
import Probation from './Probation';
import Meetings from './Meetings';
import { FaComments } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const ManagerPortal = () => {
  const { role, setRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen">
      {/* Sidebar Navbar */}
      <ManagerNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Breadcrumbs Bar */}
        <header className="h-[70px] bg-white border-b border-[#EAE3E4] sticky top-0 z-30 flex items-center justify-between px-[34px] w-full">
          <div className="flex items-center">
            <button className="flex items-center gap-[6px] text-[12.5px] font-bold text-[#4A5568] hover:text-[#78161A] transition-colors bg-none border-none outline-none">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
              <span>Digital Lounge</span>
            </button>
            <div className="text-[11.5px] text-[#94A3B8] font-semibold ml-[14px]">
              Home / Pravlin / <span className="text-[#78161A] font-bold">Start Smart</span>
            </div>
          </div>
          <div className="bg-[#1FB6A6] text-white text-[10.5px] font-extrabold py-[6px] px-[14px] rounded-full tracking-wider shadow-[0_4px_12px_rgba(31,182,166,0.25)] select-none">
            Manager DASHBOARD
          </div>
        </header>

        {/* Dashboard Main Content Body wrapper */}
        <main className="flex-1 p-[34px] space-y-8 max-w-[1400px] w-full">
          {activeTab === 'overview' && (
            <ManagerDashboard onNavigate={setActiveTab} />
          )}

          {activeTab === 'my-cfls' && (
            <MyCfls />
          )}

          {activeTab === 'performance' && (
            <Performance />
          )}

          {activeTab === 'probation' && (
            <Probation />
          )}

          {activeTab === 'meetings' && (
            <Meetings />
          )}

          {activeTab !== 'overview' && activeTab !== 'my-cfls' && activeTab !== 'performance' && activeTab !== 'probation' && activeTab !== 'meetings' && (
            <div className="text-center bg-white border border-[#EAE3E4] rounded-2xl py-24 shadow-sm animate-fade-in duration-300">
              <h3 className="text-xl font-bold text-slate-800 mb-2 font-grotesk">
                {activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Section
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto font-inter">
                This subsection is currently placeholder and will represent custom tasks, mentoring assignments, and files in production.
              </p>
            </div>
          )}
        </main>

        {/* Floating Chat Icon support */}
        <button
          onClick={() => alert('Need assistance? Our smart chatbot helper is here!')}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#1FB6A6] text-white rounded-full shadow-lg shadow-[#1FB6A6]/20 flex items-center justify-center hover:scale-105 hover:bg-[#1bb0a0] transition-all z-40 outline-none"
        >
          <FaComments className="w-6 h-6" />
        </button>

        {/* Demo Role switcher helper docked inside sidebar bottom area */}
        <div className="fixed bottom-3 left-3 z-50 bg-[#530E11] border border-white/10 shadow-xl rounded-xl p-2.5 flex flex-col gap-1.5 w-[236px]">
          <div className="text-[9.5px] font-bold text-[#F1935C] uppercase tracking-wider text-center">
            Demo Role Control
          </div>
          <div className="flex items-center justify-center gap-1 font-grotesk">
            <button
              onClick={() => setRole('HR')}
              className={`px-2 py-1 rounded text-[9.5px] font-bold uppercase transition-all ${role === 'HR'
                ? 'bg-[#F3C63F] text-[#78161A]'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
            >
              HR
            </button>
            <button
              onClick={() => setRole('Employee')}
              className={`px-2 py-1 rounded text-[9.5px] font-bold uppercase transition-all ${role === 'Employee'
                ? 'bg-[#F3C63F] text-[#78161A]'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
            >
              CFL
            </button>
            <button
              onClick={() => setRole('Manager')}
              className={`px-2 py-1 rounded text-[9.5px] font-bold uppercase transition-all ${role === 'Manager'
                ? 'bg-[#F3C63F] text-[#78161A]'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
            >
              Mgr
            </button>
            <button
              onClick={() => setRole('Mentor')}
              className={`px-2 py-1 rounded text-[9.5px] font-bold uppercase transition-all ${role === 'Mentor'
                ? 'bg-[#F3C63F] text-[#78161A]'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
            >
              Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPortal;
