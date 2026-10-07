import React, { useState } from 'react';
import {
  FaUsers,
  FaCheckCircle,
  FaComments,
  FaHourglassHalf,
  FaCalendarAlt,
  FaUser,
  FaArrowRight,
  FaPhoneAlt,
  FaDesktop
} from 'react-icons/fa';
import MentorNavbar from '../../components/navbar/MentorNavbar';
import { useAuth } from '../../context/AuthContext';

import AssignedCfls from './AssignedCfls';
import MentorProfile from './MentorProfile';
import MenteeProfile from './MenteeProfile';

const MentorDashboard = () => {
  const { setRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMenteeEmpCode, setSelectedMenteeEmpCode] = useState(null);
  const [batchYear, setBatchYear] = useState('2026');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-inter select-none">
      {/* Sidebar Navbar */}
      <MentorNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Breadcrumbs Bar */}
        <header className="h-[70px] bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-8 w-full">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#78161A] transition-colors bg-none border-none outline-none cursor-pointer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
              <span>Digital Lounge</span>
            </button>
            <div className="text-xs text-slate-400 font-semibold ml-2">
              Home / Pravlin / <span className="text-[#78161A] font-bold">Start Smart</span>
            </div>
          </div>
          <div className="bg-[#10B981] text-white text-[11px] font-extrabold py-1.5 px-4 rounded-full tracking-wider shadow-xs uppercase">
            Mentor DASHBOARD
          </div>
        </header>

        {/* Dashboard Main Content Body Wrapper */}
        <main className="flex-1 p-8 space-y-6 max-w-[1400px] w-full">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in duration-300">
              {/* Greetings Banner */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 font-grotesk">
                    Good Morning, Mentor! 👋
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Here's what's happening with your mentees.
                  </p>
                </div>
                {/* Year Selection Dropdown & Schedule Meeting CTA */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">YEAR</span>
                    <div className="relative">
                      <select
                        value={batchYear}
                        onChange={(e) => setBatchYear(e.target.value)}
                        className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:border-[#78161A] cursor-pointer"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Opening Meeting Scheduler...')}
                    className="bg-[#78161A] hover:bg-[#631013] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-2xs active:scale-95 transition-all text-center cursor-pointer font-grotesk"
                  >
                    Schedule Meeting
                  </button>
                </div>
              </div>

              {/* Needs Your Attention Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-[#78161A] p-5 shadow-xs flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#78161A] font-extrabold text-sm font-grotesk">
                    <span>🔔</span>
                    <span>Needs Your Attention</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">1 item(s)</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
                      <FaComments />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      Provide feedback for Manpreet Kaur's "Onboarding Check-in" session
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-[#78161A] transition-colors cursor-pointer">
                    <FaArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Metrics Cards Grid Layout */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Metric 1 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-sm">
                    <FaUsers />
                  </div>
                  <span className="text-3xl font-black text-slate-800 font-grotesk leading-none">4</span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">MY MENTEES</span>
                </div>

                {/* Metric 2 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-sm">
                    <FaCheckCircle />
                  </div>
                  <span className="text-3xl font-black text-slate-800 font-grotesk leading-none">5</span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">SESSIONS COMPLETED</span>
                </div>

                {/* Metric 3 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-sm">
                    <FaComments />
                  </div>
                  <span className="text-3xl font-black text-slate-800 font-grotesk leading-none">4</span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">FEEDBACK GIVEN</span>
                </div>

                {/* Metric 4 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-sm">
                    <FaHourglassHalf />
                  </div>
                  <span className="text-3xl font-black text-slate-800 font-grotesk leading-none">1</span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">PENDING FEEDBACK</span>
                </div>
              </section>

              {/* Middle Section: Upcoming Meetings and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Upcoming Meetings Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#78161A] font-grotesk">
                      Upcoming Meetings
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">Across all mentees</span>
                  </div>

                  <div className="divide-y divide-slate-100 space-y-3">
                    {/* Item 1 */}
                    <div className="pt-3 first:pt-0 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-[#78161A] flex-shrink-0">
                        <span className="text-xs font-black leading-none font-grotesk">22</span>
                        <span className="text-[9px] font-extrabold uppercase mt-0.5">MAY</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          Quarterly Goal Discussion — Manpreet Kaur
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          03:00 PM · Zoom
                        </span>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="pt-3 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-[#78161A] flex-shrink-0">
                        <span className="text-xs font-black leading-none font-grotesk">24</span>
                        <span className="text-[9px] font-extrabold uppercase mt-0.5">MAY</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          Career Growth Discussion — Amit Chauhan
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          10:30 AM · Google Meet
                        </span>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="pt-3 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-[#78161A] flex-shrink-0">
                        <span className="text-xs font-black leading-none font-grotesk">26</span>
                        <span className="text-[9px] font-extrabold uppercase mt-0.5">MAY</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          QA Career Path Discussion — Sneha Reddy
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          01:00 PM · In-Person
                        </span>
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div className="pt-3 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-[#78161A] flex-shrink-0">
                        <span className="text-xs font-black leading-none font-grotesk">29</span>
                        <span className="text-[9px] font-extrabold uppercase mt-0.5">MAY</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          Mid-Quarter Check-in — Manpreet Kaur
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          11:30 AM · Google Meet
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button className="text-xs font-bold text-[#78161A] hover:underline flex items-center gap-1 cursor-pointer">
                      <span>View All Meetings</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Recent Activity Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                  <h3 className="text-base font-extrabold text-[#78161A] font-grotesk">
                    Recent Activity
                  </h3>

                  <div className="space-y-4">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs flex-shrink-0">
                          <FaComments />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          You gave feedback for Manpreet Kaur
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                        15 May 2026
                      </span>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs flex-shrink-0">
                          <FaPhoneAlt />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          Manpreet Kaur gave you feedback on a session
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                        15 May 2026
                      </span>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0">
                          <FaCheckCircle />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          Mentoring completed with Manpreet Kaur
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                        15 May 2026
                      </span>
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs flex-shrink-0">
                          <FaCalendarAlt />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          Quarterly Goal Discussion scheduled with Manpreet Kaur
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                        22 May 2026
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-extrabold text-[#78161A] font-grotesk">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Card 1: Assigned CFLs */}
                  <div
                    onClick={() => setActiveTab('assigned-cfls')}
                    className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all font-bold text-slate-700 flex flex-col items-center justify-center gap-3 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                      <FaUsers />
                    </div>
                    <span className="text-sm font-bold text-slate-800 font-grotesk">Assigned CFLs</span>
                  </div>

                  {/* Card 2: Schedule Meeting */}
                  <div
                    onClick={() => alert('Opening Meeting Scheduler...')}
                    className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all font-bold text-slate-700 flex flex-col items-center justify-center gap-3 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                      <FaCalendarAlt />
                    </div>
                    <span className="text-sm font-bold text-slate-800 font-grotesk">Schedule Meeting</span>
                  </div>

                  {/* Card 3: Mentor Profile */}
                  <div
                    onClick={() => setActiveTab('profile')}
                    className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all font-bold text-slate-700 flex flex-col items-center justify-center gap-3 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                      <FaUser />
                    </div>
                    <span className="text-sm font-bold text-slate-800 font-grotesk">Mentor Profile</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'assigned-cfls' || activeTab === 'my-mentees') && (
            <AssignedCfls
              onViewMentee={(code) => {
                setSelectedMenteeEmpCode(code);
                setActiveTab('mentee-profile');
              }}
            />
          )}

          {activeTab === 'mentee-profile' && (
            <MenteeProfile
              cflEmpCode={selectedMenteeEmpCode}
              onBack={() => setActiveTab('assigned-cfls')}
            />
          )}

          {activeTab === 'profile' && (
            <MentorProfile />
          )}

          {activeTab !== 'overview' && activeTab !== 'assigned-cfls' && activeTab !== 'my-mentees' && activeTab !== 'profile' && activeTab !== 'mentee-profile' && (
            <div className="text-center bg-white border border-slate-200 rounded-2xl py-24 shadow-xs animate-fade-in duration-300">
              <h3 className="text-xl font-extrabold text-slate-800 mb-2 font-grotesk">
                {activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Section
              </h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto font-medium">
                This section displays detailed information for {activeTab.replace('-', ' ')}.
              </p>
            </div>
          )}
        </main>

        {/* Floating Chat Icon support */}
        <button
          onClick={() => alert('Need assistance? Our smart chatbot helper is here!')}
          className="fixed bottom-6 right-6 w-12 h-12 bg-[#10B981] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all z-40 outline-none cursor-pointer"
        >
          <FaDesktop className="w-5 h-5" />
        </button>

        {/* Demo Role switcher helper floating layout in bottom-left content area */}
        <div className="fixed bottom-6 left-[280px] z-40 bg-white border border-slate-200 shadow-xl rounded-xl p-3 flex flex-col gap-2 max-w-[210px] w-full">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
            Demo Role Control
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setRole('HR')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer`}
            >
              HR
            </button>
            <button
              onClick={() => setRole('Employee')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer`}
            >
              CFL
            </button>
            <button
              onClick={() => setRole('Manager')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer`}
            >
              Mgr
            </button>
            <button
              onClick={() => setRole('Mentor')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all bg-[#78161A] text-white cursor-pointer`}
            >
              Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
