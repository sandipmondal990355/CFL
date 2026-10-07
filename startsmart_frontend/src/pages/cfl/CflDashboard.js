import React, { useState, useEffect } from 'react';
import {
  FaArrowRight,
  FaComments
} from 'react-icons/fa';
import CflNavbar from '../../components/navbar/CflNavbar';
import Profile from './Profile';
import MyFiles from './MyFiles';
import Performance from './Performance';
import Skills from './Skills';
import Meetings from './Meetings';
import Mentoring from './Mentoring';
import CflMemories from './CflMemories';

import { useAuth } from '../../context/AuthContext';
import { goalService } from '../../services/goalService';
import { cflAssignmentService } from '../../services/cflAssignmentService';

const CflDashboard = () => {
  const cflEmpCode = 1125;
  const { role, setRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [workflows, setWorkflows] = useState([]);
  const [goals, setGoals] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleQuickAction = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Fetch workflow stages, goals, and profile data from backend on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [wfList, goalsList, profileRes] = await Promise.all([
          goalService.getWorkflowByCfl(cflEmpCode).catch(() => []),
          goalService.getGoalsByCfl(cflEmpCode).catch(() => []),
          cflAssignmentService.getByCfl(cflEmpCode).catch(() => null)
        ]);
        setWorkflows(wfList || []);
        setGoals(goalsList || []);
        setProfileData(profileRes || null);
      } catch (err) {
        console.warn('Error fetching CFL dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [cflEmpCode]);

  // Stage title helper
  const getStageTitle = (stageCode) => {
    switch (stageCode) {
      case 'G30': return 'Thirty Days Plan';
      case 'G60': return 'Sixty Days Plan';
      case 'G90': return 'Ninety Days Plan';
      case 'G100': return 'Final Review';
      default: return 'Thirty Days Plan';
    }
  };

  // Determine current active/ongoing workflow plan stage
  const getOngoingWorkflow = () => {
    if (!workflows || workflows.length === 0) {
      return { stageCode: 'G30', stageName: 'Thirty Days Plan', status: 'NOT_STARTED' };
    }

    const isCompletedStatus = (status) => status === 'CYCLE_COMPLETED' || status === 'COMPLETED';

    const g30 = workflows.find(w => w.stageCode === 'G30' || w.stageId === 1 || w.stageName?.includes('30'));
    const g60 = workflows.find(w => w.stageCode === 'G60' || w.stageId === 2 || w.stageName?.includes('60'));
    const g90 = workflows.find(w => w.stageCode === 'G90' || w.stageId === 3 || w.stageName?.includes('90'));
    const g100 = workflows.find(w => w.stageCode === 'G100' || w.stageId === 4 || w.stageName?.includes('Final'));

    if (g60 && !isCompletedStatus(g60.status) && isCompletedStatus(g30?.status)) {
      return { ...g60, stageCode: 'G60', displayTitle: 'Sixty Days Plan' };
    }
    if (g90 && !isCompletedStatus(g90.status) && isCompletedStatus(g60?.status)) {
      return { ...g90, stageCode: 'G90', displayTitle: 'Ninety Days Plan' };
    }
    if (g100 && !isCompletedStatus(g100.status) && isCompletedStatus(g90?.status)) {
      return { ...g100, stageCode: 'G100', displayTitle: 'Final Review' };
    }
    if (g30) {
      return { ...g30, stageCode: 'G30', displayTitle: 'Thirty Days Plan' };
    }

    return workflows[0] || { stageCode: 'G30', stageName: 'Thirty Days Plan', status: 'NOT_STARTED' };
  };

  const ongoingWf = getOngoingWorkflow();
  const ongoingTitle = ongoingWf.displayTitle || getStageTitle(ongoingWf.stageCode || 'G30');

  // Calculate current active step index for "Your Journey" (1 to 5)
  // Step 1: Goal Setting, Step 2: Manager Approval, Step 3: Self Review, Step 4: Manager Review, Step 5: Acceptance
  const getActiveStepIndex = (wf) => {
    if (!wf) return 1;
    const st = wf.status || '';
    if (st === 'CYCLE_COMPLETED' || st === 'REASSESSMENT_REQUESTED' || wf.selfAcceptanceStatus || wf.selfAcceptedAt) {
      return 5;
    }
    if (st === 'MANAGER_REVIEW_COMPLETED' || st === 'SELF_REVIEW_COMPLETED' || (goals.length > 0 && goals.some(g => g.selfRating))) {
      return 4;
    }
    if (st === 'APPROVED' || st === 'GOALS_APPROVED' || (goals.length > 0 && goals.some(g => g.status === 'APPROVED'))) {
      return 3;
    }
    if (st === 'GOALS_SUBMITTED' || st === 'SUBMITTED' || (goals.length > 0 && goals.some(g => g.status === 'GOALS_SUBMITTED' || g.status === 'SUBMITTED'))) {
      return 2;
    }
    return 1;
  };

  const currentStepIdx = getActiveStepIndex(ongoingWf);
  const progressPct = currentStepIdx === 5 ? 100 : Math.round((currentStepIdx - 1) * 25);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-inter select-none">
      {/* Sidebar Navbar */}
      <CflNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Breadcrumbs Bar */}
        <header className="h-[64px] bg-white border-b border-[#EAE3E4] sticky top-0 z-30 flex items-center justify-between px-8 w-full">
          <div className="flex items-center">
            <button className="flex items-center gap-1.5 text-xs font-bold text-[#4A5568] hover:text-[#78161A] transition-colors bg-none border-none outline-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
              <span>Digital Lounge</span>
            </button>
            <div className="text-xs text-[#94A3B8] font-semibold ml-4">
              Home / Pravlin / <span className="text-[#78161A] font-bold">Start Smart</span>
            </div>
          </div>
          <div className="bg-[#14B8A6] text-white text-[10.5px] font-extrabold py-1.5 px-3.5 rounded-full tracking-wider shadow-sm">
            CFL DASHBOARD
          </div>
        </header>

        {/* Dashboard Main Content Body Wrapper */}
        <main className="flex-1 p-8 space-y-6 max-w-[1400px] w-full mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in duration-300">

              {/* 1. Header Banner */}
              <div className="bg-gradient-to-r from-[#B91C1C] via-[#78161A] to-[#43080A] rounded-2xl p-6 shadow-md text-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 border border-white/30 text-white flex items-center justify-center font-bold text-xl font-grotesk shadow-inner flex-shrink-0">
                    {(profileData?.cflName || profileData?.name || 'S')[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight font-grotesk flex items-center gap-2">
                      Good Morning, {profileData?.cflName || profileData?.name || 'Sneha Kumari'}! 👋
                    </h2>
                    <p className="text-xs text-white/80 font-medium mt-1">
                      Keep growing, keep inspiring. · {profileData?.designation || 'Java Developer'} (CFL Code: {cflEmpCode})
                    </p>
                  </div>
                </div>

                {/* Right Stat Cards / Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-5 py-2.5 text-center flex flex-col justify-center min-w-[130px]">
                    <span className="text-[9px] font-bold tracking-wider text-white/70 uppercase">EMPLOYMENT CATEGORY</span>
                    <span className="text-sm font-black text-white font-grotesk mt-0.5">CFL</span>
                  </div>

                  <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-5 py-2.5 text-center flex flex-col justify-center min-w-[130px]">
                    <span className="text-[9px] font-bold tracking-wider text-white/70 uppercase">EMPLOYMENT STATUS</span>
                    <span className="text-sm font-black text-white font-grotesk mt-0.5">Probation</span>
                  </div>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className="bg-white/15 hover:bg-white/25 border border-white/30 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm whitespace-nowrap"
                  >
                    View My Profile
                  </button>
                </div>
              </div>

              {/* 2. Needs Your Attention Section */}
              <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-sm border-l-4 border-l-[#78161A]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#78161A] text-sm">🔔</span>
                    <h3 className="text-sm font-bold text-[#78161A] font-grotesk">
                      Needs Your Attention
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">3 item(s)</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Task 1 */}
                  <div
                    onClick={() => setActiveTab('performance')}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 rounded-lg px-2 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xs">
                        🎯
                      </div>
                      <span className="text-xs font-bold text-slate-800 font-inter">
                        {currentStepIdx === 1
                          ? `Create and submit your ${ongoingTitle} goals`
                          : currentStepIdx === 3
                            ? `Complete your Self Review for ${ongoingTitle}`
                            : currentStepIdx === 5
                              ? `Review completed evaluation for ${ongoingTitle}`
                              : `Track status for your ${ongoingTitle} evaluation`}
                      </span>
                    </div>
                    <FaArrowRight className="text-slate-300 group-hover:text-[#78161A] text-xs transition-colors" />
                  </div>

                  {/* Task 2 */}
                  <div
                    onClick={() => setActiveTab('performance')}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 rounded-lg px-2 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-xs">
                        🎖️
                      </div>
                      <span className="text-xs font-bold text-slate-800 font-inter">
                        Submit your Final Review accomplishments
                      </span>
                    </div>
                    <FaArrowRight className="text-slate-300 group-hover:text-[#78161A] text-xs transition-colors" />
                  </div>

                  {/* Task 3 */}
                  <div
                    onClick={() => setActiveTab('mentoring')}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 rounded-lg px-2 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-xs">
                        💬
                      </div>
                      <span className="text-xs font-bold text-slate-800 font-inter">
                        Provide feedback for 2 completed mentoring session(s)
                      </span>
                    </div>
                    <FaArrowRight className="text-slate-300 group-hover:text-[#78161A] text-xs transition-colors" />
                  </div>
                </div>
              </div>

              {/* 3. Four Top Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1 */}
                <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-sm mb-2">
                    🎯
                  </div>
                  <span className="text-2xl font-black text-slate-800 font-grotesk tracking-tight">{progressPct}%</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1 font-inter">
                    {ongoingTitle.toUpperCase()} PROGRESS
                  </span>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-sm mb-2">
                    🤝
                  </div>
                  <span className="text-2xl font-black text-slate-800 font-grotesk tracking-tight">3 / 5</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1 font-inter">
                    MENTORING SESSIONS
                  </span>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-sm mb-2">
                    📅
                  </div>
                  <span className="text-2xl font-black text-slate-800 font-grotesk tracking-tight">2</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1 font-inter">
                    UPCOMING MEETINGS
                  </span>
                </div>

                {/* Card 4 */}
                <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-sm mb-2">
                    💼
                  </div>
                  <span className="text-xl font-black text-slate-800 font-grotesk tracking-tight">Probation</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1 font-inter">
                    EMPLOYMENT STATUS
                  </span>
                </div>
              </div>

              {/* 4. Middle Section (My Progress & Your Journey) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* My Progress Panel */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-sm flex flex-col justify-between">
                  <h3 className="text-base font-bold text-slate-800 font-grotesk mb-4">
                    My Progress
                  </h3>

                  <div className="space-y-5">
                    {/* Bar 1 */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5 font-inter">
                        <span>{ongoingTitle} Goals</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#78161A] h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                      </div>
                    </div>

                    {/* Bar 2 */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5 font-inter">
                        <span>Mentoring Sessions Completed</span>
                        <span>60%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#3B82F6] h-full rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
                      </div>
                    </div>

                    {/* Bar 3 */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5 font-inter">
                        <span>Final Review</span>
                        <span>0%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-slate-300 h-full rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-2">
                    <button
                      onClick={() => setActiveTab('performance')}
                      className="text-xs font-bold text-[#78161A] hover:underline flex items-center gap-1 font-inter"
                    >
                      View Performance →
                    </button>
                  </div>
                </div>

                {/* Your Journey Panel */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-800 font-grotesk">
                      Your Journey — <span className="text-[#78161A] font-extrabold">{ongoingTitle}</span>
                    </h3>
                    <span className="text-[10.5px] font-extrabold text-[#78161A] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 uppercase tracking-wider">
                      {ongoingWf.stageCode || 'G30'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between relative px-2 my-auto pt-2">
                    {/* Connecting background bar */}
                    <div className="absolute left-[36px] right-[36px] top-[18px] h-[2px] bg-slate-200 z-0"></div>

                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center z-10 relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${currentStepIdx > 1 ? 'bg-emerald-600 text-white' : currentStepIdx === 1 ? 'bg-[#78161A] text-white ring-4 ring-rose-100' : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}>
                        {currentStepIdx > 1 ? '✓' : '1'}
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 mt-2 font-inter">Goal Setting</span>
                      <span className={`text-[9.5px] font-bold mt-0.5 ${currentStepIdx > 1 ? 'text-emerald-600' : currentStepIdx === 1 ? 'text-[#78161A]' : 'text-slate-400 font-semibold'
                        }`}>
                        {currentStepIdx > 1 ? 'Completed' : currentStepIdx === 1 ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center z-10 relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${currentStepIdx > 2 ? 'bg-emerald-600 text-white' : currentStepIdx === 2 ? 'bg-[#78161A] text-white ring-4 ring-rose-100' : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}>
                        {currentStepIdx > 2 ? '✓' : '2'}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 mt-2 font-inter">Manager Approval</span>
                      <span className={`text-[9.5px] font-bold mt-0.5 ${currentStepIdx > 2 ? 'text-emerald-600' : currentStepIdx === 2 ? 'text-[#78161A]' : 'text-slate-400 font-semibold'
                        }`}>
                        {currentStepIdx > 2 ? 'Completed' : currentStepIdx === 2 ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center z-10 relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${currentStepIdx > 3 ? 'bg-emerald-600 text-white' : currentStepIdx === 3 ? 'bg-[#78161A] text-white ring-4 ring-rose-100' : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}>
                        {currentStepIdx > 3 ? '✓' : '3'}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 mt-2 font-inter">Self Review</span>
                      <span className={`text-[9.5px] font-bold mt-0.5 ${currentStepIdx > 3 ? 'text-emerald-600' : currentStepIdx === 3 ? 'text-[#78161A]' : 'text-slate-400 font-semibold'
                        }`}>
                        {currentStepIdx > 3 ? 'Completed' : currentStepIdx === 3 ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center text-center z-10 relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${currentStepIdx > 4 ? 'bg-emerald-600 text-white' : currentStepIdx === 4 ? 'bg-[#78161A] text-white ring-4 ring-rose-100' : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}>
                        {currentStepIdx > 4 ? '✓' : '4'}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 mt-2 font-inter">Manager Review</span>
                      <span className={`text-[9.5px] font-bold mt-0.5 ${currentStepIdx > 4 ? 'text-emerald-600' : currentStepIdx === 4 ? 'text-[#78161A]' : 'text-slate-400 font-semibold'
                        }`}>
                        {currentStepIdx > 4 ? 'Completed' : currentStepIdx === 4 ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>

                    {/* Step 5 */}
                    <div className="flex flex-col items-center text-center z-10 relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${currentStepIdx === 5 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}>
                        {currentStepIdx === 5 ? '✓' : '5'}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 mt-2 font-inter">Acceptance</span>
                      <span className={`text-[9.5px] font-bold mt-0.5 ${currentStepIdx === 5 ? 'text-emerald-600' : 'text-slate-400 font-semibold'
                        }`}>
                        {currentStepIdx === 5 ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              {/* 5. Bottom Section (Next Up, Recent Activity, Quick Actions) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Column 1: Next Up */}
                <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 font-grotesk mb-4">
                      Next Up
                    </h3>

                    <div className="flex items-center gap-3.5">
                      {/* Date Box */}
                      <div className="w-[52px] h-[58px] bg-[#FFF5F5] border border-rose-100 rounded-xl flex flex-col items-center justify-center text-center flex-shrink-0">
                        <span className="text-lg font-black text-[#78161A] font-grotesk leading-none">22</span>
                        <span className="text-[9px] font-black text-[#78161A] uppercase tracking-wider mt-0.5 font-inter">MAY</span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-slate-800 truncate leading-snug">
                          Mentoring Session — Rohit Verma
                        </h4>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          03:00 PM · Zoom
                        </p>
                        <span className="bg-[#E6F6EE] text-[#1E8E5A] text-[9.5px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1.5">
                          👤 Created by Mentor
                        </span>
                      </div>

                      {/* Join Button */}
                      <button
                        onClick={() => alert('Joining Zoom meeting...')}
                        className="bg-[#14B8A6] hover:bg-[#0D9488] active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex-shrink-0"
                      >
                        Join
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 mt-2">
                    <button
                      onClick={() => setActiveTab('meetings')}
                      className="text-xs font-bold text-[#78161A] hover:underline flex items-center gap-1 font-inter"
                    >
                      View All Meetings →
                    </button>
                  </div>
                </div>

                {/* Column 2: Recent Activity */}
                <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 font-grotesk mb-3">
                      Recent Activity
                    </h3>

                    <div className="divide-y divide-slate-100">
                      {/* Row 1 */}
                      <div className="py-2 flex items-center justify-between gap-2 text-[11.5px]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-[10px] flex-shrink-0">
                            💬
                          </div>
                          <span className="text-slate-700 font-medium truncate">You gave feedback on a mentoring session</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">15 May 2026</span>
                      </div>

                      {/* Row 2 */}
                      <div className="py-2 flex items-center justify-between gap-2 text-[11.5px]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center text-[10px] flex-shrink-0">
                            💬
                          </div>
                          <span className="text-slate-700 font-medium truncate">Your mentor shared feedback on a session</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">01 May 2026</span>
                      </div>

                      {/* Row 3 */}
                      <div className="py-2 flex items-center justify-between gap-2 text-[11.5px]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-[10px] flex-shrink-0">
                            📁
                          </div>
                          <span className="text-slate-700 font-medium truncate">Uploaded AWS Certified Developer - Associate.pdf</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">10 May 2026</span>
                      </div>

                      {/* Row 4 */}
                      <div className="py-2 flex items-center justify-between gap-2 text-[11.5px]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center text-[10px] flex-shrink-0">
                            📅
                          </div>
                          <span className="text-slate-700 font-medium truncate">Mentoring Session scheduled with Rohit Verma (by your Mentor)</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">22 May</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Quick Actions */}
                <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 font-grotesk mb-3">
                      Quick Actions
                    </h3>

                    <div className="grid grid-cols-4 gap-2">
                      {/* Action 1: Performance */}
                      <button
                        onClick={() => handleQuickAction('performance')}
                        className="bg-[#FDFBFB] hover:bg-slate-50 border border-[#F3EFEF] rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all hover:shadow-sm text-center"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-xs">
                          🎯
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">Performance</span>
                      </button>

                      {/* Action 2: Mentoring */}
                      <button
                        onClick={() => handleQuickAction('mentoring')}
                        className="bg-[#FDFBFB] hover:bg-slate-50 border border-[#F3EFEF] rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all hover:shadow-sm text-center"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center text-xs">
                          🤝
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">Mentoring</span>
                      </button>

                      {/* Action 3: Meetings */}
                      <button
                        onClick={() => handleQuickAction('meetings')}
                        className="bg-[#FDFBFB] hover:bg-slate-50 border border-[#F3EFEF] rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all hover:shadow-sm text-center"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-xs">
                          📅
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">Meetings</span>
                      </button>

                      {/* Action 4: Skills */}
                      <button
                        onClick={() => handleQuickAction('skills')}
                        className="bg-[#FDFBFB] hover:bg-slate-50 border border-[#F3EFEF] rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all hover:shadow-sm text-center"
                      >
                        <div className="w-7 h-7 rounded-lg bg-green-50 text-green-500 flex items-center justify-center text-xs">
                          🧩
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">Skills</span>
                      </button>

                      {/* Action 5: My Files */}
                      <button
                        onClick={() => handleQuickAction('upload-files')}
                        className="bg-[#FDFBFB] hover:bg-slate-50 border border-[#F3EFEF] rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all hover:shadow-sm text-center"
                      >
                        <div className="w-7 h-7 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-xs">
                          📁
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">My Files</span>
                      </button>

                      {/* Action 6: My Profile */}
                      <button
                        onClick={() => handleQuickAction('profile')}
                        className="bg-[#FDFBFB] hover:bg-slate-50 border border-[#F3EFEF] rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all hover:shadow-sm text-center"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center text-xs">
                          👤
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">My Profile</span>
                      </button>

                      {/* Action 7: Memories */}
                      <button
                        onClick={() => handleQuickAction('memories')}
                        className="bg-[#FDFBFB] hover:bg-slate-50 border border-[#F3EFEF] rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all hover:shadow-sm text-center"
                      >
                        <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center text-xs">
                          📷
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">Memories</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'profile' && <Profile />}
          {activeTab === 'upload-files' && <MyFiles />}
          {activeTab === 'performance' && <Performance />}
          {activeTab === 'skills' && <Skills />}
          {activeTab === 'mentoring' && <Mentoring />}
          {activeTab === 'meetings' && <Meetings />}
          {activeTab === 'memories' && <CflMemories />}

          {activeTab !== 'overview' && activeTab !== 'profile' && activeTab !== 'upload-files' && activeTab !== 'performance' && activeTab !== 'skills' && activeTab !== 'mentoring' && activeTab !== 'meetings' && activeTab !== 'memories' && (
            <div className="text-center bg-white border border-slate-100 rounded-2xl py-24 shadow-sm animate-fade-in duration-300">
              <h3 className="text-xl font-bold text-slate-800 mb-2 font-grotesk">
                {activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Section
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto font-inter">
                This subsection is under active development.
              </p>
            </div>
          )}
        </main>

        {/* Floating Chat Support Icon */}
        <button
          onClick={() => alert('Chat support starting...')}
          className="fixed bottom-6 right-6 w-12 h-12 bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50 outline-none"
        >
          <FaComments className="w-5 h-5" />
        </button>

        {/* Demo Role Control Floating Bar */}
        <div className="fixed bottom-6 left-[280px] z-40 bg-white border border-slate-200 shadow-xl rounded-xl p-3 flex flex-col gap-2 max-w-[210px] w-full">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
            DEMO ROLE CONTROL
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setRole('HR')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${role === 'HR' ? 'bg-[#78161A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              HR
            </button>
            <button
              onClick={() => setRole('Employee')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${role === 'Employee' ? 'bg-[#78161A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              CFL
            </button>
            <button
              onClick={() => setRole('Manager')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${role === 'Manager' ? 'bg-[#78161A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              MGR
            </button>
            <button
              onClick={() => setRole('Mentor')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${role === 'Mentor' ? 'bg-[#78161A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              MENTOR
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CflDashboard;
