import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaHistory,
  FaInfoCircle,
  FaGraduationCap,
  FaThumbsUp,
  FaCheckCircle,
  FaUser,
  FaFileAlt
} from 'react-icons/fa';
import DynamicCalendar from '../../components/common/DynamicCalendar';

const BASE_URL = 'http://localhost:9085/api/meetings';
const DEFAULT_CFL_EMP_ID = 1125;

// Helper to get today's date string YYYY-MM-DD
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Meetings = () => {
  // Main Tab State: 'my-meetings' vs 'history'
  const [activeTab, setActiveTab] = useState('my-meetings');
  const [cflEmpId] = useState(() => {
    const stored = localStorage.getItem('cflEmpId') || localStorage.getItem('employeeCode');
    return stored ? parseInt(stored, 10) : DEFAULT_CFL_EMP_ID;
  });

  // Dynamic Contacts State from database
  const [contacts, setContacts] = useState({
    mentorName: 'Rohit Verma',
    managerName: 'Rajesh Verma',
    hrName: 'Ananya Gupta'
  });

  // Form State for Schedule Meeting
  const [meetingWith, setMeetingWith] = useState('Mentor'); // 'Mentor' | 'Manager' | 'HR'
  const [selectedPerson, setSelectedPerson] = useState('Rohit Verma');
  const [meetingType, setMeetingType] = useState('Mentoring Session');
  const [meetingDate, setMeetingDate] = useState(getTodayDateString());
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingMode, setMeetingMode] = useState('Zoom');
  const [meetingLink, setMeetingLink] = useState('');
  const [agenda, setAgenda] = useState('');

  // Dynamic Meetings Lists
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [historyMeetings, setHistoryMeetings] = useState([]);

  // Fetch dynamic contacts and meeting lists from backend API
  useEffect(() => {
    // 1. Fetch CFL Contacts (Mentor, Manager, HR names from database)
    fetch(`${BASE_URL}/cfl/${cflEmpId}/contacts`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          const mentor = data.mentorName || 'Rohit Verma';
          const manager = data.managerName || 'Rajesh Verma';
          const hr = data.hrName || 'Ananya Gupta';
          setContacts({ mentorName: mentor, managerName: manager, hrName: hr });
          setSelectedPerson(mentor);
        }
      })
      .catch((err) => console.warn('Could not load contacts from backend API, using fallback', err));

    // 2. Fetch Upcoming Meetings
    fetch(`${BASE_URL}/cfl/${cflEmpId}/upcoming`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUpcomingMeetings(data);
        }
      })
      .catch((err) => console.warn('Could not load upcoming meetings from backend API', err));

    // 3. Fetch History Meetings
    fetch(`${BASE_URL}/cfl/${cflEmpId}/history`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistoryMeetings(data);
        }
      })
      .catch((err) => console.warn('Could not load meeting history from backend API', err));
  }, [cflEmpId]);

  // Handle Person & Meeting Type options when switching "MEETING WITH"
  const handleMeetingWithChange = (role) => {
    setMeetingWith(role);
    if (role === 'Mentor') {
      setSelectedPerson(contacts.mentorName || 'Rohit Verma');
      setMeetingType('Mentoring Session');
    } else if (role === 'Manager') {
      setSelectedPerson(contacts.managerName || 'Rajesh Verma');
      setMeetingType('Manager Sync / 1:1');
    } else if (role === 'HR') {
      setSelectedPerson(contacts.hrName || 'Ananya Gupta');
      setMeetingType('HR Sync');
    }
  };

  // Form Submit Handler
  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedPerson || !meetingDate || !meetingTime || !agenda) {
      alert('Please complete all required fields (Date, Time, and Agenda).');
      return;
    }

    const payload = {
      cflEmpId: cflEmpId,
      meetingWithRole: meetingWith,
      selectedPerson: selectedPerson,
      meetingType: meetingType,
      meetingDate: meetingDate,
      meetingTime: meetingTime,
      meetingMode: meetingMode,
      meetingLink: meetingLink,
      agenda: agenda
    };

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newMeeting = await response.json();
        setUpcomingMeetings([newMeeting, ...upcomingMeetings]);
        alert('Meeting request submitted successfully!');

        // Reset Form
        setAgenda('');
        setMeetingLink('');
      } else {
        alert('Failed to schedule meeting. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting meeting request:', error);
      alert('Network error while scheduling meeting.');
    }
  };

  // Helper to check if meeting is within 12 hours from now
  const isMeetingWithin12Hours = (mtg) => {
    if (!mtg) return false;
    let mtgDate;
    if (mtg.date) {
      const [y, m, d] = mtg.date.split('-').map(Number);
      let hrs = 15;
      let mins = 0;
      if (mtg.time) {
        const timeMatch = mtg.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeMatch) {
          hrs = parseInt(timeMatch[1], 10);
          mins = parseInt(timeMatch[2], 10);
          const ampm = timeMatch[3];
          if (ampm) {
            if (ampm.toUpperCase() === 'PM' && hrs < 12) hrs += 12;
            if (ampm.toUpperCase() === 'AM' && hrs === 12) hrs = 0;
          }
        }
      }
      mtgDate = new Date(y, m - 1, d, hrs, mins);
    } else return false;

    const now = new Date();
    const diffMs = mtgDate.getTime() - now.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    return diffHrs >= -2 && diffHrs <= 12;
  };

  return (
    <div className="space-y-5 animate-fade-in duration-300 font-inter text-slate-800 select-none">
      {/* Top Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-grotesk tracking-tight">
          Meetings
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-inter">
          Schedule and track your meetings with your mentor, manager, or HR.
        </p>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('my-meetings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-sm ${activeTab === 'my-meetings'
            ? 'bg-[#78161A] text-white shadow-rose-900/20'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          <FaCalendarAlt className={activeTab === 'my-meetings' ? 'text-white' : 'text-slate-400'} />
          My Meetings
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeTab === 'history'
            ? 'bg-[#78161A] text-white shadow-rose-900/20'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          <FaClock className={activeTab === 'history' ? 'text-white' : 'text-slate-400'} />
          Meeting History
        </button>
      </div>

      {activeTab === 'my-meetings' ? (
        /* Main 2-Column Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Dynamic Calendar + Upcoming Meetings List */}
          <div className="lg:col-span-6 space-y-6">

            {/* Dynamic Calendar Card */}
            <div className="bg-white border border-slate-100/80 rounded-2xl p-6 shadow-sm">
              <DynamicCalendar
                selectedDate={meetingDate}
                onSelectDate={(dateStr) => setMeetingDate(dateStr)}
                meetings={upcomingMeetings}
              />

              {/* Upcoming Meetings Sub-Section */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#78161A] font-grotesk">
                    Upcoming Meetings
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {upcomingMeetings.length} Total
                  </span>
                </div>

                <div className="space-y-4">
                  {upcomingMeetings.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <p className="text-xs font-semibold text-slate-500">No upcoming meetings scheduled.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Use the form on the right to schedule a meeting with your Mentor, Manager, or HR.</p>
                    </div>
                  ) : (
                    upcomingMeetings.map((mtg) => {
                      const isSoon = isMeetingWithin12Hours(mtg);
                      return (
                        <div
                          key={mtg.id}
                          className={`flex items-center justify-between gap-4 p-3 rounded-2xl transition-all ${isSoon
                            ? 'bg-amber-50/80 border-2 border-amber-400 ring-2 ring-amber-300/60 shadow-md animate-pulse'
                            : 'border-b border-slate-100 last:border-none'
                            }`}
                        >
                          {/* Left Date Badge + Info */}
                          <div className="flex items-center gap-3.5">
                            <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 ${isSoon
                              ? 'bg-amber-500 text-white font-bold shadow-sm'
                              : 'bg-rose-50 border border-rose-100/60'
                              }`}>
                              <span className={`text-sm font-bold leading-none ${isSoon ? 'text-white' : 'text-[#78161A]'}`}>
                                {mtg.day}
                              </span>
                              <span className={`text-[9px] font-bold uppercase mt-0.5 ${isSoon ? 'text-amber-100' : 'text-[#78161A]/80'}`}>
                                {mtg.month}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-slate-800 font-grotesk">
                                {mtg.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                                {mtg.time} · {mtg.mode}
                              </p>

                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                {isSoon && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10.5px] font-extrabold shadow-sm animate-bounce">
                                    ⚡ Starting Soon (&lt;12h)
                                  </span>
                                )}

                                {mtg.createdByType === 'Mentor' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10.5px] font-semibold">
                                    <FaGraduationCap className="w-3 h-3 text-emerald-600" />
                                    Created by Mentor
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10.5px] font-semibold">
                                    <FaThumbsUp className="w-3 h-3 text-amber-600" />
                                    Created by You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Join Button */}
                          <a
                            href={mtg.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-5 py-1.5 rounded-full text-white text-xs font-bold shadow-sm transition-all shrink-0 ${isSoon
                              ? 'bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-300'
                              : 'bg-[#14B8A6] hover:bg-[#0D9488]'
                              }`}
                          >
                            Join
                          </a>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Schedule Meeting Form */}
          <div className="lg:col-span-6 bg-white border border-slate-100/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#78161A] font-grotesk mb-5">
              Schedule Meeting
            </h2>

            <form onSubmit={handleSendRequest} className="space-y-4">

              {/* MEETING WITH */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  MEETING WITH *
                </label>
                <div className="flex items-center gap-5 text-xs font-semibold text-slate-700">
                  {['Mentor', 'Manager', 'HR'].map((role) => (
                    <label key={role} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="meetingWithRole"
                        checked={meetingWith === role}
                        onChange={() => handleMeetingWithChange(role)}
                        className="accent-[#78161A] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SELECT PERSON */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  SELECT PERSON
                </label>
                <input
                  type="text"
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#78161A]/20 focus:border-[#78161A]"
                />
              </div>

              {/* MEETING TYPE */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  MEETING TYPE *
                </label>
                <input
                  type="text"
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#78161A]/20 focus:border-[#78161A]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Automatically set based on who you're meeting with.
                </p>
              </div>

              {/* MEETING DATE & TIME */}
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      MEETING DATE *
                    </label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#78161A]/20 focus:border-[#78161A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      TIME *
                    </label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#78161A]/20 focus:border-[#78161A]"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Click any date on the calendar to pick it, or select using the date picker above.
                </p>
              </div>

              {/* MEETING MODE */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  MEETING MODE *
                </label>
                <div className="flex flex-wrap items-center gap-3.5 text-xs font-semibold text-slate-700">
                  {['Zoom', 'Google Meet', 'Teams Meeting', 'In-Person'].map((mode) => (
                    <label key={mode} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="meetingMode"
                        checked={meetingMode === mode}
                        onChange={() => setMeetingMode(mode)}
                        className="accent-[#78161A] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* MEETING LINK (OPTIONAL) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  MEETING LINK (OPTIONAL)
                </label>
                <input
                  type="url"
                  placeholder="Paste Zoom / Teams / Meet link if you have one"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#78161A]/20 focus:border-[#78161A]"
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                  If your organization isn't directly integrated with the meeting tool, paste the link here — it will show to everyone invited.
                </p>
              </div>

              {/* AGENDA / TOPICS */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  AGENDA / TOPICS *
                </label>
                <textarea
                  rows={2}
                  placeholder="What would you like to discuss?"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#78161A]/20 focus:border-[#78161A] resize-none"
                />
              </div>

              {/* Info Callout Box */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-700">
                <FaInfoCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Choosing <span className="font-bold">Mentoring Session</span> as the meeting type will automatically add this to your Mentoring Sessions too.
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAgenda('');
                    setMeetingLink('');
                  }}
                  className="px-5 py-2 border border-[#78161A] text-[#78161A] hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-[#78161A] hover:bg-[#5c1013] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Send Request
                </button>
              </div>

            </form>
          </div>

        </div>
      ) : (
        /* Meeting History View Table */
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#78161A] font-grotesk">
              Meeting History
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {historyMeetings.length} past meeting(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">WITH</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">MODE</th>
                  <th className="py-3 px-4">CREATED BY</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {historyMeetings.map((mtg) => {
                  const formattedDay = mtg.day < 10 ? `0${mtg.day}` : mtg.day;
                  const dateDisplay = `${formattedDay} ${mtg.month}, ${mtg.time}`;

                  return (
                    <tr key={mtg.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* DATE */}
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        {dateDisplay}
                      </td>

                      {/* WITH */}
                      <td className="py-4 px-4 text-slate-800 font-medium">
                        {mtg.withPerson || `${contacts.managerName} (Manager)`}
                      </td>

                      {/* TYPE */}
                      <td className="py-4 px-4 text-slate-700">
                        {mtg.meetingType || mtg.title || '1:1 Discussion'}
                      </td>

                      {/* MODE */}
                      <td className="py-4 px-4 text-slate-600">
                        {mtg.mode}
                      </td>

                      {/* CREATED BY */}
                      <td className="py-4 px-4">
                        {mtg.createdByType === 'Manager' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                            <FaUser className="w-3 h-3 text-emerald-600" />
                            Created by Manager
                          </span>
                        ) : mtg.createdByType === 'HR' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                            <FaFileAlt className="w-3 h-3 text-emerald-600" />
                            Created by HR
                          </span>
                        ) : mtg.createdByType === 'Mentor' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                            <FaGraduationCap className="w-3 h-3 text-emerald-600" />
                            Created by Mentor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold">
                            <FaThumbsUp className="w-3 h-3 text-amber-600" />
                            Created by You
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
