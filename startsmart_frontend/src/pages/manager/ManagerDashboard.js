import React, { useState, useEffect } from 'react';
import {
  FaFileAlt,
  FaCalendarAlt,
  FaBullseye,
  FaHourglassHalf
} from 'react-icons/fa';
import MetricCard from '../../components/molecules/MetricCard';
import cflAssignmentService from '../../services/cflAssignmentService';
import goalService from '../../services/goalService';

const ManagerDashboard = ({ onNavigate }) => {
  const managerEmpCode = 2002;
  const [batchYear, setBatchYear] = useState('2026');
  const [loading, setLoading] = useState(true);
  const [managerName, setManagerName] = useState('Ankit Chauhan');

  // Dynamic Metrics derived from backend for Manager 2002
  const [metrics, setMetrics] = useState({
    totalCfls: 0,
    goalsUnderReview: 0,
    probationDue: 0,
    pendingReviews: 0,
    onTrackCount: 0,
    needsAttentionCount: 0,
    atRiskCount: 0,
    meetingsTodayCount: 1
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch CFL assignments for Manager 2002
        let assignments = [];
        try {
          const res = await cflAssignmentService.getByManager(managerEmpCode, {
            year: batchYear,
            page: 0,
            size: 50
          });
          assignments = res.content || [];
        } catch (e) {
          console.warn('Failed to fetch assignments for manager', managerEmpCode, e);
        }

        // 2. Fetch goal workflows from backend
        let workflows = [];
        try {
          workflows = await goalService.getWorkflows();
        } catch (e) {
          console.warn('Failed to fetch goal workflows', e);
        }

        if (!active) return;

        // Filter workflows assigned to Manager 2002
        const managerWfs = workflows.filter(
          w => String(w.managerEmpId) === String(managerEmpCode) || String(w.managerEmpCode) === String(managerEmpCode)
        );

        // Derive stats
        const total = assignments.length > 0 ? assignments.length : (managerWfs.length > 0 ? new Set(managerWfs.map(w => w.cflEmpId)).size : 0);
        
        let underReview = 0;
        let pending = 0;
        let probation = 0;

        let onTrack = 0;
        let needsAttention = 0;
        let atRisk = 0;

        // Process CFL statuses
        if (assignments.length > 0) {
          assignments.forEach((cfl) => {
            const status = cfl.status || 'On Track';
            const progress = cfl.goalProgress || 0;

            if (status.includes('Confirm') || progress >= 80) {
              onTrack++;
            } else if (progress >= 40 || status.includes('Track')) {
              onTrack++;
            } else if (progress > 0) {
              needsAttention++;
              underReview++;
            } else {
              atRisk++;
              pending++;
            }

            if (!status.includes('Confirm')) {
              probation++;
            }
          });
        } else {
          onTrack = Math.ceil(total * 0.6);
          needsAttention = Math.floor(total * 0.25);
          atRisk = total - onTrack - needsAttention;
          underReview = needsAttention;
          pending = atRisk;
          probation = total;
        }

        // Generate dynamic recent activity from live workflows
        const activities = (workflows || []).slice(0, 3).map((w, idx) => ({
          id: idx + 1,
          text: `${w.cflName || 'CFL ' + w.cflEmpId} updated review cycle (${w.stageName || w.stageCode || '30 Days'})`,
          time: 'Recently'
        }));

        setMetrics({
          totalCfls: total,
          goalsUnderReview: underReview,
          probationDue: probation,
          pendingReviews: pending,
          onTrackCount: onTrack,
          needsAttentionCount: needsAttention,
          atRiskCount: atRisk,
          meetingsTodayCount: 1
        });

        if (activities.length > 0) {
          setRecentActivities(activities);
        }
      } catch (err) {
        console.error('Error fetching manager dashboard metrics:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      active = false;
    };
  }, [batchYear, managerEmpCode]);

  // Donut SVG Calculations
  const radius = 38;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius; // ~238.76

  const totalForChart = metrics.totalCfls || 1;
  const pctGreen = metrics.onTrackCount / totalForChart;
  const pctOrange = metrics.needsAttentionCount / totalForChart;
  const pctRed = metrics.atRiskCount / totalForChart;

  const arcGreen = pctGreen * circumference;
  const arcOrange = pctOrange * circumference;
  const arcRed = pctRed * circumference;

  return (
    <div className="space-y-8 animate-fade-in duration-300 font-inter text-left">
      {/* Greetings Banner */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#1B1418] tracking-tight flex items-center gap-2 font-grotesk">
            Good Morning, {managerName}! 🖐👋
          </h2>
          <p className="text-[13px] text-slate-500 mt-1 font-medium font-inter">
            Here's your team overview for Manager ID {managerEmpCode}.
          </p>
        </div>

        {/* Year Selection Dropdown & Schedule Meeting CTA */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              className="appearance-none bg-white border border-[#EAE3E4] rounded-lg px-4 py-2 pr-9 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#78161A]/10 focus:border-[#78161A] cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          <button
            onClick={() => onNavigate ? onNavigate('meetings') : alert('Opening Meeting Scheduler...')}
            className="bg-[#78161A] hover:bg-[#631013] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md active:scale-95 transition-all text-center cursor-pointer"
          >
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid Layout */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="My CFLs" value={loading ? "..." : String(metrics.totalCfls)} badgeText="Assigned" badgeVariant="green" />
        <MetricCard title="Goals Under Review" value={loading ? "..." : String(metrics.goalsUnderReview)} badgeText="Sessions" badgeVariant="green" />
        <MetricCard title="Probation Due" value={loading ? "..." : String(metrics.probationDue)} badgeText="Active" badgeVariant="green" />
        <MetricCard title="Pending Reviews" value={loading ? "..." : String(metrics.pendingReviews)} badgeText="Due" badgeVariant="red" />
      </section>

      {/* Middle Section: Team Overview Donut Chart and My Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
        {/* Team Overview Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-[#78161A] tracking-tight font-grotesk uppercase">
              Team Overview
            </h3>
          </div>
          <div className="flex-1 flex items-center justify-around gap-[20px] font-inter">
            {/* Segmented Donut Chart SVG */}
            <div className="relative w-[155px] h-[155px] flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Segment 1: On Track (Green) */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#1E8E5A"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${arcGreen} ${circumference}`}
                  strokeDashoffset="0"
                />
                {/* Segment 2: Needs Attention (Orange) */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#E28743"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${arcOrange} ${circumference}`}
                  strokeDashoffset={-arcGreen}
                />
                {/* Segment 3: At Risk (Red) */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#C0392B"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${arcRed} ${circumference}`}
                  strokeDashoffset={-(arcGreen + arcOrange)}
                />
              </svg>
              {/* Central Label inside Donut Chart */}
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-[26px] font-bold text-slate-800 tracking-tight leading-none">
                  {metrics.totalCfls}
                </span>
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mt-1">CFLs</span>
              </div>
            </div>

            {/* Side Legend with detailed counters */}
            <div className="flex flex-col gap-3 font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1E8E5A]"></span>
                <span className="text-[12.5px]">
                  On Track — <strong className="text-slate-800">{metrics.onTrackCount} ({Math.round(pctGreen * 100)}%)</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E28743]"></span>
                <span className="text-[12.5px]">
                  Needs Attention — <strong className="text-slate-800">{metrics.needsAttentionCount} ({Math.round(pctOrange * 100)}%)</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C0392B]"></span>
                <span className="text-[12.5px]">
                  At Risk — <strong className="text-slate-800">{metrics.atRiskCount} ({Math.round(pctRed * 100)}%)</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* My Action Center Card Grid Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-[#78161A] tracking-tight font-grotesk uppercase">
              My Action Center
            </h3>
            <button
              onClick={() => onNavigate ? onNavigate('my-cfls') : alert('Navigating to CFL list...')}
              className="text-[11.5px] font-extrabold text-[#78161A] hover:underline uppercase tracking-wider cursor-pointer"
            >
              View All Actions
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center divide-y divide-slate-100 font-inter">
            {/* Goal Review Item */}
            <div className="py-3 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="text-[13px] text-amber-500 bg-amber-50 p-2 rounded-xl border border-amber-100 flex items-center justify-center">
                  <FaBullseye />
                </span>
                <span className="text-[13px] text-slate-700 font-bold">Goal reviews pending</span>
              </div>
              <span className="text-[13px] font-black text-rose-700">{metrics.goalsUnderReview} CFLs</span>
            </div>
            {/* Performance Reviews Item */}
            <div className="py-3 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="text-[13px] text-blue-500 bg-blue-50 p-2 rounded-xl border border-blue-105 flex items-center justify-center">
                  <FaFileAlt />
                </span>
                <span className="text-[13px] text-slate-700 font-bold">Performance reviews pending</span>
              </div>
              <span className="text-[13px] font-black text-rose-700">{metrics.pendingReviews} CFLs</span>
            </div>
            {/* Probation Confirmations Item */}
            <div className="py-3 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="text-[13px] text-indigo-500 bg-indigo-50 p-2 rounded-xl border border-indigo-105 flex items-center justify-center">
                  <FaHourglassHalf />
                </span>
                <span className="text-[13px] text-slate-700 font-bold">Probation confirmations due</span>
              </div>
              <span className="text-[13px] font-black text-rose-700">{metrics.probationDue} CFLs</span>
            </div>
            {/* Meetings Today Item */}
            <div className="py-3 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="text-[13px] text-emerald-500 bg-emerald-50 p-2 rounded-xl border border-emerald-100 flex items-center justify-center">
                  <FaCalendarAlt />
                </span>
                <span className="text-[13px] text-slate-700 font-bold">Meetings today</span>
              </div>
              <span className="text-[13px] font-black text-rose-700">{metrics.meetingsTodayCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Upcoming Meetings and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-2">
        {/* Meetings Card */}
        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-[#78161A] tracking-tight font-grotesk uppercase">
              Upcoming Meetings
            </h3>
            <button 
              onClick={() => onNavigate ? onNavigate('meetings') : null}
              className="text-[11.5px] font-extrabold text-[#78161A] hover:underline uppercase tracking-wider cursor-pointer"
            >
              View Calendar
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-4 font-inter">
            {/* Meeting Row 1 */}
            <div className="flex items-start gap-4 p-3 bg-slate-50/70 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="bg-rose-50 border border-rose-100 text-[#78161A] rounded-lg p-2 flex flex-col items-center justify-center min-w-[50px] font-bold">
                <span className="text-[15px] font-extrabold">12</span>
                <span className="text-[9.5px] uppercase font-bold tracking-wider mt-0.5">May</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[13.5px] font-bold text-slate-800 truncate">1:1 Performance Sync</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-semibold">Today · 11:00 AM</p>
              </div>
              <button className="bg-[#1FB6A6] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-[#1db0a0] transition-colors self-center cursor-pointer">
                Join
              </button>
            </div>

            {/* Meeting Row 2 */}
            <div className="flex items-start gap-4 p-3 bg-slate-50/70 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="bg-rose-50 border border-rose-100 text-[#78161A] rounded-lg p-2 flex flex-col items-center justify-center min-w-[50px] font-bold">
                <span className="text-[15px] font-extrabold">13</span>
                <span className="text-[9.5px] uppercase font-bold tracking-wider mt-0.5">May</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[13.5px] font-bold text-slate-800 truncate">Probation Discussion</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-semibold">Tomorrow · 2:00 PM</p>
              </div>
              <button className="bg-[#1FB6A6] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-[#1db0a0] transition-colors self-center cursor-pointer">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-[#78161A] tracking-tight font-grotesk uppercase">
              Recent Activity
            </h3>
          </div>
          <div className="flex-1 flex flex-col justify-center font-inter">
            <div className="divide-y divide-slate-100">
              {recentActivities.map((act) => (
                <div key={act.id} className="py-3 flex justify-between gap-3 font-semibold">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#78161A] mt-1 flex-shrink-0"></span>
                    <span className="text-[12.5px] text-slate-700 font-semibold leading-tight font-inter">
                      {act.text}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold font-inter whitespace-nowrap mt-0.5">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
