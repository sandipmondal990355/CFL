import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaChevronDown 
} from 'react-icons/fa';
import cflAssignmentService from '../../services/cflAssignmentService';

const Meetings = () => {
  const managerEmpCode = 2002;
  // Calendar state & upcoming meetings state
  const [selectedDay, setSelectedDay] = useState(12);
  const [meetings, setMeetings] = useState([
    { id: 1, day: 12, month: 'MAY', title: '1:1 with Amit Chauhan', time: '11:00 AM' },
    { id: 2, day: 22, month: 'MAY', title: 'Goal Discussion (Q2)', time: '03:00 PM' },
    { id: 3, day: 25, month: 'MAY', title: '1:1 with Rohit Verma', time: '11:00 AM' }
  ]);

  const [assignedCfls, setAssignedCfls] = useState([]);

  // Fetch assigned CFLs for Manager 2002 to populate form participants dynamically
  useEffect(() => {
    const fetchCfls = async () => {
      try {
        const res = await cflAssignmentService.getByManager(managerEmpCode, { page: 0, size: 50 });
        if (res && res.content && res.content.length > 0) {
          setAssignedCfls(res.content);
        }
      } catch (e) {
        console.warn('Could not fetch CFLs for meetings form:', e);
      }
    };
    fetchCfls();
  }, [managerEmpCode]);

  // Form State
  const [meetingType, setMeetingType] = useState('1:1 Meeting');
  const [participants, setParticipants] = useState('Amit Chauhan (CFL), Rohit Verma (Mentor)');
  const [dueDate, setDueDate] = useState('22-05-2026');
  const [dueTime, setDueTime] = useState('15:00');
  const [duration, setDuration] = useState('30 Minutes');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('Quarterly goal discussion and progress review.');

  // Form Submission
  const handleSchedule = (e) => {
    e.preventDefault();
    if (!participants || !dueDate || !dueTime || !agenda) {
      alert('Please fill in all required fields.');
      return;
    }

    // Extract Day/Month from formatted date (e.g. DD-MM-YYYY)
    const dateParts = dueDate.split('-');
    let newDay = 22;
    if (dateParts[0]) {
      const parsed = parseInt(dateParts[0], 10);
      if (!isNaN(parsed)) newDay = parsed;
    }

    // Format Time (converting HH:MM to 12-hour AM/PM)
    let formattedTime = dueTime;
    const timeParts = dueTime.split(':');
    if (timeParts.length >= 2) {
      const hrs = parseInt(timeParts[0], 10);
      const mins = timeParts[1];
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      const adjustedHrs = hrs % 12 || 12;
      formattedTime = `${adjustedHrs}:${mins} ${ampm}`;
    }

    const newMeeting = {
      id: Date.now(),
      day: newDay,
      month: 'MAY',
      title: `${meetingType === '1:1 Meeting' ? '1:1' : meetingType} with ${participants.split(',')[0]}`,
      time: formattedTime
    };

    setMeetings([...meetings, newMeeting]);
    alert(`Meeting scheduled successfully! Added to Upcoming Meetings for Manager ID ${managerEmpCode}.`);
  };

  const handleCancel = () => {
    setMeetingType('1:1 Meeting');
    setParticipants('Amit Chauhan (CFL), Rohit Verma (Mentor)');
    setDueDate('22-05-2026');
    setDueTime('15:00');
    setDuration('30 Minutes');
    setLocation('');
    setAgenda('Quarterly goal discussion and progress review.');
  };

  const daysOfWeek = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const calendarDates = [
    3, 4, 5, 6, 7, 8, 9,
    10, 11, 12, 13, 14, 15, 16,
    17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30
  ];

  return (
    <div className="space-y-8 animate-fade-in duration-300 font-inter select-none text-left">
      
      {/* Title & Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1B1418] tracking-tight font-grotesk">
          Meetings (Manager ID: {managerEmpCode})
        </h2>
        <p className="text-[13px] text-slate-500 mt-1 font-medium font-inter">
          Your schedule with CFLs and mentors.
        </p>
      </div>

      {/* Main Two Column Layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column wrapper (Calendar & Upcoming Meetings) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE3E4] p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-8">
          
          {/* Calendar Box Container */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15.5px] font-extrabold text-[#78161A] font-grotesk">
                May 2026
              </h3>
              <button 
                onClick={() => setSelectedDay(12)}
                className="px-[13px] py-[3.5px] rounded-[5px] text-[10.5px] font-extrabold border border-[#78161A] text-[#78161A] bg-white hover:bg-rose-50/50 transition-colors shadow-sm outline-none cursor-pointer"
              >
                Today
              </button>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 text-center gap-y-[14px] gap-x-1 mt-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-[10px] font-extrabold text-slate-400 tracking-wider">
                  {day}
                </div>
              ))}

              {/* Calendar Grid Dates */}
              {calendarDates.map((date) => {
                const isSelected = date === selectedDay;
                const isHighlight = date === 22 || date === 25;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDay(date)}
                    className="flex justify-center items-center focus:outline-none w-full cursor-pointer"
                  >
                    <span 
                      className={`w-[44px] h-[32px] rounded-[6px] text-[13px] flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-[#78161A] text-white font-black shadow-sm'
                          : isHighlight
                          ? 'bg-[#FDF2F2] text-[#78161A] font-black'
                          : 'text-slate-600 font-semibold hover:bg-slate-50'
                      }`}
                    >
                      {date}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Meetings section */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h4 className="text-[12px] font-extrabold text-[#78161A] font-grotesk uppercase tracking-wider">
              Upcoming Meetings
            </h4>

            <div className="space-y-3.5">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between py-2 border-b border-[#F8FAFC]">
                  <div className="flex items-center gap-3.5">
                    {/* Month/Day badge */}
                    <div className="w-[42px] h-[40px] bg-[#FEF1F2] border border-[#FECDD3] rounded-lg flex flex-col items-center justify-center flex-shrink-0 text-center">
                      <span className="text-[12.5px] font-extrabold text-[#E11D48] leading-none mb-0.5">{meeting.day}</span>
                      <span className="text-[7.5px] font-black text-rose-450 tracking-wider leading-none uppercase">{meeting.month}</span>
                    </div>

                    {/* Texts info */}
                    <div>
                      <h5 className="text-[13px] font-bold text-slate-800 leading-tight">{meeting.title}</h5>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{meeting.time}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => alert(`Launching ${meeting.title} Video Session...`)}
                    className="px-4 py-1.5 rounded-[5px] text-[11px] font-extrabold bg-[#1FB6A6] hover:bg-[#1bb0a0] active:scale-95 text-white shadow-sm shadow-[#1FB6A6]/20 transition-all outline-none cursor-pointer"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>

            {/* Schedule Meeting broad bar button */}
            <button 
              onClick={() => {
                const el = document.getElementById('meeting-form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-2.5 mt-8 bg-[#78161A] hover:bg-[#631013] active:scale-95 text-white font-extrabold rounded-lg shadow-md shadow-[#78161A]/10 text-[12px] select-none outline-none transition-all cursor-pointer"
            >
              Schedule Meeting
            </button>
          </div>

        </div>

        {/* Right Column wrapper (Schedule Meeting Form) */}
        <div id="meeting-form" className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE3E4] p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-6">
          <h3 className="text-[15.5px] font-extrabold text-[#78161A] font-grotesk">
            Schedule Meeting
          </h3>

          <form onSubmit={handleSchedule} className="space-y-4">
            
            {/* Meeting Type select */}
            <div className="space-y-1.5">
              <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                Meeting Type *
              </label>
              <div className="relative">
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full bg-white border border-[#EAE3E4] rounded-lg px-4 py-2.5 pr-10 text-xs font-bold text-slate-700 shadow-sm appearance-none outline-none focus:border-[#78161A] cursor-pointer"
                >
                  <option value="1:1 Meeting">1:1 Meeting</option>
                  <option value="Goal Discussion">Goal Discussion</option>
                  <option value="Progress Review">Progress Review</option>
                  <option value="Ad-hoc Mentorship">Ad-hoc Mentorship</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4.5 text-slate-400">
                  <FaChevronDown className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>

            {/* Participants field */}
            <div className="space-y-1.5">
              <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                Participants *
              </label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full bg-white border border-[#EAE3E4] rounded-lg px-4 py-2.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:border-[#78161A] font-semibold"
                required
              />
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                  Date *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={dueDate}
                    placeholder="DD-MM-YYYY"
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-[#EAE3E4] rounded-lg pl-4 pr-9 py-2.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:border-[#78161A] font-semibold"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <FaCalendarAlt className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="space-y-1.5">
                <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                  Time *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={dueTime}
                    placeholder="HH:MM"
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-white border border-[#EAE3E4] rounded-lg pl-4 pr-9 py-2.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:border-[#78161A] font-semibold"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <FaClock className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

            </div>

            {/* Duration select */}
            <div className="space-y-1.5">
              <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                Duration *
              </label>
              <div className="relative">
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white border border-[#EAE3E4] rounded-lg px-4 py-2.5 pr-10 text-xs font-bold text-slate-700 shadow-sm appearance-none outline-none focus:border-[#78161A] cursor-pointer"
                >
                  <option value="15 Minutes">15 Minutes</option>
                  <option value="30 Minutes">30 Minutes</option>
                  <option value="45 Minutes">45 Minutes</option>
                  <option value="60 Minutes">60 Minutes</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4.5 text-slate-400">
                  <FaChevronDown className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>

            {/* Location Platform field */}
            <div className="space-y-1.5">
              <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                Location / Platform
              </label>
              <input
                type="text"
                value={location}
                placeholder="Zoom / Meeting Room"
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-[#EAE3E4] rounded-lg px-4 py-2.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:border-[#78161A] font-semibold"
              />
            </div>

            {/* Agenda textarea */}
            <div className="space-y-1.5">
              <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                Agenda *
              </label>
              <textarea
                value={agenda}
                rows={2}
                onChange={(e) => setAgenda(e.target.value)}
                className="w-full bg-white border border-[#EAE3E4] rounded-lg p-4 text-xs text-slate-700 shadow-sm focus:outline-none focus:border-[#78161A] font-semibold resize-none"
                required
              />
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-3.5 pt-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 rounded-lg text-rose-800 text-[11.5px] font-extrabold border border-rose-800 hover:bg-rose-50/50 active:scale-95 outline-none transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="flex-1 py-2 bg-rose-800 hover:bg-[#631013] active:scale-95 text-white text-[11.5px] font-extrabold rounded-lg shadow-md shadow-rose-850/10 outline-none transition-all cursor-pointer"
              >
                Schedule Meeting
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

export default Meetings;
