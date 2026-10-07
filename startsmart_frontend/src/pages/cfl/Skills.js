import React, { useState, useEffect } from 'react';
import { cflAssignmentService } from '../../services/cflAssignmentService';

const Skills = () => {
  const CFL_EMP_ID = 1125;
  const [profileFull, setProfileFull] = useState(null);
  const [techSkills, setTechSkills] = useState(['Java', 'Spring Boot', 'React.js', 'Microservices', 'SQL']);
  const [nonTechSkills, setNonTechSkills] = useState(['Communication', 'Teamwork', 'Time Management']);
  const [techInput, setTechInput] = useState('');
  const [nonTechInput, setNonTechInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Fetch initial skills and profile from backend
  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        setLoading(true);
        const data = await cflAssignmentService.getByCfl(CFL_EMP_ID);
        setProfileFull(data);
        if (data) {
          if (data.technicalSkills && data.technicalSkills.length > 0) {
            setTechSkills(data.technicalSkills);
          }
          if (data.nonTechnicalSkills && data.nonTechnicalSkills.length > 0) {
            setNonTechSkills(data.nonTechnicalSkills);
          }
        }
      } catch (err) {
        console.warn('Could not fetch skills from backend, using defaults:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkillsData();
  }, [CFL_EMP_ID]);

  // Persist updated skills to backend PostgreSQL database
  const syncSkillsToBackend = async (newTech, newNonTech) => {
    try {
      setSaving(true);
      const payload = {
        ...(profileFull || {}),
        cflEmpCode: CFL_EMP_ID,
        technicalSkills: newTech,
        nonTechnicalSkills: newNonTech
      };
      const updated = await cflAssignmentService.updateProfile(CFL_EMP_ID, payload);
      setProfileFull(updated);
      setSaveStatus('Saved to profile!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Failed to sync skills to backend:', err);
      setSaveStatus('Updated locally');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Technical Skills Handlers
  const handleAddTechSkill = (e) => {
    e.preventDefault();
    const trimmed = techInput.trim();
    if (!trimmed) return;
    if (techSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setTechInput('');
      return;
    }
    const updated = [...techSkills, trimmed];
    setTechSkills(updated);
    setTechInput('');
    syncSkillsToBackend(updated, nonTechSkills);
  };

  const handleRemoveTechSkill = (indexToRemove) => {
    const updated = techSkills.filter((_, idx) => idx !== indexToRemove);
    setTechSkills(updated);
    syncSkillsToBackend(updated, nonTechSkills);
  };

  // Non-Technical Skills Handlers
  const handleAddNonTechSkill = (e) => {
    e.preventDefault();
    const trimmed = nonTechInput.trim();
    if (!trimmed) return;
    if (nonTechSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setNonTechInput('');
      return;
    }
    const updated = [...nonTechSkills, trimmed];
    setNonTechSkills(updated);
    setNonTechInput('');
    syncSkillsToBackend(techSkills, updated);
  };

  const handleRemoveNonTechSkill = (indexToRemove) => {
    const updated = nonTechSkills.filter((_, idx) => idx !== indexToRemove);
    setNonTechSkills(updated);
    syncSkillsToBackend(techSkills, updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#78161A]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in duration-300 font-inter">
      {/* Top Title Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-grotesk tracking-tight">
            Primary Skills
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage your Primary Technical and NonTechnical skills — these are reflected in your My Profile page too.
          </p>
        </div>

        {saveStatus && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-fade-in">
            ✓ {saveStatus}
          </span>
        )}
      </div>

      {/* 1. Primary Technical Skills Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-base">🧠</span>
            <h2 className="text-base font-bold text-[#78161A] font-grotesk">
              Primary Technical Skills
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {techSkills.length} skill(s)
          </span>
        </div>

        {/* Skill Badges List */}
        <div className="flex flex-wrap gap-2.5 my-5 min-h-[42px] items-center">
          {techSkills.map((skill, index) => (
            <div
              key={index}
              className="bg-[#FFF0F1] border border-[#FADCDD] text-[#78161A] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all hover:shadow-xs group"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveTechSkill(index)}
                className="text-[#78161A]/60 hover:text-[#78161A] font-extrabold text-xs outline-none focus:outline-none"
                title="Remove skill"
              >
                ✕
              </button>
            </div>
          ))}
          {techSkills.length === 0 && (
            <span className="text-xs text-slate-400 italic">No technical skills added yet.</span>
          )}
        </div>

        {/* Input & Add Row */}
        <form onSubmit={handleAddTechSkill} className="flex items-center gap-3">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="e.g., Kubernetes"
            className="flex-1 bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#78161A] focus:ring-1 focus:ring-[#78161A] transition-all font-inter"
          />
          <button
            type="submit"
            disabled={saving || !techInput.trim()}
            className="bg-[#78161A] hover:bg-[#5C0E12] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center min-w-[80px]"
          >
            + Add
          </button>
        </form>
      </div>

      {/* 2. Primary NonTechnical Skills Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-base">🤝</span>
            <h2 className="text-base font-bold text-[#78161A] font-grotesk">
              Primary NonTechnical Skills
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {nonTechSkills.length} skill(s)
          </span>
        </div>

        {/* Skill Badges List */}
        <div className="flex flex-wrap gap-2.5 my-5 min-h-[42px] items-center">
          {nonTechSkills.map((skill, index) => (
            <div
              key={index}
              className="bg-[#FFF0F1] border border-[#FADCDD] text-[#78161A] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all hover:shadow-xs group"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveNonTechSkill(index)}
                className="text-[#78161A]/60 hover:text-[#78161A] font-extrabold text-xs outline-none focus:outline-none"
                title="Remove skill"
              >
                ✕
              </button>
            </div>
          ))}
          {nonTechSkills.length === 0 && (
            <span className="text-xs text-slate-400 italic">No non-technical skills added yet.</span>
          )}
        </div>

        {/* Input & Add Row */}
        <form onSubmit={handleAddNonTechSkill} className="flex items-center gap-3">
          <input
            type="text"
            value={nonTechInput}
            onChange={(e) => setNonTechInput(e.target.value)}
            placeholder="e.g., Public Speaking"
            className="flex-1 bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#78161A] focus:ring-1 focus:ring-[#78161A] transition-all font-inter"
          />
          <button
            type="submit"
            disabled={saving || !nonTechInput.trim()}
            className="bg-[#78161A] hover:bg-[#5C0E12] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center min-w-[80px]"
          >
            + Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default Skills;
