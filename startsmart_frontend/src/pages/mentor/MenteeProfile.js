import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaStar, FaDownload } from 'react-icons/fa';
import { cflAssignmentService } from '../../services/cflAssignmentService';

const PLANNED_SESSIONS = [
  {
    id: 1,
    dateStr: '22 May 2026, 03:00 PM',
    daysTag: 'In 7 days',
    statusTag: 'Planned',
    topic: 'Quarterly Goal Discussion',
    mode: 'Zoom',
    createdBy: '👑 Created by You'
  },
  {
    id: 2,
    dateStr: '29 May 2026, 11:30 AM',
    daysTag: 'In 14 days',
    statusTag: 'Planned',
    topic: 'Mid-Quarter Check-in',
    mode: 'Google Meet',
    createdBy: '👤 Created by CFL'
  }
];

const COMPLETED_SESSIONS = [
  {
    id: 101,
    dateStr: '15 May 2026, 10:00 AM',
    feedbackTag: '✓ Feedback Complete',
    statusTag: 'Completed',
    topic: 'Career Growth Discussion',
    mode: 'Zoom',
    createdBy: '👑 Created by You',
    mentorFeedback: {
      rating: 5,
      date: '15 May 2026',
      comment: 'Manpreet is consistently improving her technical skills. She asks relevant questions and shows good initiative in solving problems.',
      skills: ['Technical Skills', 'Problem Solving', 'Communication']
    },
    cflFeedback: {
      rating: 5,
      date: '15 May 2026',
      comment: 'Rohit is an excellent mentor. He explains technical concepts clearly and shares real-time examples which helps me a lot in understanding. His guidance is very valuable.',
      skills: ['Technical Expertise', 'Guidance', 'Availability']
    }
  },
  {
    id: 102,
    dateStr: '01 May 2026, 11:00 AM',
    feedbackTag: 'CFL Feedback Pending',
    statusTag: 'Completed',
    topic: 'Sprint Retrospective & Growth Areas',
    mode: 'Google Meet',
    createdBy: '👤 Created by CFL',
    mentorFeedback: {
      rating: 5,
      date: '01 May 2026',
      comment: 'Good progress on the assigned module this sprint. Keep up the momentum and document your learnings.',
      skills: ['Ownership', 'Documentation']
    },
    cflFeedback: null
  },
  {
    id: 103,
    dateStr: '17 Apr 2026, 04:00 PM',
    feedbackTag: 'No Feedback Yet',
    statusTag: 'Completed',
    topic: 'Onboarding Check-in',
    mode: 'In-Person',
    createdBy: '👑 Created by You',
    mentorFeedback: null,
    cflFeedback: null
  }
];

