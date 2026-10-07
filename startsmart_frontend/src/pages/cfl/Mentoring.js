import React, { useState, useEffect, useCallback } from 'react';
import {
  FaUser,
  FaLaptop,
  FaCalendarAlt,
  FaVideo,
  FaClock,
  FaStar,
  FaRegStar,
  FaGraduationCap,
  FaUserFriends,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaTimes,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';
import { mentoringService } from '../../services/mentoringService';

const DEFAULT_CFL_EMP_ID = 1125;

const Mentoring = () => {
  // Main Sub-Tab State: 'sessions' | 'mentor-details'
  const [subTab, setSubTab] = useState('sessions');
  const [cflEmpId] = useState(DEFAULT_CFL_EMP_ID);

  // Loading & Error States
  const [loading, setLoading] = useState(true);

  // Planned & Completed Sessions State from backend API
  const [plannedSessions, setPlannedSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);

  // Mentor Details State from backend API
  const [mentorDetails, setMentorDetails] = useState({
    mentorName: 'Rohit Verma',
    mentorTitle: 'DevOps Engineer',
    mentorEmail: 'rohit.verma@cms.com',
    initials: 'RV',
    totalSessions: 5,
    completedSessions: 3,
    plannedSessions: 2,
    yourAvgRating: 5.0
  });

  // Modal State for Feedback
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedSessionForFeedback, setSelectedSessionForFeedback] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Technical Expertise', 'Guidance']);
  const [customTagInput, setCustomTagInput] = useState('');

  // Modal State for Session Details / Join / Mark Complete
  const [sessionDetailModalOpen, setSessionDetailModalOpen] = useState(false);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);

  // Available Skill/Topic Tags for Feedback
  const availableTags = [
    'Technical Expertise',
    'Guidance',
    'Availability',
    'Communication',
    'Problem Solving',
    'Code Quality',
    'Ownership',
    'Documentation'
  ];

  // Fetch all mentoring sessions & mentor profile details from backend API
  const loadMentoringData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Sessions
      const sessionsData = await mentoringService.getSessions(cflEmpId);
      if (sessionsData) {
        if (Array.isArray(sessionsData.plannedSessions)) {
          setPlannedSessions(sessionsData.plannedSessions);
        }
        if (Array.isArray(sessionsData.completedSessions)) {
          setCompletedSessions(sessionsData.completedSessions);
        }
      }

      // 2. Fetch Mentor Details & Stats
      const mentorData = await mentoringService.getMentorDetails(cflEmpId);
      if (mentorData) {
        setMentorDetails((prev) => ({
          ...prev,
          ...mentorData
        }));
      }
    } catch (err) {
      console.warn('Using existing state as fallback due to API error:', err);
    } finally {
      setLoading(false);
    }
  }, [cflEmpId]);

  useEffect(() => {
    loadMentoringData();
  }, [loadMentoringData]);

  // Handle Open Feedback Modal
  const openFeedbackModal = (session) => {
    setSelectedSessionForFeedback(session);
    setRating(5);
    setFeedbackText('');
    setSelectedTags(['Technical Expertise', 'Guidance']);
    setFeedbackModalOpen(true);
  };

  // Handle Tag Selection Toggle
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Add Custom Tag
  const handleAddCustomTag = () => {
    if (customTagInput.trim() && !selectedTags.includes(customTagInput.trim())) {
      setSelectedTags([...selectedTags, customTagInput.trim()]);
      setCustomTagInput('');
    }
  };

  // Submit Feedback to Backend API
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedSessionForFeedback) return;

    const payload = {
      cflEmpId: cflEmpId,
      rating: rating,
      feedbackText: feedbackText || 'Great session with insightful feedback and guidance.',
      tags: selectedTags.length > 0 ? selectedTags : ['Guidance']
    };

    try {
      await mentoringService.submitFeedback(selectedSessionForFeedback.id, payload);
      await loadMentoringData();
    } catch (err) {
      // Local optimistic fallback update if offline
      const todayDateStr = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      setCompletedSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id === selectedSessionForFeedback.id) {
            const updatedCflFeedback = {
              submitted: true,
              rating: rating,
              date: todayDateStr,
              text: payload.feedbackText,
              tags: payload.tags
            };

            const isBothComplete = s.mentorFeedback?.submitted && updatedCflFeedback.submitted;

            return {
              ...s,
              feedbackComplete: isBothComplete,
              cflFeedback: updatedCflFeedback
            };
          }
          return s;
        })
      );
    }

    setFeedbackModalOpen(false);
  };

  // Handle Open Session Details Modal
  const openSessionDetailModal = (session) => {
    setSelectedSessionDetail(session);
    setSessionDetailModalOpen(true);
  };

  // Handle Mark Session as Completed via Backend API
  const handleMarkAsCompleted = async (session) => {
    try {
      await mentoringService.markCompleted(session.id);
      await loadMentoringData();
    } catch (err) {
      // Local optimistic fallback update if offline
      setPlannedSessions((prev) => prev.filter((s) => s.id !== session.id));

      const newCompleted = {
        id: session.id,
        dateTimeStr: session.dateTimeStr,
        topic: session.topic,
        mode: session.mode,
        createdBy: session.createdBy,
        feedbackComplete: false,
        status: 'Completed',
        mentorFeedback: {
          submitted: false,
          rating: 0,
          date: '',
          text: '',
          tags: []
        },
        cflFeedback: {
          submitted: false,
          rating: 0,
          date: '',
          text: '',
          tags: []
        }
      };

      setCompletedSessions((prev) => [newCompleted, ...prev]);
    }

    setSessionDetailModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in duration-300 font-inter select-none pb-12">
      {/* 1. Page Title & Subtitle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B1418] tracking-tight font-grotesk">
            Mentoring
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium font-inter">
            Your mentor details and mentoring session history, all in one place.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-[#78161A] bg-[#78161A]/5 px-3 py-1.5 rounded-full">
            <FaSpinner className="animate-spin text-sm" />
            <span>Syncing with API...</span>
          </div>
        )}
      </div>

      {/* 2. Sub-Tabs Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSubTab('mentor-details')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all outline-none border cursor-pointer ${subTab === 'mentor-details'
            ? 'bg-[#5B0E14] text-white border-[#5B0E14] shadow-md'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
        >
          <FaUser className="text-[13px]" />
          <span>Mentor Details</span>
        </button>

        <button
          onClick={() => setSubTab('sessions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all outline-none border cursor-pointer ${subTab === 'sessions'
            ? 'bg-[#5B0E14] text-white border-[#5B0E14] shadow-md'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
        >
          <FaLaptop className="text-[14px]" />
          <span>Mentoring Sessions</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: MENTORING SESSIONS */}
      {/* ========================================================================= */}
      {subTab === 'sessions' && (
        <div className="space-y-8 animate-fade-in duration-300">

          {/* SECTION A: PLANNED SESSIONS */}
          <div className="bg-white rounded-2xl border border-[#EAE3E4] shadow-sm overflow-hidden">
            {/* Header Box */}
            <div className="bg-[#1C0D11] text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#2C181D]">
              <div className="flex items-center gap-3">
                <span className="text-lg">📝</span>
                <div>
                  <h2 className="text-base font-bold tracking-tight font-grotesk flex items-center gap-2 text-white">
                    Planned Sessions
                  </h2>
                  <p className="text-xs text-white/70 font-medium">
                    {plannedSessions.length} upcoming session(s) · click a session to view details, join, or complete it
                  </p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 bg-[#FAF9F9]">
              {plannedSessions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  No upcoming planned sessions right now.
                </div>
              ) : (
                plannedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white border border-[#EAE3E4] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    {/* Top Bar */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-sm font-grotesk">
                        <span>{session.mode === 'In-Person' ? '👥' : '💻'}</span>
                        <span>{session.dateTimeStr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#FEF3C7] text-[#D97706] text-[11px] font-bold px-3 py-0.5 rounded-full">
                          {session.countdown || 'Upcoming'}
                        </span>
                        <span className="bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold px-3 py-0.5 rounded-full">
                          {session.status}
                        </span>
                      </div>
                    </div>

                    {/* Topic & Mode details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          TOPIC
                        </span>
                        <span className="font-semibold text-slate-700 text-sm font-inter">
                          {session.topic}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          MODE
                        </span>
                        <span className="font-semibold text-slate-700 text-sm font-inter">
                          {session.mode}
                        </span>
                      </div>
                    </div>

                    {/* Tag & Action Link */}
                    <div className="space-y-2 pt-1">
                      <div>
                        {session.createdBy === 'Mentor' ? (
                          <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-[#BBF7D0]">
                            <FaGraduationCap className="text-[12px]" /> Created by Mentor
                          </span>
                        ) : (
                          <span className="bg-[#FFEDD5] text-[#C2410C] text-[11px] font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-[#FFD8A8]">
                            <FaUserFriends className="text-[12px]" /> Created by You
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => openSessionDetailModal(session)}
                        className="text-[#78161A] font-bold text-xs hover:underline inline-flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer pt-1"
                      >
                        Click to view details, join, or mark as completed →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>


          {/* SECTION B: COMPLETED SESSIONS */}
          <div className="bg-white rounded-2xl border border-[#EAE3E4] shadow-sm overflow-hidden">
            {/* Header Box */}
            <div className="bg-[#0D5C3E] text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#0B4F35]">
              <div className="flex items-center gap-3">
                <span className="text-lg">✅</span>
                <div>
                  <h2 className="text-base font-bold tracking-tight font-grotesk flex items-center gap-2 text-white">
                    Completed Sessions
                  </h2>
                  <p className="text-xs text-white/80 font-medium">
                    {completedSessions.length} session(s) — feedback tracked below
                  </p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 bg-[#FAF9F9]">
              {completedSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white border border-[#EAE3E4] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  {/* Top Header Bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm font-grotesk">
                      <span>{session.mode === 'In-Person' ? '📍' : '💻'}</span>
                      <span>{session.dateTimeStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.feedbackComplete ? (
                        <span className="bg-[#D1FAE5] text-[#047857] text-[11px] font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1 border border-[#A7F3D0]">
                          <FaCheck className="text-[10px]" /> Feedback Complete
                        </span>
                      ) : (
                        <span className="bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold px-3 py-0.5 rounded-full">
                          {session.mentorFeedback?.submitted || session.cflFeedback?.submitted
                            ? 'Feedback Pending'
                            : 'No Feedback Yet'}
                        </span>
                      )}

                      <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-3 py-0.5 rounded-full">
                        {session.status}
                      </span>
                    </div>
                  </div>

                  {/* Topic & Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        TOPIC
                      </span>
                      <span className="font-semibold text-slate-700 text-sm font-inter">
                        {session.topic}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        MODE
                      </span>
                      <span className="font-semibold text-slate-700 text-sm font-inter">
                        {session.mode}
                      </span>
                    </div>
                  </div>

                  {/* Tag */}
                  <div>
                    {session.createdBy === 'Mentor' ? (
                      <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-[#BBF7D0]">
                        <FaGraduationCap className="text-[12px]" /> Created by Mentor
                      </span>
                    ) : (
                      <span className="bg-[#FFEDD5] text-[#C2410C] text-[11px] font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-[#FFD8A8]">
                        <FaUserFriends className="text-[12px]" /> Created by You
                      </span>
                    )}
                  </div>

                  {/* FEEDBACK CARDS CONTAINER */}
                  <div className="space-y-3 pt-2">

                    {/* 1. MENTOR FEEDBACK CARD */}
                    {session.mentorFeedback && session.mentorFeedback.submitted ? (
                      <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#5B21B6] flex items-center gap-1.5">
                            <FaUser className="text-[11px]" /> Mentor Feedback
                          </span>
                        </div>

                        {/* Stars & Date */}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star}>
                                {star <= session.mentorFeedback.rating ? (
                                  <FaStar className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                  <FaRegStar className="w-3.5 h-3.5 text-slate-300 fill-current" />
                                )}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs font-medium text-slate-400">
                            {session.mentorFeedback.date}
                          </span>
                        </div>

                        {/* Comment Text */}
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {session.mentorFeedback.text}
                        </p>

                        {/* Skill Pills */}
                        {Array.isArray(session.mentorFeedback.tags) && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {session.mentorFeedback.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="bg-[#FFEDD5] text-[#9A3412] text-[11px] font-semibold px-3 py-0.5 rounded-full border border-[#FFD8A8]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 bg-slate-50/70 rounded-xl p-3 text-xs text-slate-400 font-medium flex items-center gap-2">
                        <span>⌛ Mentor Feedback — Not yet submitted</span>
                      </div>
                    )}

                    {/* 2. CFL FEEDBACK CARD */}
                    {session.cflFeedback && session.cflFeedback.submitted ? (
                      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#15803D] flex items-center gap-1.5">
                            <FaCheckCircle className="text-[11px]" /> CFL Feedback
                          </span>
                        </div>

                        {/* Stars & Date */}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star}>
                                {star <= session.cflFeedback.rating ? (
                                  <FaStar className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                  <FaRegStar className="w-3.5 h-3.5 text-slate-300 fill-current" />
                                )}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs font-medium text-slate-400">
                            {session.cflFeedback.date}
                          </span>
                        </div>

                        {/* Comment Text */}
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {session.cflFeedback.text}
                        </p>

                        {/* Skill Pills */}
                        {Array.isArray(session.cflFeedback.tags) && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {session.cflFeedback.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="bg-[#FFEDD5] text-[#9A3412] text-[11px] font-semibold px-3 py-0.5 rounded-full border border-[#FFD8A8]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 bg-slate-50/70 rounded-xl p-3 text-xs text-slate-400 font-medium flex items-center gap-2">
                        <span>⌛ CFL Feedback — Not yet submitted</span>
                      </div>
                    )}

                    {/* ACTION BUTTON TO SUBMIT FEEDBACK IF NOT SUBMITTED BY CFL */}
                    {(!session.cflFeedback || !session.cflFeedback.submitted) && (
                      <div className="pt-2">
                        <button
                          onClick={() => openFeedbackModal(session)}
                          className="bg-[#78161A] hover:bg-[#5B0E14] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 outline-none cursor-pointer"
                        >
                          <span>📝 Provide Your Feedback</span>
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: MENTOR DETAILS */}
      {/* ========================================================================= */}
      {subTab === 'mentor-details' && (
        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-8 shadow-xs animate-fade-in duration-300 space-y-8">

          {/* Top Profile Header Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Orange / Coral Avatar Circle */}
              <div className="w-14 h-14 rounded-full bg-[#EA7A5E] text-white font-extrabold text-xl flex items-center justify-center font-grotesk flex-shrink-0 shadow-xs">
                {mentorDetails.initials || 'RV'}
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-[#78161A] font-grotesk tracking-tight">
                  {mentorDetails.mentorName}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {mentorDetails.mentorTitle}
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  {mentorDetails.mentorEmail}
                </p>
              </div>
            </div>

            {/* Outlined Red Message Button */}
            <button className="border border-[#78161A] text-[#78161A] hover:bg-[#78161A]/5 px-6 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs bg-white cursor-pointer">
              Message
            </button>
          </div>

          {/* 4 Metric / Stat Cards in a Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">

            {/* Stat Card 1: TOTAL SESSIONS */}
            <div className="border border-[#EAE3E4] rounded-2xl p-6 text-center shadow-xs flex flex-col items-center justify-center space-y-3 bg-white hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-full bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center text-base">
                <FaCalendarAlt />
              </div>
              <div className="text-2xl font-black text-slate-900 font-grotesk">
                {mentorDetails.totalSessions}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">
                TOTAL SESSIONS
              </div>
            </div>

            {/* Stat Card 2: COMPLETED */}
            <div className="border border-[#EAE3E4] rounded-2xl p-6 text-center shadow-xs flex flex-col items-center justify-center space-y-3 bg-white hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-full bg-[#E6F4EA] text-[#16A34A] flex items-center justify-center text-base">
                <FaCheckCircle />
              </div>
              <div className="text-2xl font-black text-slate-900 font-grotesk">
                {mentorDetails.completedSessions}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">
                COMPLETED
              </div>
            </div>

            {/* Stat Card 3: PLANNED */}
            <div className="border border-[#EAE3E4] rounded-2xl p-6 text-center shadow-xs flex flex-col items-center justify-center space-y-3 bg-white hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FFF4E5] text-[#D97706] flex items-center justify-center text-base">
                <FaClock />
              </div>
              <div className="text-2xl font-black text-slate-900 font-grotesk">
                {mentorDetails.plannedSessions}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">
                PLANNED
              </div>
            </div>

            {/* Stat Card 4: YOUR AVG RATING */}
            <div className="border border-[#EAE3E4] rounded-2xl p-6 text-center shadow-xs flex flex-col items-center justify-center space-y-3 bg-white hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FFF8E1] text-[#EAB308] flex items-center justify-center text-base">
                <FaStar />
              </div>
              <div className="text-2xl font-black text-slate-900 font-grotesk">
                {typeof mentorDetails.yourAvgRating === 'number' ? mentorDetails.yourAvgRating.toFixed(1) : mentorDetails.yourAvgRating}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">
                YOUR AVG RATING
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PROVIDE FEEDBACK MODAL */}
      {/* ========================================================================= */}
      {feedbackModalOpen && selectedSessionForFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 font-inter">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 font-grotesk">
                  Provide Your Session Feedback
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {selectedSessionForFeedback.topic} · {selectedSessionForFeedback.dateTimeStr}
                </p>
              </div>
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitFeedback} className="space-y-4">

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  SESSION RATING
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl text-amber-400 transition-transform active:scale-125 focus:outline-none cursor-pointer"
                    >
                      {star <= rating ? <FaStar /> : <FaRegStar className="text-slate-300" />}
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {rating} out of 5 Stars
                  </span>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  YOUR DETAILED FEEDBACK & LEARNINGS
                </label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts on key takeaways, mentor guidance, clarity of explanations, or action items discussed..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#78161A] focus:border-[#78161A] outline-none font-inter text-slate-700 placeholder-slate-400"
                  required
                />
              </div>

              {/* Tag / Skill Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  HIGHLIGHTED SKILLS / TOPICS
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-all border cursor-pointer ${isSelected
                          ? 'bg-[#FFEDD5] text-[#9A3412] border-[#FFD8A8] shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{tag}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Tag */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    placeholder="Add custom tag..."
                    className="text-xs p-2 border border-slate-300 rounded-lg flex-1 outline-none focus:ring-1 focus:ring-[#78161A]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#78161A] hover:bg-[#5B0E14] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Submit Feedback
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SESSION DETAILS & JOIN MODAL */}
      {/* ========================================================================= */}
      {sessionDetailModalOpen && selectedSessionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 font-inter">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 font-grotesk">
                Session Details
              </h3>
              <button
                onClick={() => setSessionDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  TOPIC
                </span>
                <span className="text-sm font-bold text-slate-800 font-grotesk">
                  {selectedSessionDetail.topic}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    DATE & TIME
                  </span>
                  <span className="font-semibold text-slate-700">
                    {selectedSessionDetail.dateTimeStr}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    MODE
                  </span>
                  <span className="font-semibold text-slate-700">
                    {selectedSessionDetail.mode}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                  MEETING LINK
                </span>
                <a
                  href={selectedSessionDetail.meetingUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#78161A] font-bold text-xs underline flex items-center gap-1"
                >
                  {selectedSessionDetail.meetingUrl || 'https://zoom.us/j/9876543210'} <FaExternalLinkAlt className="text-[10px]" />
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
              <a
                href={selectedSessionDetail.meetingUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-white py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all text-center flex items-center justify-center gap-2"
              >
                <FaVideo /> Join Meeting Now
              </a>

              <button
                onClick={() => handleMarkAsCompleted(selectedSessionDetail)}
                className="w-full bg-[#0D5C3E] hover:bg-[#064E3B] text-white py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaCheckCircle /> Mark Session as Completed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Mentoring;
