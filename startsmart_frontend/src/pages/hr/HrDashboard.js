import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaFileAlt,
  FaCamera,
  FaCalendarAlt,
  FaChartBar,
  FaBullseye,
  FaHourglassHalf,
  FaComments
} from 'react-icons/fa';
import MetricCard from '../../components/molecules/MetricCard';
import { goalService } from '../../services/goalService';

// Progress Circle Helper Component (scaled to w-28 h-28 as requested)
const ProgressCircle = ({ percent, label, status, strokeColor, trailColor, statusColor }) => {
  const radius = 36.5;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-[#EAE3E4] py-3 px-4 flex flex-col items-center justify-center text-center shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex-1 min-w-[170px]">
      <div className="relative flex items-center justify-center w-28 h-28">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={trailColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[17.5px] font-bold text-slate-800 font-inter">{percent}%</span>
      </div>
      <div className="text-[12px] font-semibold text-slate-700 mt-2 font-inter">{label}</div>
      <div className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${statusColor}`}>{status.toUpperCase()}</div>
    </div>
  );
};

const HrDashboard = ({ onNavigate }) => {
  const [summaryData, setSummaryData] = useState({
    totalCfls: 15,
    goalsPendingReview: 18,
    cflsUnderProbation: 13,
    finalReviewsCompleted: 2
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await goalService.getHrOverviewSummary();
        if (data) {
          setSummaryData({
            totalCfls: data.totalCfls ?? 15,
            goalsPendingReview: data.goalsPendingReview ?? 18,
            cflsUnderProbation: data.cflsUnderProbation ?? 13,
            finalReviewsCompleted: data.finalReviewsCompleted ?? 2
          });
        }
      } catch (err) {
        console.warn('Could not fetch HR overview summary from backend:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Dashboard Greeting Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1B1418] tracking-tight font-grotesk">
          Welcome Back, CFL Admin!
        </h2>
        <p className="text-[13px] text-slate-500 mt-1 font-inter">
          Here is a quick snapshot of the digital onboarding program performance across cohorts.
        </p>
      </div>

      {/* Metrics Banner Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total CFLs"
          value={loading ? '...' : String(summaryData.totalCfls)}
          badgeText="Active Cohort"
          badgeVariant="green"
        />
        <MetricCard
          title="Goals Pending Review"
          value={loading ? '...' : String(summaryData.goalsPendingReview)}
          badgeText="30, 60 & 90 Days"
          badgeVariant="orange"
        />
        <MetricCard
          title="CFLs Under Probation"
          value={loading ? '...' : String(summaryData.cflsUnderProbation)}
          badgeText="In Probation Stage"
          badgeVariant="green"
        />
        <MetricCard
          title="Final Reviews Completed"
          value={loading ? '...' : String(summaryData.finalReviewsCompleted)}
          badgeText="G100 Cycle Completed"
          badgeVariant="green"
        />
      </section>

      {/* Program Progress Area */}
      <section className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-5">
        <h3 className="text-base font-bold text-[#78161A] tracking-tight font-grotesk">
          Program Progress
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <ProgressCircle
            percent={82}
            label="Goal Completion"
            status="On Track"
            strokeColor="stroke-[#1E8E5A]"
            trailColor="stroke-[#E6F6EE]"
            statusColor="text-[#1E8E5A]"
          />
          <ProgressCircle
            percent={75}
            label="Mentoring Sessions"
            status="Good Progress"
            strokeColor="stroke-[#3B82F6]"
            trailColor="stroke-[#EFF6FF]"
            statusColor="text-[#1E8E5A]"
          />
          <ProgressCircle
            percent={68}
            label="Probation Confirmed"
            status="In Progress"
            strokeColor="stroke-[#F97316]"
            trailColor="stroke-[#FFF7ED]"
            statusColor="text-[#C4531E]"
          />
          <ProgressCircle
            percent={74}
            label="Performance Reviews"
            status="Good Progress"
            strokeColor="stroke-[#0D9488]"
            trailColor="stroke-[#F0FDFA]"
            statusColor="text-[#1E8E5A]"
          />
        </div>
      </section>

      {/* Recent Activity and Pending Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity Column */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-base font-bold text-slate-800 tracking-tight font-grotesk">
            Recent Activity
          </h3>
          <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] divide-y divide-slate-100 flex flex-col justify-center">
            {/* Activity Row 1 */}
            <div className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0"></span>
                <span className="text-[13.5px] text-slate-700 font-medium">Goal setting reminder sent to 12 CFLs</span>
              </div>
              <span className="text-[11.5px] text-slate-400 font-medium whitespace-nowrap">Today, 09:30 AM</span>
            </div>
            {/* Activity Row 2 */}
            <div className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0"></span>
                <span className="text-[13.5px] text-slate-700 font-medium">Manager (Ankit Chauhan) submitted performance review</span>
              </div>
              <span className="text-[11.5px] text-slate-400 font-medium whitespace-nowrap">Yesterday, 06:20 PM</span>
            </div>
            {/* Activity Row 3 */}
            <div className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0"></span>
                <span className="text-[13.5px] text-slate-700 font-medium">New document uploaded by Manpreet Kaur</span>
              </div>
              <span className="text-[11.5px] text-slate-400 font-medium whitespace-nowrap">Yesterday, 11:15 AM</span>
            </div>
            {/* Activity Row 4 */}
            <div className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0"></span>
                <span className="text-[13.5px] text-slate-700 font-medium">Probation evaluation submitted by Manager (Rohit Verma)</span>
              </div>
              <span className="text-[11.5px] text-slate-400 font-medium whitespace-nowrap">08 May 2026, 05:00 PM</span>
            </div>
          </div>
        </div>

        {/* Pending Actions Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800 tracking-tight font-grotesk">
              Pending Actions
            </h3>
            <button onClick={() => onNavigate('cfl-management')} className="text-[12.5px] font-bold text-[#78161A] hover:underline">
              View All
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-[#EAE3E4] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.02)] divide-y divide-slate-100">
            {/* Pending Row 1 */}
            <div className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center text-xs flex-shrink-0">
                  <FaBullseye className="w-4 h-4" />
                </div>
                <span className="text-[13px] text-slate-700 font-semibold font-inter">Goal reviews pending</span>
              </div>
              <span className="text-[12px] font-bold text-slate-800">{summaryData.goalsPendingReview} CFLs</span>
            </div>
            {/* Pending Row 2 */}
            <div className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center text-xs flex-shrink-0">
                  <FaHourglassHalf className="w-4 h-4" />
                </div>
                <span className="text-[13px] text-slate-700 font-semibold font-inter font-inter">CFLs in probation</span>
              </div>
              <span className="text-[12px] font-bold text-slate-800">{summaryData.cflsUnderProbation} CFLs</span>
            </div>
            {/* Pending Row 3 */}
            <div className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center text-xs flex-shrink-0">
                  <FaFileAlt className="w-4 h-4" />
                </div>
                <span className="text-[13px] text-slate-700 font-semibold font-inter">Final reviews completed</span>
              </div>
              <span className="text-[12px] font-bold text-slate-800">{summaryData.finalReviewsCompleted} CFLs</span>
            </div>
            {/* Pending Row 4 */}
            <div className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center text-xs flex-shrink-0">
                  <FaComments className="w-4 h-4" />
                </div>
                <span className="text-[13px] text-slate-700 font-semibold font-inter">Feedback pending</span>
              </div>
              <span className="text-[12px] font-bold text-slate-800">5 items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 tracking-tight font-grotesk">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1 */}
          <button
            onClick={() => {
              onNavigate('cfl-management');
            }}
            className="bg-white hover:bg-slate-50 border border-[#EAE3E4] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-md group text-center h-[96px]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
              <FaPlus className="w-5 h-5" />
            </div>
            <span className="text-[12.5px] font-bold text-slate-705 font-inter">Add / View CFL</span>
          </button>
          {/* Card 2 */}
          <button
            onClick={() => alert('Assign Formal Role')}
            className="bg-white hover:bg-slate-50 border border-[#EAE3E4] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-md group text-center h-[96px]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
              <FaFileAlt className="w-5 h-5" />
            </div>
            <span className="text-[12.5px] font-bold text-slate-705 font-inter">Assign Formal Role</span>
          </button>
          {/* Card 3 */}
          <button
            onClick={() => alert('Upload Memories')}
            className="bg-white hover:bg-slate-50 border border-[#EAE3E4] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-md group text-center h-[96px]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FCF5E3] text-[#D97706] flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
              <FaCamera className="w-5 h-5" />
            </div>
            <span className="text-[12.5px] font-bold text-slate-705 font-inter">Upload Memories</span>
          </button>
          {/* Card 4 */}
          <button
            onClick={() => alert('Schedule Meeting')}
            className="bg-white hover:bg-slate-50 border border-[#EAE3E4] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-md group text-center h-[96px]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E5F2FE] text-[#2563EB] flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
              <FaCalendarAlt className="w-5 h-5" />
            </div>
            <span className="text-[12.5px] font-bold text-slate-705 font-inter">Schedule Meeting</span>
          </button>
          {/* Card 5 */}
          <button
            onClick={() => alert('Generate Reports')}
            className="bg-white hover:bg-slate-50 border border-[#EAE3E4] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-md group text-center h-[96px]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FDECEE] text-[#DB2777] flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
              <FaChartBar className="w-5 h-5" />
            </div>
            <span className="text-[12.5px] font-bold text-slate-705 font-inter">Generate Reports</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default HrDashboard;
