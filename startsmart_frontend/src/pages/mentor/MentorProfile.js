import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';

const MentorProfile = () => {
  const [profileData] = useState({
    name: 'Rohit Verma',
    role: 'Senior Software Developer',
    userType: 'Mentor',
    avatarInitials: 'R',
    menteesCount: 4,
    sessionsCompleted: 5,
    feedbackGiven: 4,
    email: 'rohit.verma@cms.co.in',
    phone: '+91 98765 43210',
    empCode: 'RV1001',
    department: 'Technology',
    location: 'Bengaluru',
    joined: '15 Mar 2020',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Mentoring', 'Leadership']
  });

  return (
    <div className="space-y-6 animate-fade-in duration-300">
      {/* Header Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-grotesk">
            Mentor Profile (My Profile)
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Your mentoring profile and stats.
          </p>
        </div>

        {/* Edit Profile CTA Button */}
        <button
          onClick={() => alert('Opening Edit Profile modal...')}
          className="bg-white border border-[#78161A] text-[#78161A] hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-grotesk"
        >
          <FaEdit className="w-3 h-3 text-[#78161A]" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main Profile Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-8">
        {/* Top Profile Avatar Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#78161A] text-white text-2xl font-bold flex items-center justify-center flex-shrink-0 font-grotesk">
            {profileData.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-800 font-grotesk">
                {profileData.name}
              </h3>
              <span className="bg-amber-100/80 text-amber-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full font-inter">
                {profileData.userType}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {profileData.role}
            </p>
          </div>
        </div>

        {/* 3 KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Mentees */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-2xs space-y-1">
            <span className="text-2xl font-black text-slate-800 font-grotesk leading-none">
              {profileData.menteesCount}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-inter">
              Mentees
            </span>
          </div>

          {/* Card 2: Sessions Completed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-2xs space-y-1">
            <span className="text-2xl font-black text-slate-800 font-grotesk leading-none">
              {profileData.sessionsCompleted}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-inter">
              Sessions Completed
            </span>
          </div>

          {/* Card 3: Feedback Given */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-2xs space-y-1">
            <span className="text-2xl font-black text-slate-800 font-grotesk leading-none">
              {profileData.feedbackGiven}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-inter">
              Feedback Given
            </span>
          </div>
        </div>

        {/* Profile Info Details (3 Columns Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 pt-2">
          {/* Column 1 */}
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                EMAIL
              </span>
              <span className="text-xs font-bold text-slate-800 font-inter">
                {profileData.email}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                DEPARTMENT
              </span>
              <span className="text-xs font-bold text-slate-800 font-inter">
                {profileData.department}
              </span>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                PHONE
              </span>
              <span className="text-xs font-bold text-slate-800 font-inter">
                {profileData.phone}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                LOCATION
              </span>
              <span className="text-xs font-bold text-slate-800 font-inter">
                {profileData.location}
              </span>
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                EMPLOYEE CODE
              </span>
              <span className="text-xs font-bold text-slate-800 font-inter">
                {profileData.empCode}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-1">
                JOINED
              </span>
              <span className="text-xs font-bold text-slate-800 font-inter">
                {profileData.joined}
              </span>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-inter mb-3">
            SKILLS
          </span>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-rose-50 border border-rose-100 text-[#78161A] text-xs font-bold px-3 py-1 rounded-full font-inter"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