const MenteeProfile = ({ cflEmpCode, onBack }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [menteeData, setMenteeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cflEmpCode) {
      fetchMenteeProfile(cflEmpCode);
    }
  }, [cflEmpCode]);

  const fetchMenteeProfile = async (code) => {
    setLoading(true);
    try {
      const data = await cflAssignmentService.getByCfl(code);
      setMenteeData(data);
    } catch (err) {
      console.error('Error loading mentee profile from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'M';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const renderStars = (count = 5) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400 text-xs">
        {[...Array(count)].map((_, i) => (
          <FaStar key={i} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 font-medium">
        Loading mentee profile details from backend...
      </div>
    );
  }

  if (!menteeData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
        <p className="text-slate-500 font-medium">Mentee profile not found for code {cflEmpCode}.</p>
        <button
          onClick={onBack}
          className="text-xs font-bold text-[#78161A] hover:underline"
        >
          ← Back to Assigned CFLs
        </button>
      </div>
    );
  }

  const firstName = menteeData.firstName || (menteeData.cflName ? menteeData.cflName.split(' ')[0] : '—');
  const lastName = menteeData.lastName || (menteeData.cflName ? menteeData.cflName.split(' ').slice(1).join(' ') : '—');

  return (
    <div className="space-y-6 animate-fade-in duration-300">
      {/* Back button & Page Title */}
      <div>
        <button
          onClick={onBack}
          className="text-xs font-bold text-[#78161A] hover:underline flex items-center gap-1 cursor-pointer mb-2 font-inter"
        >
          <span>← Back to Assigned CFLs</span>
        </button>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-grotesk">
          Mentee Profile
        </h2>
      </div>

      {/* Mentee Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#78161A] text-white text-2xl font-bold flex items-center justify-center flex-shrink-0 font-grotesk">
          {getInitials(menteeData.cflName)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-slate-800 font-grotesk">
              {menteeData.cflName}
            </h3>
            <span className="bg-amber-100/80 text-amber-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full font-inter">
              CFL
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {menteeData.role || menteeData.department || 'CFL Employee'}
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-inter ${
            activeTab === 'profile'
              ? 'bg-[#78161A] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>👤</span>
          <span>Profile Details</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-inter ${
            activeTab === 'sessions'
              ? 'bg-[#78161A] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>🤝</span>
          <span>Mentoring Sessions & Feedback</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-8">
          {/* Section: About */}
          <div>
            <span className="text-[11px] font-bold text-[#78161A] uppercase tracking-wider block font-inter mb-2">
              ABOUT
            </span>
            <p className="text-xs font-medium text-slate-600 leading-relaxed font-inter">
              {menteeData.bio || 'Passionate about building scalable applications and learning new technologies.'}
            </p>
          </div>

          {/* Section: Personal & Organizational Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#78161A] text-xs font-bold uppercase tracking-wider font-inter">
              <span>👤</span>
              <span>PERSONAL & ORGANIZATIONAL DETAILS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 pt-2">
              {/* Column 1 */}
              <div className="space-y-6">
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                    FIRST NAME
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-inter">
                    {firstName}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                    EMPLOYEE CODE
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-inter">
                    {menteeData.cflEmpCode}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                    LOCATION
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-inter">
                    {menteeData.location || 'Bengaluru'}
                  </span>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                    LAST NAME
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-inter">
                    {lastName}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                    DEPARTMENT
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-inter">
                    {menteeData.department || 'SSD'}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                    DATE OF JOINING
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-inter">
                    {formatDate(menteeData.dateOfJoining)}
                  </span>
                </div>
              </div>

              {/* Column 3 */}
              <div className="space-y-6">
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                    E-MAIL
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-inter">
                    {menteeData.cflEmail}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                    DESIGNATION
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-inter">
                    {menteeData.role || 'CFL Employee'}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                    GENDER
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-inter">
                    {menteeData.gender || 'Female'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            {/* Technical Skills */}
            <div>
              <div className="flex items-center gap-2 text-[#78161A] text-xs font-bold uppercase tracking-wider font-inter mb-3">
                <span>🗣️</span>
                <span>PRIMARY TECHNICAL SKILLS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {menteeData.technicalSkills && menteeData.technicalSkills.length > 0 ? (
                  menteeData.technicalSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-rose-50 border border-rose-100 text-[#78161A] text-xs font-bold px-3.5 py-1 rounded-full font-inter"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 font-medium">No technical skills listed</span>
                )}
              </div>
            </div>

            {/* Non-Technical Skills */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-[#78161A] text-xs font-bold uppercase tracking-wider font-inter mb-3">
                <span>🤝</span>
                <span>PRIMARY NONTECHNICAL SKILLS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {menteeData.nonTechnicalSkills && menteeData.nonTechnicalSkills.length > 0 ? (
                  menteeData.nonTechnicalSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-rose-50 border border-rose-100 text-[#78161A] text-xs font-bold px-3.5 py-1 rounded-full font-inter"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 font-medium">No non-technical skills listed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Mentoring Sessions & Feedback */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* SECTION 1: Planned Sessions */}
          <div className="space-y-4">
            {/* Header Banner */}
            <div className="bg-[#1F2937] text-white rounded-2xl p-5 shadow-xs space-y-1">
              <h3 className="text-sm font-extrabold flex items-center gap-2 font-grotesk">
                <span>📅</span>
                <span>Planned Sessions</span>
              </h3>
              <p className="text-xs text-slate-300 font-medium font-inter">
                2 upcoming session(s) — click a session to view details, join, or complete it
              </p>
            </div>

            {/* Planned Session Items */}
            <div className="space-y-4">
              {PLANNED_SESSIONS.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all"
                >
                  {/* Top Row: Date/Time + Status Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-xs font-inter">
                      <span>🗓️</span>
                      <span>{session.dateStr}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-3 py-1 rounded-full font-inter">
                        {session.daysTag}
                      </span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-3 py-1 rounded-full font-inter">
                        {session.statusTag}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid: Topic & Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-0.5">
                        TOPIC
                      </span>
                      <span className="text-xs font-bold text-slate-800 font-inter">
                        {session.topic}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-0.5">
                        MODE
                      </span>
                      <span className="text-xs font-bold text-slate-800 font-inter">
                        {session.mode}
                      </span>
                    </div>
                  </div>

                  {/* Creator Pill */}
                  <div>
                    <span className="inline-block bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-bold px-3 py-1 rounded-lg font-inter">
                      {session.createdBy}
                    </span>
                  </div>

                  {/* Action Link */}
                  <div className="pt-1">
                    <button
                      onClick={() => alert(`Viewing details for session: ${session.topic}`)}
                      className="text-xs font-bold text-[#78161A] hover:underline flex items-center gap-1 cursor-pointer font-inter"
                    >
                      <span>Click to view details, join, or mark as completed →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: Completed Sessions */}
          <div className="space-y-4 pt-2">
            {/* Header Banner */}
            <div className="bg-[#15803D] text-white rounded-2xl p-5 shadow-xs space-y-1">
              <h3 className="text-sm font-extrabold flex items-center gap-2 font-grotesk">
                <span>📋</span>
                <span>Completed Sessions</span>
              </h3>
              <p className="text-xs text-emerald-100 font-medium font-inter">
                3 session(s) — feedback tracked below (visible to HR)
              </p>
            </div>

            {/* Completed Session Items */}
            <div className="space-y-4">
              {COMPLETED_SESSIONS.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5"
                >
                  {/* Top Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-xs font-inter">
                      <span>🗓️</span>
                      <span>{session.dateStr}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {session.feedbackTag && (
                        <span
                          className={`text-[10px] font-extrabold px-3 py-1 rounded-full font-inter ${
                            session.feedbackTag.includes('Complete')
                              ? 'bg-emerald-100 text-emerald-700'
                              : session.feedbackTag.includes('Pending')
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {session.feedbackTag}
                        </span>
                      )}
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-3 py-1 rounded-full font-inter">
                        {session.statusTag}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-0.5">
                        TOPIC
                      </span>
                      <span className="text-xs font-bold text-slate-800 font-inter">
                        {session.topic}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-0.5">
                        MODE
                      </span>
                      <span className="text-xs font-bold text-slate-800 font-inter">
                        {session.mode}
                      </span>
                    </div>
                  </div>

                  {/* Creator Pill */}
                  <div>
                    <span className="inline-block bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-bold px-3 py-1 rounded-lg font-inter">
                      {session.createdBy}
                    </span>
                  </div>

                  {/* Mentor Feedback Box */}
                  {session.mentorFeedback ? (
                    <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 font-inter flex items-center gap-1.5">
                          <span>👤</span>
                          <span>Mentor Feedback</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {renderStars(session.mentorFeedback.rating)}
                        <span className="text-[11px] font-bold text-slate-400 font-inter">
                          {session.mentorFeedback.date}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-700 leading-relaxed font-inter">
                        "{session.mentorFeedback.comment}"
                      </p>

                      {session.mentorFeedback.skills && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {session.mentorFeedback.skills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="bg-rose-50 border border-rose-100 text-[#78161A] text-[10px] font-bold px-3 py-0.5 rounded-full font-inter"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                      <div className="text-xs font-semibold text-slate-400 italic flex items-center gap-2 font-inter">
                        <span>⏳</span>
                        <span>Mentor Feedback — Not yet submitted</span>
                      </div>
                      <div>
                        <button
                          onClick={() => alert(`Opening feedback modal for session: ${session.topic}`)}
                          className="bg-[#78161A] hover:bg-[#631013] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer font-grotesk"
                        >
                          Provide Your Feedback
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CFL Feedback Box */}
                  {session.cflFeedback ? (
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 font-inter flex items-center gap-1.5">
                          <span>✓</span>
                          <span>CFL Feedback</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {renderStars(session.cflFeedback.rating)}
                        <span className="text-[11px] font-bold text-slate-400 font-inter">
                          {session.cflFeedback.date}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-700 leading-relaxed font-inter">
                        "{session.cflFeedback.comment}"
                      </p>

                      {session.cflFeedback.skills && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {session.cflFeedback.skills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="bg-rose-50 border border-rose-100 text-[#78161A] text-[10px] font-bold px-3 py-0.5 rounded-full font-inter"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
                      <div className="text-xs font-semibold text-slate-400 italic flex items-center gap-2 font-inter">
                        <span>⏳</span>
                        <span>CFL Feedback — Not yet submitted</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenteeProfile;
