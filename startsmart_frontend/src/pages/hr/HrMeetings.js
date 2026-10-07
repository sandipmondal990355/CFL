import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaInfoCircle,
  FaFileAlt,
  FaTrashAlt,
  FaSpinner,
  FaEdit,
  FaCheckCircle
} from 'react-icons/fa';
import DynamicCalendar from '../../components/common/DynamicCalendar';
import { hrMeetingService } from '../../services/hrMeetingService';

const HrMeetings = () => {
  // Main Tab State: 'my-meetings' vs 'history'
  const [activeTab, setActiveTab] = useState('my-meetings');

  // Dynamic CFL Options from backend database
  const [cflList, setCflList] = useState([]);
  const [selectedCfl, setSelectedCfl] = useState('');

  // Form State for Schedule / Edit Meeting
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [meetingType, setMeetingType] = useState('HR 1:1 Check-in');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingMode, setMeetingMode] = useState('Zoom');
  const [meetingLink, setMeetingLink] = useState('');
  const [agenda, setAgenda] = useState('');

  // Dynamic Meetings Lists from backend
  const [allMeetings, setAllMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Helper for today's date string YYYY-MM-DD
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setMeetingDate(`${y}-${m}-${d}`);
  }, []);

  // Fetch dynamic meetings and CFL options from backend Spring Boot API
  useEffect(() => {
    let isMounted = true;

    const loadBackendData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [meetingsData, cflsData] = await Promise.all([
          hrMeetingService.getAllMeetings(),
          hrMeetingService.getCflOptions()
        ]);

        if (isMounted) {
          setAllMeetings(meetingsData || []);

          // Format CFL options list
          let options = [];
          if (Array.isArray(cflsData) && cflsData.length > 0) {
            options = cflsData.map(c => typeof c === 'string' ? c : (c.name || c.employeeName || `CFL ${c.empId || c.empCode}`));
          } else {
            options = ['Manpreet Kaur', 'Amit Chauhan', 'Yajnadutta Mishra', 'Rohit Verma', 'Sneha Reddy', 'Shalini', 'Amulya', 'Abhishek', 'John Doe'];
          }
          setCflList(options);
          if (options.length > 0) {
            setSelectedCfl(options[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching HR meetings from backend:', err);
        if (isMounted) {
          setErrorMsg('Could not connect to backend API (http://localhost:9085/api/meetings). Operating with cached data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBackendData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Separate meetings into Upcoming vs History
  const upcomingMeetings = allMeetings.filter(m => String(m.status).toUpperCase() !== 'COMPLETED' && String(m.status).toUpperCase() !== 'CANCELLED');
  const historyMeetings = allMeetings.filter(m => String(m.status).toUpperCase() === 'COMPLETED');

  // Trigger Edit Mode for a meeting
  const handleEditClick = (mtg) => {
    setEditingMeetingId(mtg.id);
    setSelectedCfl(mtg.cflName || mtg.withPerson || cflList[0] || '');
    setMeetingType(mtg.meetingType || mtg.title || 'HR 1:1 Check-in');
    setMeetingDate(mtg.date || '');
    setMeetingTime(mtg.time || '');
    setMeetingMode(mtg.mode || 'Zoom');
    setMeetingLink(mtg.link || '');
    setAgenda(mtg.agenda || '');

    // Scroll form into view smoothly
    const formElement = document.getElementById('hr-meeting-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reset form / Cancel edit
  const resetForm = () => {
    setEditingMeetingId(null);
    setMeetingType('HR 1:1 Check-in');
    setMeetingLink('');
    setAgenda('');
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setMeetingDate(`${y}-${m}-${d}`);
    setMeetingTime('');
  };

  // Form Submit Handler (Schedules or Updates meeting via backend API)
  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedCfl || !meetingDate || !meetingTime || !agenda.trim()) {
      alert('Please complete all required fields (CFL, Date, Time, and Agenda).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        cflName: selectedCfl,
        meetingWithRole: 'CFL',
        selectedPerson: selectedCfl,
        meetingType: meetingType || 'HR 1:1 Check-in',
        meetingDate: meetingDate,
        meetingTime: meetingTime,
        meetingMode: meetingMode,
        meetingLink: meetingLink,
        agenda: agenda
      };

      if (editingMeetingId) {
        // Update existing meeting on backend
        const updated = await hrMeetingService.updateMeeting(editingMeetingId, payload);
        setAllMeetings(prev => prev.map(m => m.id === editingMeetingId ? { ...m, ...updated, ...payload } : m));
        alert(`HR Meeting updated successfully for ${selectedCfl}!`);
      } else {
        // Schedule new meeting on backend
        const newMeeting = await hrMeetingService.scheduleMeeting(payload);
        setAllMeetings(prev => [newMeeting, ...prev]);
        alert(`HR Meeting scheduled successfully with ${selectedCfl}!`);
      }

      resetForm();
    } catch (err) {
      console.error('Error saving meeting:', err);
      alert('Failed to save meeting on backend.');
    } finally {
      setSubmitting(false);
    }
  };

  // Mark meeting as Completed
  const handleCompleteMeeting = async (id) => {
    try {
      await hrMeetingService.completeMeeting(id);
      setAllMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'COMPLETED' } : m));
      alert('Meeting marked as Completed! Moved to Meeting History.');
    } catch (err) {
      console.error('Error completing meeting:', err);
      alert('Failed to mark meeting as completed.');
    }
  };

  // Cancel / Delete meeting handler
  const handleCancelMeeting = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled meeting?')) return;
    try {
      await hrMeetingService.cancelMeeting(id);
      setAllMeetings(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error cancelling meeting:', err);
      alert('Failed to cancel meeting.');
    }
  };

  // Helper to check if meeting is within 12 hours from now
  const isMeetingWithin12Hours = (mtg) => {
    if (!mtg || !mtg.date) return false;
    try {
      const [y, m, d] = mtg.date.split('-').map(Number);
      let hrs = 12;
      let mins = 0;
      if (mtg.time) {
        const timeMatch = String(mtg.time).match(/(\d+):(\d+)\s*(AM|PM)?/i);
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
      const mtgDate = new Date(y, m - 1, d, hrs, mins);
      const now = new Date();
      const diffMs = mtgDate.getTime() - now.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);
      return diffHrs >= -2 && diffHrs <= 12;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-5 animate-fade-in duration-300 font-inter text-slate-800 select-none">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-grotesk tracking-tight">
            HR Meetings
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-inter">
            Track program-wide meetings across CFLs, mentors and managers.
          </p>
        </div>
        {errorMsg && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            {errorMsg}
          </div>
        )}
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('my-meetings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-sm ${
            activeTab === 'my-meetings'
              ? 'bg-[#78161A] text-white shadow-rose-900/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FaCalendarAlt className={activeTab === 'my-meetings' ? 'text-white' : 'text-slate-400'} />
          Upcoming Meetings ({upcomingMeetings.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-[#78161A] text-white shadow-rose-900/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FaClock className={activeTab === 'history' ? 'text-white' : 'text-slate-400'} />
          Meeting History ({historyMeetings.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center space-y-3">
          <FaSpinner className="animate-spin text-[#78161A] text-2xl mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading HR Meetings from Spring Boot backend...</p>
        </div>
      ) : activeTab === 'my-meetings' ? (
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
                    Scheduled Meetings
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {upcomingMeetings.length} Total
                  </span>
                </div>

                {upcomingMeetings.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-medium">
                    No upcoming HR meetings scheduled. Use the form on the right to schedule one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingMeetings.map((mtg) => {
                      const isSoon = isMeetingWithin12Hours(mtg);
                      return (
                        <div
                          key={mtg.id}
                          className={`flex items-center justify-between gap-4 p-3 rounded-2xl transition-all ${
                            isSoon
                              ? 'bg-amber-50/80 border-2 border-amber-400 ring-2 ring-amber-300/60 shadow-md animate-pulse'
                              : 'border-b border-slate-100 last:border-none'
                          }`}
                        >
                          {/* Left Date Badge + Info */}
                          <div className="flex items-center gap-3.5">
                            <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                              isSoon
                                ? 'bg-amber-500 text-white font-bold shadow-sm'
                                : 'bg-rose-50 border border-rose-100/60'
                            }`}>
                              <span className={`text-sm font-bold leading-none ${isSoon ? 'text-white' : 'text-[#78161A]'}`}>
                                {mtg.day || (mtg.date ? mtg.date.split('-')[2] : '15')}
                              </span>
                              <span className={`text-[9px] font-bold uppercase mt-0.5 ${isSoon ? 'text-amber-100' : 'text-[#78161A]/80'}`}>
                                {mtg.month || 'MAY'}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-slate-800 font-grotesk">
                                {mtg.meetingType || mtg.title} with {mtg.cflName || mtg.withPerson}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                                {mtg.time} · {mtg.mode}
                              </p>
                              {mtg.agenda && (
                                <p className="text-[10.5px] text-slate-400 line-clamp-1 italic mt-0.5">
                                  "{mtg.agenda}"
                                </p>
                              )}

                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                {isSoon && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10.5px] font-extrabold shadow-sm animate-bounce">
                                    ⚡ Starting Soon (&lt;12h)
                                  </span>
                                )}

                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[10.5px] font-semibold border border-rose-200/50">
                                  <FaFileAlt className="w-3 h-3 text-[#78161A]" />
                                  Created by HR
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Join, Edit, Complete, Delete */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {mtg.link && (
                              <a
                                href={mtg.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-sm transition-all ${
                                  isSoon
                                    ? 'bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-300'
                                    : 'bg-[#14B8A6] hover:bg-[#0D9488]'
                                }`}
                              >
                                Join
                              </a>
                            )}
                            <button
                              onClick={() => handleCompleteMeeting(mtg.id)}
                              title="Mark as Completed"
                              className="px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-all"
                            >
                              <FaCheckCircle className="text-xs text-emerald-600" />
                              <span className="hidden xl:inline">Complete</span>
                            </button>
                            <button
                              onClick={() => handleEditClick(mtg)}
                              title="Edit Meeting Details"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              <FaEdit className="text-xs" />
                            </button>
                            <button
                              onClick={() => handleCancelMeeting(mtg.id)}
                              title="Cancel Meeting"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <FaTrashAlt className="text-xs" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Schedule / Edit Meeting Form */}
          <div id="hr-meeting-form" className="lg:col-span-6 bg-white border border-slate-100/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#78161A] font-grotesk">
                {editingMeetingId ? 'Edit HR Meeting' : 'Schedule HR Meeting'}
              </h2>
              {editingMeetingId && (
                <span className="bg-amber-100 text-amber-800 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full">
                  Editing Mode
                </span>
              )}
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4">
              
              {/* SELECT CFL */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  SELECT CFL *
                </label>
                <div className="relative">
                  <select
                    value={selectedCfl}
                    onChange={(e) => setSelectedCfl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#78161A]/20 focus:border-[#78161A] appearance-none cursor-pointer"
                  >
                    {cflList.map((name, i) => (
                      <option key={i} value={name}>{name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
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
                  placeholder="HR 1:1 Check-in / Probation Review"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#78161A]/20 focus:border-[#78161A]"
                  required
                />
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
                      required
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
                      required
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
              </div>

              {/* AGENDA / TOPICS */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  AGENDA / TOPICS *
                </label>
                <textarea
                  rows={2}
                  placeholder="What would you like to discuss with the CFL?"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#78161A]/20 focus:border-[#78161A] resize-none"
                  required
                />
              </div>

              {/* Info Callout Box */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-700">
                <FaInfoCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {editingMeetingId ? (
                    <span>Updating this meeting will modify the record in the database (`ss_meeting`) and reflect immediately for the CFL.</span>
                  ) : (
                    <span>Scheduling an <span className="font-bold">HR Meeting</span> creates an entry in the backend database (`ss_meeting`) and notifies the CFL in their portal.</span>
                  )}
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="px-5 py-2 border border-[#78161A] text-[#78161A] hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {editingMeetingId ? 'Cancel Edit' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#78161A] hover:bg-[#5c1013] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <FaSpinner className="animate-spin text-xs" />}
                  <span>{submitting ? 'Saving...' : editingMeetingId ? 'Update Meeting' : 'Schedule Meeting'}</span>
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
              HR Meeting History
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
                  <th className="py-3 px-4">CFL NAME</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">MODE</th>
                  <th className="py-3 px-4">CREATED BY</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {historyMeetings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      No past meeting history found in database.
                    </td>
                  </tr>
                ) : (
                  historyMeetings.map((mtg) => {
                    return (
                      <tr key={mtg.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* DATE */}
                        <td className="py-4 px-4 font-semibold text-slate-800">
                          {mtg.date} ({mtg.time})
                        </td>

                        {/* CFL NAME */}
                        <td className="py-4 px-4 text-slate-800 font-bold">
                          {mtg.cflName || mtg.withPerson}
                        </td>

                        {/* TYPE */}
                        <td className="py-4 px-4 text-slate-700">
                          {mtg.meetingType || mtg.title || 'HR Sync'}
                        </td>

                        {/* MODE */}
                        <td className="py-4 px-4 text-slate-600">
                          {mtg.mode}
                        </td>

                        {/* CREATED BY */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-[11px] font-semibold border border-rose-200/50">
                            <FaFileAlt className="w-3 h-3 text-[#78161A]" />
                            Created by HR
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                            Completed
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrMeetings;
