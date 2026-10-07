import React, { useState, useEffect } from 'react';
import {
  FaUser,
  FaBook,
  FaTag,
  FaBrain,
  FaEdit
} from 'react-icons/fa';
import { cflAssignmentService } from '../../services/cflAssignmentService';

const Profile = () => {
  // Demo interactive state - can toggle edit alert
  const [isEditing, setIsEditing] = useState(false);

  // Dynamic Profile States
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cflEmpCode = 1125;

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await cflAssignmentService.getByCfl(cflEmpCode);
        if (active) {
          setProfileData(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error('Error fetching CFL profile:', err);
          setError('Could not connect to StartSmart server backend.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      return d.toLocaleDateString('en-GB', options);
    } catch {
      return dateStr;
    }
  };

  const names = (profileData?.cflName || 'Manpreet Kaur').split(' ');
  const firstName = profileData?.firstName || names[0] || '—';
  const middleName = profileData?.middleName || (names.length > 2 ? names.slice(1, -1).join(' ') : '—');
  const lastName = profileData?.lastName || (names.length > 1 ? names[names.length - 1] : '—');

  const personalDetails = [
    { label: 'FIRST NAME', value: firstName },
    { label: 'MIDDLE NAME', value: middleName },
    { label: 'LAST NAME', value: lastName },
    { label: 'E-MAIL', value: profileData?.cflEmail || profileData?.email || 'manpreet.kaur@cms.co.in' },
    { label: 'EMPLOYEE CODE', value: String(profileData?.cflEmpCode || profileData?.cflEmpId || cflEmpCode) },
    { label: 'DEPARTMENT', value: profileData?.department || 'SSD' },
    { label: 'DESIGNATION', value: profileData?.role || 'Java Developer' },
    { label: 'REPORTING MANAGER', value: profileData?.managerName || 'Ankit Chauhan' },
    { label: 'SUB DEPARTMENT', value: profileData?.subDepartment || '—' },
    { label: 'DATE OF JOINING', value: formatDate(profileData?.dateOfJoining || profileData?.effectiveFrom) },
    { label: 'REPORTING MANAGER E-MAIL', value: profileData?.managerEmail || (profileData?.managerName ? `${profileData.managerName.toLowerCase().replace(' ', '_')}@cms.co.in` : 'ankit_chauhan@cms.co.in') },
    { label: 'HR E-MAIL', value: 'hr.admin@cms.co.in' },
    { label: 'PROJECT', value: profileData?.project || '—' },
    { label: 'PROJECT CLASSIFICATION', value: profileData?.projectClassification || '—' },
    { label: 'BU HEAD', value: profileData?.buHead || '—' },
    { label: 'LOCATION', value: profileData?.location || 'Bengaluru' },
    { label: 'GENDER', value: profileData?.gender || 'Female' },
    { label: 'VERTICAL', value: profileData?.vertical || '—' },
    { label: 'CONTACT NUMBER', value: profileData?.contactNumber || '+91 98765 43210' },
    { label: 'SUB AREA', value: profileData?.subArea || '—' },
    { label: 'CATEGORY', value: profileData?.category || '—' }
  ];

  const scholastics = [
    { label: 'SSC / (XTH) (%)', value: profileData?.sscPercentage || '—' },
    { label: 'HSC / (XII) (%)', value: profileData?.hscPercentage || '—' },
    { label: 'UNDER GRADUATE (UG) (%)', value: profileData?.ugPercentage || '—' },
    { label: 'POST GRADUATE (PG) (%)', value: profileData?.pgPercentage || '—' },
    { label: 'INSTITUTE NAME', value: profileData?.instituteName || '—' },
    { label: 'INSTITUTE BRANCH', value: profileData?.instituteBranch || '—' }
  ];

  const technicalSkills = (profileData?.technicalSkills && profileData.technicalSkills.length > 0)
    ? profileData.technicalSkills
    : ['Java', 'Spring Boot', 'React.js', 'Microservices', 'SQL'];

  const nonTechnicalSkills = (profileData?.nonTechnicalSkills && profileData.nonTechnicalSkills.length > 0)
    ? profileData.nonTechnicalSkills
    : ['Communication', 'Teamwork', 'Time Management'];

  const getInitials = (name) => {
    if (!name) return 'CF';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-inter text-slate-500 font-bold animate-pulse">
        Loading profile details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 font-inter text-rose-500 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in duration-300 font-inter select-none">

      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1B1418] tracking-tight font-grotesk">
          My Profile
        </h2>
        <p className="text-[13px] text-slate-500 mt-1 font-medium font-inter">
          View and manage your personal information.
        </p>
      </div>

      {/* Profile Header Detail Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-6">

        {/* Core Profile Row */}
        <div className="flex items-center gap-5">
          <div className="w-[72px] h-[72px] rounded-full bg-[#78161A] text-white font-extrabold flex items-center justify-center text-3xl shadow-sm">
            {getInitials(profileData?.cflName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-800 font-grotesk leading-none">
                {profileData?.cflName || '—'}
              </h3>
              <span className="bg-[#FEF9C3] text-[#713F12] text-[9.5px] font-extrabold tracking-wider px-2 py-0.5 rounded-[4px]">
                CFL
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-650 mt-1.5 leading-none">
              {profileData?.role || '—'}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-1.5 leading-none">
              Joined on {formatDate(profileData?.effectiveFrom)}
            </p>
          </div>
        </div>

        {/* About Me slice */}
        <div className="pt-2">
          <span className="text-[9.5px] font-black text-slate-400 tracking-wider uppercase block mb-1.5">
            About Me
          </span>
          <p className="text-[12.5px] text-slate-700 font-semibold leading-relaxed">
            Passionate about building scalable applications and learning new technologies.
          </p>
        </div>

        {/* Primary Mentor slice */}
        <div className="pt-2 mt-8 flex flex-col gap-2.5">
          <span className="text-[9.5px] font-black text-slate-400 tracking-wider uppercase block">
            Primary Mentor
          </span>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ED8936] text-white font-black flex items-center justify-center text-xs shadow-inner">
                {getInitials(profileData?.mentorName)}
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-800 leading-snug">
                  {profileData?.mentorName || 'Unassigned'}
                </h4>
                <p className="text-[10.5px] font-semibold text-slate-400 mt-0.5">
                  Mentor
                </p>
              </div>
            </div>

            <button
              onClick={() => alert('Opening Mentor chat dialog...')}
              className="px-4 py-1.5 rounded-lg border border-[#78161A] text-[#78161A] hover:bg-rose-50/50 active:scale-95 text-[11px] font-extrabold outline-none bg-white transition-all cursor-pointer"
            >
              Message
            </button>
          </div>
        </div>

      </div>

      {/* Detailed Info Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-6">

        {/* Card Header */}
        <div className="flex justify-between items-center pb-2">
          <h3 className="text-[16px] font-bold text-[#78161A] font-grotesk">
            CFL's Details
          </h3>
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              alert(isEditing ? 'Profile Saved!' : 'Edit mode active - demo only.');
            }}
            className="bg-[#78161A] hover:bg-[#631013] active:scale-95 text-white text-[11.5px] font-extrabold py-1.5 px-4 rounded-lg flex items-center gap-1.5 outline-none transition-all cursor-pointer"
          >
            <FaEdit className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Save' : 'Edit'}</span>
          </button>
        </div>

        {/* Categories highlights */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">
              Employment Category
            </span>
            <span className="inline-flex self-start justify-center items-center bg-[#E6F4EA] text-[#137333] text-[10.5px] font-bold px-3 py-1 rounded-[5px]">
              CFL
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">
              Employment Status
            </span>
            <span className="inline-flex self-start justify-center items-center bg-[#FEF7E0] text-[#B06000] text-[10.5px] font-bold px-3 py-1 rounded-[5px] uppercase">
              {profileData?.status || 'PROBATION'}
            </span>
          </div>
        </div>

        {/* Section: Personal & Org Details */}
        <div className="border-t border-[#EAE3E4] pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <FaUser className="w-3.5 h-3.5 text-[#5C6BC0]" />
            <span className="text-[11.5px] font-extrabold uppercase tracking-wider block text-[#78161A]">
              Personal & Organizational Details
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-[26px] gap-x-6">
            {personalDetails.map((field) => (
              <div key={field.label} className="space-y-1">
                <span className="text-[9.5px] font-bold text-slate-400 tracking-wider uppercase block leading-none">
                  {field.label}
                </span>
                <span className="text-[13px] font-extrabold text-slate-850 block mt-1">
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Scholastics Info */}
        <div className="border-t border-[#EAE3E4] pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <FaBook className="w-3.5 h-3.5 text-[#66BB6A]" />
            <span className="text-[11.5px] font-extrabold uppercase tracking-wider block text-[#78161A]">
              Scholastics Info
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-[26px] gap-x-6">
            {scholastics.map((field) => (
              <div key={field.label} className="space-y-1">
                <span className="text-[9.5px] font-bold text-slate-400 tracking-wider uppercase block leading-none">
                  {field.label}
                </span>
                <span className="text-[13px] font-extrabold text-slate-850 block mt-1">
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Tech Skills */}
        <div className="border-t border-[#EAE3E4] pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <FaTag className="w-3.5 h-3.5 text-[#EC407A]" />
            <span className="text-[11.5px] font-extrabold uppercase tracking-wider block text-[#78161A]">
              Primary Technical Skills
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {technicalSkills.map((skill) => (
              <span
                key={skill}
                className="bg-rose-50 text-[#78161A] text-[11px] font-bold px-3.5 py-1 rounded-[5px] border border-rose-100"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Section: Nontech Skills */}
        <div className="border-t border-[#EAE3E4] pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <FaBrain className="w-3.5 h-3.5 text-[#F3C63F]" />
            <span className="text-[11.5px] font-extrabold uppercase tracking-wider block text-[#78161A]">
              Primary Nontechnical Skills
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {nonTechnicalSkills.map((skill) => (
              <span
                key={skill}
                className="bg-rose-50 text-[#78161A] text-[11px] font-bold px-3.5 py-1 rounded-[5px] border border-rose-100"
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

export default Profile;
