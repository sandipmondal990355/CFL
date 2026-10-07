import React, { useState, useEffect } from 'react';
import { 
  FaArrowLeft, 
  FaUser, 
  FaChartBar, 
  FaBook, 
  FaFolder, 
  FaExchangeAlt, 
  FaClock, 
  FaChevronRight,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaHeart,
  FaGraduationCap,
  FaStar,
  FaLock,
  FaCheckCircle,
  FaCalendarAlt
} from 'react-icons/fa';
import { cflAssignmentService } from '../../services/cflAssignmentService';
import { goalService } from '../../services/goalService';

const CflProfileOverview = ({ cfl, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [cflData, setCflData] = useState(cfl);
  const [isEditing, setIsEditing] = useState(false);
  const [managers, setManagers] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [cycleWorkflows, setCycleWorkflows] = useState([]);

  // HR Goal Tracking Modal state
  const [showGoalTrackerModal, setShowGoalTrackerModal] = useState(false);
  const [trackerStageTitle, setTrackerStageTitle] = useState('');
  const [trackerStageCode, setTrackerStageCode] = useState('');
  const [stageGoals, setStageGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(false);

  // Performance Cycle Sub-view state matching design screenshots
  const [cycleViewMode, setCycleViewMode] = useState('overview'); // 'overview' | 'preview_goals' | 'self_review' | 'manager_review'
  const [selectedCycleCode, setSelectedCycleCode] = useState('G30');
  const [selectedCycleTitle, setSelectedCycleTitle] = useState('Thirty Days Plan');
  const [perfGoals, setPerfGoals] = useState([]);
  const [loadingPerfGoals, setLoadingPerfGoals] = useState(false);
  const [probationDetail, setProbationDetail] = useState(null);
  const [loadingProbationDetail, setLoadingProbationDetail] = useState(false);
  const [cflDocuments, setCflDocuments] = useState([]);
  const [loadingCflDocuments, setLoadingCflDocuments] = useState(false);
  const [roleMovement, setRoleMovement] = useState({
    existingRole: '',
    formalRole: '',
    currentSkills: '',
    skillsGap: '',
    possibleMovement: 'Select',
    canBeBackup: null,
    backupForEmpName: '',
    project1: '',
    project2: '',
    project3: '',
    lastSavedDate: null,
    isSaved: false
  });
  const [isEditingRoleMovement, setIsEditingRoleMovement] = useState(false);
  const [movementOptions, setMovementOptions] = useState([
    'Select',
    'Same Role — Deepen Expertise',
    'Lateral Move — Different Domain',
    'Vertical Promotion',
    'Cross-Functional Move',
    'Leadership Track'
  ]);
  const [formalRoleOptions, setFormalRoleOptions] = useState([
    'Senior DevOps Engineer',
    'Lead DevOps Engineer',
    'Senior Java Developer',
    'Tech Lead',
    'Principal Engineer',
    'Solution Architect',
    'Engineering Manager'
  ]);
  const [savingRoleMovement, setSavingRoleMovement] = useState(false);
  const [roleMovementSavedSuccess, setRoleMovementSavedSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const getTargetCflCode = () => {
    return cflData?.cflEmpCode || cflData?.employeeCode || cflData?.cflEmpId || cfl?.cflEmpCode || cfl?.employeeCode || cfl?.cflEmpId || cfl?.id || 9085499;
  };

  const handleLoadCycleGoals = async (stageCode, stageTitle, mode) => {
    setSelectedCycleCode(stageCode);
    setSelectedCycleTitle(stageTitle);
    setCycleViewMode(mode);
    try {
      setLoadingPerfGoals(true);
      const cflCode = getTargetCflCode();
      const goals = await goalService.getGoalsByCfl(cflCode, stageCode);
      setPerfGoals(goals || []);
    } catch (err) {
      console.error('Error fetching cycle goals for HR view:', err);
    } finally {
      setLoadingPerfGoals(false);
    }
  };

  const fetchCflDetails = async () => {
    try {
      setLoading(true);
      const cflCode = cfl?.employeeCode || cfl?.cflEmpCode || cfl?.cflEmpId || cfl?.id || 9085499;
      const data = await cflAssignmentService.getByCfl(cflCode);
      setCflData(data);
    } catch (err) {
      console.error('Failed to load CFL details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoalWorkflows = async () => {
    try {
      const cflCode = getTargetCflCode();
      const res = await goalService.getWorkflowByCfl(cflCode);
      setCycleWorkflows(res || []);
    } catch (err) {
      console.warn('Failed to load goal workflows:', err);
    }
  };

  const fetchProbationDetail = async () => {
    try {
      setLoadingProbationDetail(true);
      const cflCode = getTargetCflCode();
      const res = await fetch(`http://localhost:9085/api/probation/detail/${cflCode}`);
      if (res.ok) {
        const data = await res.json();
        setProbationDetail(data);
      }
    } catch (err) {
      console.warn('Failed to fetch probation detail:', err);
    } finally {
      setLoadingProbationDetail(false);
    }
  };

  const fetchCflDocuments = async () => {
    try {
      setLoadingCflDocuments(true);
      const cflCode = getTargetCflCode();
      const res = await fetch(`http://localhost:9085/api/documents/cfl/${cflCode}`);
      if (res.ok) {
        const data = await res.json();
        setCflDocuments(data || []);
      }
    } catch (err) {
      console.warn('Failed to fetch CFL documents:', err);
    } finally {
      setLoadingCflDocuments(false);
    }
  };

  const fetchRoleMovementOptions = async () => {
    try {
      const res = await fetch(`http://localhost:9085/api/role-movement/options`);
      if (res.ok) {
        const data = await res.json();
        if (data.movementOptions && data.movementOptions.length > 0) {
          setMovementOptions(data.movementOptions);
        }
        if (data.formalRoleOptions && data.formalRoleOptions.length > 0) {
          setFormalRoleOptions(data.formalRoleOptions);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch role movement options:', err);
    }
  };

  const fetchRoleMovement = async () => {
    try {
      const cflCode = getTargetCflCode();
      const res = await fetch(`http://localhost:9085/api/role-movement/${cflCode}`);
      if (res.ok) {
        const data = await res.json();
        setRoleMovement(data);
      }
    } catch (err) {
      console.warn('Failed to fetch role movement:', err);
    }
  };

  const handleSaveRoleMovement = async () => {
    try {
      setSavingRoleMovement(true);
      const cflCode = getTargetCflCode();
      const res = await fetch(`http://localhost:9085/api/role-movement/${cflCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleMovement)
      });
      if (res.ok) {
        const savedData = await res.json();
        setRoleMovement(savedData);
        setIsEditingRoleMovement(false);
        setRoleMovementSavedSuccess(true);
        showToast('Role Movement details saved successfully!', 'success');
      }
    } catch (err) {
      console.error('Failed to save role movement:', err);
      showToast('Error saving Role Movement data', 'error');
    } finally {
      setSavingRoleMovement(false);
    }
  };

  const handleViewDocument = (docId) => {
    window.open(`http://localhost:9085/api/documents/view/${docId}`, '_blank');
  };

  const handleDownloadDocument = (docId, fileName) => {
    const downloadUrl = `http://localhost:9085/api/documents/download/${docId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName || 'document');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleHrApproveProbation = async () => {
    try {
      const cflCode = getTargetCflCode();
      const res = await fetch(`http://localhost:9085/api/probation/approve/${cflCode}`, { method: 'POST' });
      if (res.ok) {
        showToast('Probation successfully confirmed! Status updated to Confirmed.', 'success');
        fetchProbationDetail();
        fetchCflDetails();
      } else {
        showToast('Failed to confirm probation.', 'error');
      }
    } catch (err) {
      console.error('Failed to approve probation:', err);
      showToast('Error approving probation confirmation.', 'error');
    }
  };

  useEffect(() => {
    fetchCflDetails();
    fetchGoalWorkflows();
    fetchProbationDetail();
    fetchCflDocuments();
    fetchRoleMovement();
    fetchRoleMovementOptions();

    const loadDropdowns = async () => {
      try {
        const [mList, tList] = await Promise.all([
          cflAssignmentService.getManagers(),
          cflAssignmentService.getMentors()
        ]);
        setManagers(mList || []);
        setMentors(tList || []);
      } catch (err) {
        console.error('Failed to load managers/mentors lists:', err);
      }
    };
    loadDropdowns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfl?.employeeCode || cfl?.cflEmpCode || cfl?.cflEmpId]);

  const handleActivateCycle = async (stageCode, stageName) => {
    try {
      const cflCode = getTargetCflCode();
      await goalService.activateStage(cflCode, stageCode, 2026);
      showToast(`Goal setting (${stageName}) activated! Notification email dispatched to ${cflData?.cflName || cflData?.name || 'CFL'}.`, 'success');
      fetchGoalWorkflows();
    } catch (err) {
      console.error('Failed to activate cycle stage:', err);
      showToast('Failed to activate goal setting stage. Please try again.', 'error');
    }
  };

  const handleOpenGoalTracker = async (stageCode, stageTitle) => {
    try {
      setTrackerStageTitle(stageTitle);
      setTrackerStageCode(stageCode);
      setShowGoalTrackerModal(true);
      setLoadingGoals(true);
      const cflCode = getTargetCflCode();
      const goals = await goalService.getGoalsByCfl(cflCode, stageCode);
      setStageGoals(goals || []);
    } catch (err) {
      console.error('Error fetching stage goals for HR:', err);
    } finally {
      setLoadingGoals(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'CF';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

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

  const handleStartEdit = () => {
    const currentName = cflData.cflName || cflData.name || '';
    const names = currentName.split(' ');
    const fName = cflData.firstName || names[0] || '';
    const mName = cflData.middleName || (names.length > 2 ? names.slice(1, -1).join(' ') : '');
    const lName = cflData.lastName || (names.length > 1 ? names[names.length - 1] : '');

    setEditForm({
      cflName: currentName,
      firstName: fName,
      middleName: mName,
      lastName: lName,
      cflEmpCode: String(cflData.cflEmpCode || cflData.employeeCode || cfl.employeeCode || ''),
      cflEmail: cflData.cflEmail || cflData.email || '',
      role: cflData.role || '',
      department: cflData.department || 'SSD',
      businessUnit: cflData.businessUnit || 'SSD',
      subDepartment: cflData.subDepartment || '',
      dateOfJoining: cflData.dateOfJoining || cflData.effectiveFrom || '',
      project: cflData.project || '',
      projectClassification: cflData.projectClassification || '',
      buHead: cflData.buHead || '',
      location: cflData.location || '',
      gender: cflData.gender || 'Female',
      vertical: cflData.vertical || '',
      contactNumber: cflData.contactNumber || '',
      subArea: cflData.subArea || '',
      category: cflData.category || '',
      sscPercentage: cflData.sscPercentage || '',
      hscPercentage: cflData.hscPercentage || '',
      ugPercentage: cflData.ugPercentage || '',
      pgPercentage: cflData.pgPercentage || '',
      instituteName: cflData.instituteName || '',
      instituteBranch: cflData.instituteBranch || '',
      bio: cflData.bio || 'Passionate about building scalable applications and learning new technologies.',
      managerEmpCode: cflData.managerEmpCode || '',
      mentorEmpCode: cflData.mentorEmpCode || '',
      status: cflData.status || '',
      technicalSkills: [...(cflData.technicalSkills || [])],
      nonTechnicalSkills: [...(cflData.nonTechnicalSkills || [])],
      primaryTechSkillsStr: (cflData.technicalSkills || []).join(', '),
      primaryNonTechSkillsStr: (cflData.nonTechnicalSkills || []).join(', ')
    });
    setIsEditing(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const selectedManager = managers.find(m => String(m.empCode) === String(editForm.managerEmpCode));
      const selectedMentor = mentors.find(m => String(m.empCode) === String(editForm.mentorEmpCode));

      const fullName = [editForm.firstName, editForm.middleName, editForm.lastName].filter(Boolean).join(' ') || editForm.cflName;

      const techSkillsArray = editForm.primaryTechSkillsStr !== undefined 
        ? editForm.primaryTechSkillsStr.split(',').map(s => s.trim()).filter(Boolean)
        : (editForm.technicalSkills || []);
      
      const nonTechSkillsArray = editForm.primaryNonTechSkillsStr !== undefined 
        ? editForm.primaryNonTechSkillsStr.split(',').map(s => s.trim()).filter(Boolean)
        : (editForm.nonTechnicalSkills || []);

      const payload = {
        ...editForm,
        cflName: fullName,
        cflEmpCode: editForm.cflEmpCode ? parseInt(editForm.cflEmpCode) : (cflData.cflEmpCode || cfl.employeeCode),
        managerName: selectedManager ? selectedManager.name : '',
        mentorName: selectedMentor ? selectedMentor.name : '',
        technicalSkills: techSkillsArray,
        nonTechnicalSkills: nonTechSkillsArray
      };

      const updated = await cflAssignmentService.updateProfile(cfl.employeeCode, payload);
      setCflData(updated);
      setIsEditing(false);
      alert('CFL Profile updated successfully!');
    } catch (err) {
      console.error('Failed to save CFL Profile:', err);
      alert('Error updating profile details.');
    }
  };

  const currentName = cflData.cflName || cflData.name || '';
  const names = currentName.split(' ');
  const firstName = names[0] || '—';
  const middleName = names.length > 2 ? names.slice(1, -1).join(' ') : '—';
  const lastName = names.length > 1 ? names[names.length - 1] : '—';

  // Sub-tabs list matching design exactly
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaBook },
    { id: 'profile-details', label: 'Profile Details', icon: FaUser, iconColor: 'text-indigo-500' },
    { id: 'performance-cycles', label: 'Performance Cycles', icon: FaChartBar, iconColor: 'text-emerald-500' },
    { id: 'mentor-sessions', label: 'Mentor Sessions & Feedback', icon: FaHeart, iconColor: 'text-amber-500' },
    { id: 'probation-confirmation', label: 'Probation Confirmation', icon: FaGraduationCap, iconColor: 'text-blue-500' },
    { id: 'cfl-files', label: 'CFL Files', icon: FaFolder, iconColor: 'text-yellow-500' },
    { id: 'role-movement', label: 'Role Movement', icon: FaExchangeAlt, iconColor: 'text-sky-500' },
    { id: 'change-history', label: 'Change History', icon: FaClock, iconColor: 'text-slate-400' }
  ];

  // Dynamic status styling
  const isConfirmed = cflData.status === 'Confirm' || cflData.status === 'Completed' || (cflData.goalProgress && cflData.goalProgress >= 90);
  const employmentStatus = isConfirmed ? 'CONFIRMED' : 'PROBATION';
  const probationConfirmationStatus = isConfirmed ? 'Confirmed' : 'Not Eligible';

  return (
    <div className="space-y-6 animate-fade-in duration-300 font-inter select-none relative">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all duration-300 ${
          toast.type === 'error' 
            ? 'bg-rose-900 text-white border-rose-700 shadow-rose-950/40' 
            : 'bg-[#78161A] text-white border-[#9E1C22] shadow-red-950/40'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
            toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
          }`}>
            {toast.type === 'error' ? '✕' : '✓'}
          </div>
          <div>
            <h5 className="text-xs font-bold font-grotesk tracking-wide uppercase">
              {toast.type === 'error' ? 'Action Failed' : 'Email Notification Sent'}
            </h5>
            <p className="text-xs font-medium text-rose-100 mt-0.5 max-w-sm">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="ml-4 text-rose-200 hover:text-white text-sm font-bold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Back button & Title */}
      <div className="space-y-2 text-left">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-[#78161A] hover:text-[#631013] transition-colors outline-none border-none bg-transparent p-0 cursor-pointer"
        >
          <FaArrowLeft className="w-3 h-3" />
          <span>Back to My CFLs</span>
        </button>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-grotesk">
          CFL Profile — Overview
        </h2>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div className="flex items-center gap-4 text-left">
          <div className="w-[68px] h-[68px] rounded-full bg-[#78161A] text-white font-bold flex items-center justify-center text-2xl shadow-sm">
            {getInitials(currentName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#1B1418] font-grotesk leading-none">
                {currentName}
              </h3>
              <span className="bg-[#FEF9C3] text-[#713F12] text-[9.5px] font-extrabold tracking-wider px-2 py-0.5 rounded-[4px]">
                CFL
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-2 leading-none">
              {cflData.role || 'CFL Employee'} <span className="mx-1 text-slate-300">•</span> Reporting Manager: {cflData.managerName || cflData.manager || 'Ankit Chauhan'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="block text-[9.5px] font-black text-slate-400 tracking-wider uppercase font-semibold">
            EMPLOYMENT STATUS
          </span>
          <span className={`inline-flex mt-1.5 justify-center items-center text-[10.5px] font-bold px-3 py-1 rounded-[5px] uppercase ${
            employmentStatus === 'CONFIRMED' 
              ? 'bg-[#E6F4EA] text-[#137333]' 
              : 'bg-[#FEF7E0] text-[#B06000]'
          }`}>
            {employmentStatus}
          </span>
        </div>
      </div>

      {/* Tab Selectors Row - Rounded Pill Button Style */}
      <div className="flex flex-wrap gap-2.5 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all outline-none cursor-pointer ${
                isActive 
                  ? 'bg-[#4A0E17] text-white shadow-md border border-[#4A0E17]' 
                  : 'bg-white text-slate-700 border border-[#EAE3E4] hover:bg-slate-50 shadow-xs'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.iconColor || 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {/* OVERVIEW SUB-TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Employment Status */}
              <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.01)] text-center flex flex-col justify-center min-h-[140px]">
                <h4 className="text-[12.5px] font-bold text-slate-500 font-inter tracking-wide">
                  Employment Status
                </h4>
                <div className="mt-3">
                  <span className={`inline-flex justify-center items-center text-[10.5px] font-extrabold px-4 py-1.5 rounded-[5px] uppercase ${
                    isConfirmed ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#FEF7E0] text-[#B06000]'
                  }`}>
                    {isConfirmed ? 'Confirm' : 'Probation'}
                  </span>
                </div>
              </div>

              {/* Card 2: Review Cycles Completed */}
              <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.01)] text-center flex flex-col justify-center min-h-[140px]">
                <h4 className="text-[12.5px] font-bold text-slate-500 font-inter tracking-wide">
                  Review Cycles Completed
                </h4>
                {(() => {
                  const completedCount = (cycleWorkflows || []).filter(w => 
                    ['G30', 'G60', 'G90'].includes(w.stageCode) && 
                    ['CYCLE_COMPLETED', 'COMPLETED', 'APPROVED', 'CONFIRMED', 'SATISFIED'].includes((w.status || '').toUpperCase())
                  ).length;
                  const isFinalCompleted = (cycleWorkflows || []).some(w => 
                    (w.stageCode === 'G100' || w.stageId === 4) && 
                    ['CYCLE_COMPLETED', 'COMPLETED', 'APPROVED', 'CONFIRMED', 'SATISFIED'].includes((w.status || '').toUpperCase())
                  );
                  return (
                    <>
                      <p className="text-3xl font-bold text-slate-800 mt-2 font-grotesk tracking-tight">
                        {completedCount} / 3
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        {isFinalCompleted ? 'Final Review ✓ Completed' : 'Final Review pending'}
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* Card 3: Probation Confirmation */}
              <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.01)] text-center flex flex-col justify-center min-h-[140px]">
                <h4 className="text-[12.5px] font-bold text-slate-500 font-inter tracking-wide">
                  Probation Confirmation
                </h4>
                <div className="mt-3">
                  <span className={`inline-flex justify-center items-center text-[10.5px] font-extrabold px-4 py-1.5 rounded-[5px] ${
                    isConfirmed ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isConfirmed ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] text-left">
              <h3 className="text-sm font-bold text-slate-800 font-grotesk tracking-wide mb-4">
                Quick Links
              </h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setActiveTab('profile-details')}
                  className="flex items-center gap-2 border border-[#78161A] text-[#78161A] bg-transparent hover:bg-rose-50/50 font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                  <FaUser className="w-3 h-3" />
                  <span>View Profile Details</span>
                </button>
                <button 
                  onClick={() => setActiveTab('performance-cycles')}
                  className="flex items-center gap-2 border border-[#78161A] text-[#78161A] bg-transparent hover:bg-rose-50/50 font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                  <FaChartBar className="w-3 h-3" />
                  <span>View Performance Cycles</span>
                </button>
                <button 
                  onClick={() => setActiveTab('probation-confirmation')}
                  className="flex items-center gap-2 border border-[#78161A] text-[#78161A] bg-transparent hover:bg-rose-50/50 font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                  <FaBook className="w-3 h-3" />
                  <span>View Probation Confirmation</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE DETAILS SUB-TAB */}
        {activeTab === 'profile-details' && (
          <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-6 text-left font-inter">
            {isEditing ? (
              /* EDIT MODE */
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-[#EAE3E4]">
                  <div>
                    <h3 className="text-lg font-bold text-[#1B1418] flex items-center gap-2 font-grotesk">
                      <FaEdit className="text-[#78161A] w-4 h-4" />
                      Edit CFL — {currentName}
                    </h3>
                    <p className="text-[11.5px] text-slate-400 mt-0.5 font-medium">
                      Fields marked <span className="text-[#EF4444] font-bold">*</span> are required.
                    </p>
                  </div>
                </div>

                {/* Section 1: ASSIGN MANAGER & MENTOR */}
                <div className="border border-[#FCA5A5]/60 bg-[#FFF5F5] p-5 rounded-2xl space-y-4">
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-[#78161A] flex items-center gap-1.5 font-grotesk">
                    <span>🎯</span> ASSIGN MANAGER & MENTOR
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">
                        MANAGER <span className="text-[#EF4444] font-bold">*</span>
                      </label>
                      <select 
                        name="managerEmpCode" 
                        value={editForm.managerEmpCode} 
                        onChange={handleFormChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#78161A] cursor-pointer"
                      >
                        <option value="">Select Manager</option>
                        {managers.map(m => (
                          <option key={m.empCode} value={String(m.empCode)}>{m.name} ({m.empCode})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">
                        MENTOR
                      </label>
                      <select 
                        name="mentorEmpCode" 
                        value={editForm.mentorEmpCode} 
                        onChange={handleFormChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#78161A] cursor-pointer"
                      >
                        <option value="">Select Mentor</option>
                        {mentors.map(m => (
                          <option key={m.empCode} value={String(m.empCode)}>{m.name} ({m.empCode})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: PERSONAL & ORGANIZATIONAL DETAILS */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-[#78161A] flex items-center gap-1.5 font-grotesk text-left">
                    <span>👤</span> PERSONAL & ORGANIZATIONAL DETAILS
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Row 1 */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">FIRST NAME <span className="text-[#EF4444] font-bold">*</span></label>
                      <input type="text" name="firstName" value={editForm.firstName || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">MIDDLE NAME</label>
                      <input type="text" name="middleName" value={editForm.middleName || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">LAST NAME <span className="text-[#EF4444] font-bold">*</span></label>
                      <input type="text" name="lastName" value={editForm.lastName || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">E-MAIL <span className="text-[#EF4444] font-bold">*</span></label>
                      <input type="email" name="cflEmail" value={editForm.cflEmail || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">EMPLOYEE CODE <span className="text-[#EF4444] font-bold">*</span></label>
                      <input type="text" name="cflEmpCode" value={editForm.cflEmpCode || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">DEPARTMENT <span className="text-[#EF4444] font-bold">*</span></label>
                      <input type="text" name="department" value={editForm.department || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>

                    {/* Row 3 */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">DESIGNATION <span className="text-[#EF4444] font-bold">*</span></label>
                      <input type="text" name="role" value={editForm.role || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">SUB DEPARTMENT</label>
                      <input type="text" name="subDepartment" value={editForm.subDepartment || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">DATE OF JOINING</label>
                      <input type="date" name="dateOfJoining" value={editForm.dateOfJoining || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>

                    {/* Row 4 */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">PROJECT</label>
                      <input type="text" name="project" value={editForm.project || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">PROJECT CLASSIFICATION</label>
                      <input type="text" name="projectClassification" value={editForm.projectClassification || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">BU HEAD</label>
                      <input type="text" name="buHead" value={editForm.buHead || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>

                    {/* Row 5 */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">LOCATION</label>
                      <input type="text" name="location" value={editForm.location || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">GENDER</label>
                      <select name="gender" value={editForm.gender || 'Female'} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]">
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">VERTICAL</label>
                      <input type="text" name="vertical" value={editForm.vertical || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>

                    {/* Row 6 */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">CONTACT NUMBER</label>
                      <input type="text" name="contactNumber" value={editForm.contactNumber || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">SUB AREA</label>
                      <input type="text" name="subArea" value={editForm.subArea || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">CATEGORY</label>
                      <input type="text" name="category" value={editForm.category || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                  </div>
                </div>

                {/* Section 3: SCHOLASTICS INFO */}
                <div className="space-y-4 pt-4 border-t border-[#EAE3E4]">
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-[#78161A] flex items-center gap-1.5 font-grotesk text-left">
                    <span>📚</span> SCHOLASTICS INFO
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">SSC / (XTH) (%)</label>
                      <input type="text" name="sscPercentage" value={editForm.sscPercentage || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">HSC / (XII) (%)</label>
                      <input type="text" name="hscPercentage" value={editForm.hscPercentage || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">UNDER GRADUATE (UG) (%)</label>
                      <input type="text" name="ugPercentage" value={editForm.ugPercentage || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">POST GRADUATE (PG) (%)</label>
                      <input type="text" name="pgPercentage" value={editForm.pgPercentage || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">INSTITUTE NAME</label>
                      <input type="text" name="instituteName" value={editForm.instituteName || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">INSTITUTE BRANCH</label>
                      <input type="text" name="instituteBranch" value={editForm.instituteBranch || ''} onChange={handleFormChange} className="px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]" />
                    </div>
                  </div>
                </div>

                {/* Section 4: SKILLS */}
                <div className="space-y-4 pt-4 border-t border-[#EAE3E4]">
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-[#78161A] flex items-center gap-1.5 font-grotesk text-left">
                    <span>💬</span> SKILLS
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">PRIMARY TECHNICAL SKILLS</label>
                      <input 
                        type="text" 
                        name="primaryTechSkillsStr" 
                        value={editForm.primaryTechSkillsStr !== undefined ? editForm.primaryTechSkillsStr : (editForm.technicalSkills ? editForm.technicalSkills.join(', ') : '')} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, primaryTechSkillsStr: e.target.value, technicalSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                        placeholder="Java, Spring Boot, React.js, Microservices, SQL"
                        className="px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]"
                      />
                      <span className="text-[10px] text-slate-400 font-normal">Separate multiple skills with commas.</span>
                    </div>

                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">PRIMARY NONTECHNICAL SKILLS</label>
                      <input 
                        type="text" 
                        name="primaryNonTechSkillsStr" 
                        value={editForm.primaryNonTechSkillsStr !== undefined ? editForm.primaryNonTechSkillsStr : (editForm.nonTechnicalSkills ? editForm.nonTechnicalSkills.join(', ') : '')} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, primaryNonTechSkillsStr: e.target.value, nonTechnicalSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                        placeholder="Communication, Teamwork, Time Management"
                        className="px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: ABOUT ME */}
                <div className="space-y-4 pt-4 border-t border-[#EAE3E4]">
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-[#78161A] flex items-center gap-1.5 font-grotesk text-left">
                    <span>📝</span> ABOUT ME
                  </h4>
                  <div className="flex flex-col gap-1.5 text-left">
                    <textarea 
                      name="bio" 
                      rows="3" 
                      value={editForm.bio || ''} 
                      onChange={handleFormChange}
                      placeholder="Passionate about building scalable applications and learning new technologies."
                      className="px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#78161A]"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 flex justify-start gap-4 border-t border-[#EAE3E4]">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 rounded-lg border border-[#78161A] text-[#78161A] font-bold hover:bg-slate-50 transition-all text-xs tracking-wide cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2.5 rounded-lg bg-[#78161A] hover:bg-[#631013] text-white font-bold transition-all text-xs tracking-wide flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <FaSave className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW MODE */
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-[#EAE3E4]">
                  <h3 className="text-[16px] font-bold text-[#78161A] font-grotesk">
                    CFL Profile Details
                  </h3>
                  <button 
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-4 py-2 border border-[#78161A] text-[#78161A] hover:bg-rose-50/50 bg-white transition-all rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                  >
                    <FaEdit className="w-3.5 h-3.5 text-[#78161A]" />
                    <span>Edit CFL Details</span>
                  </button>
                </div>

                {/* Section 1: ABOUT ME */}
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-bold text-[#78161A] uppercase tracking-wider block font-grotesk">
                    ABOUT ME
                  </h4>
                  <p className="text-[12.5px] text-slate-650 font-semibold leading-relaxed">
                    {cflData.bio || 'Passionate about building scalable applications and learning new technologies.'}
                  </p>
                </div>

                {/* Section 2: PRIMARY MENTOR */}
                <div className="space-y-2 text-left pt-3 border-t border-[#EAE3E4]">
                  <h4 className="text-xs font-bold text-[#78161A] uppercase tracking-wider block font-grotesk">
                    PRIMARY MENTOR
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E06A3C] text-white font-bold flex items-center justify-center text-xs shadow-inner">
                      {getInitials(cflData.mentorName || 'Rohit Verma')}
                    </div>
                    <div>
                      <h5 className="text-[13px] font-bold text-slate-800 leading-snug">
                        {cflData.mentorName || 'Rohit Verma'}
                      </h5>
                      <p className="text-[10.5px] font-semibold text-slate-400">
                        {cflData.mentorRole || 'DevOps Engineer'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: PERSONAL & ORGANIZATIONAL DETAILS */}
                <div className="pt-4 border-t border-[#EAE3E4] space-y-4">
                  <div className="flex items-center gap-2">
                    <FaUser className="w-3.5 h-3.5 text-[#78161A]" />
                    <h4 className="text-xs font-bold text-[#78161A] uppercase tracking-wider block font-grotesk">
                      PERSONAL & ORGANIZATIONAL DETAILS
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6">
                    {[
                      { label: 'FIRST NAME', value: cflData.firstName || firstName },
                      { label: 'MIDDLE NAME', value: cflData.middleName || middleName },
                      { label: 'LAST NAME', value: cflData.lastName || lastName },
                      { label: 'E-MAIL', value: cflData.cflEmail || cflData.email || 'manpreet.kaur@cms.co.in' },
                      { label: 'EMPLOYEE CODE', value: String(cflData.cflEmpCode || cflData.employeeCode || '9085499') },
                      { label: 'DEPARTMENT', value: cflData.department || 'SSD' },
                      { label: 'DESIGNATION', value: cflData.role || 'Java Developer' },
                      { label: 'REPORTING MANAGER', value: cflData.managerName || cflData.manager || 'Ankit Chauhan' },
                      { label: 'SUB DEPARTMENT', value: cflData.subDepartment || '—' },
                      { label: 'DATE OF JOINING', value: formatDate(cflData.dateOfJoining || cflData.effectiveFrom || '2025-01-01') },
                      { label: 'REPORTING MANAGER E-MAIL', value: cflData.managerEmail || (cflData.managerName ? `${cflData.managerName.toLowerCase().replace(' ', '_')}@cms.co.in` : 'ankit_chauhan@cms.co.in') },
                      { label: 'HR E-MAIL', value: 'hr.admin@cms.co.in' },
                      { label: 'PROJECT', value: cflData.project || '—' },
                      { label: 'PROJECT CLASSIFICATION', value: cflData.projectClassification || '—' },
                      { label: 'BU HEAD', value: cflData.buHead || '—' },
                      { label: 'LOCATION', value: cflData.location || 'Bengaluru' },
                      { label: 'GENDER', value: cflData.gender || 'Female' },
                      { label: 'VERTICAL', value: cflData.vertical || '—' },
                      { label: 'CONTACT NUMBER', value: cflData.contactNumber || '+91 98765 43210' },
                      { label: 'SUB AREA', value: cflData.subArea || '—' },
                      { label: 'CATEGORY', value: cflData.category || '—' }
                    ].map((field) => (
                      <div key={field.label} className="space-y-1 text-left">
                        <span className="text-[9.5px] font-bold text-slate-400 tracking-wider uppercase block leading-none">
                          {field.label}
                        </span>
                        <span className="text-[13px] font-extrabold text-slate-850 block mt-1">
                          {field.value || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: SCHOLASTICS INFO */}
                <div className="pt-4 border-t border-[#EAE3E4] space-y-4">
                  <div className="flex items-center gap-2">
                    <FaBook className="w-3.5 h-3.5 text-[#78161A]" />
                    <h4 className="text-xs font-bold text-[#78161A] uppercase tracking-wider block font-grotesk">
                      SCHOLASTICS INFO
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6">
                    {[
                      { label: 'SSC / (XTH) (%)', value: cflData.sscPercentage || '—' },
                      { label: 'HSC / (XII) (%)', value: cflData.hscPercentage || '—' },
                      { label: 'UNDER GRADUATE (UG) (%)', value: cflData.ugPercentage || '—' },
                      { label: 'POST GRADUATE (PG) (%)', value: cflData.pgPercentage || '—' },
                      { label: 'INSTITUTE NAME', value: cflData.instituteName || '—' },
                      { label: 'INSTITUTE BRANCH', value: cflData.instituteBranch || '—' }
                    ].map((field) => (
                      <div key={field.label} className="space-y-1 text-left">
                        <span className="text-[9.5px] font-bold text-slate-400 tracking-wider uppercase block leading-none">
                          {field.label}
                        </span>
                        <span className="text-[13px] font-extrabold text-slate-850 block mt-1">
                          {field.value || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 5: PRIMARY TECHNICAL SKILLS */}
                <div className="pt-4 border-t border-[#EAE3E4] space-y-3">
                  <h4 className="text-xs font-bold text-[#78161A] uppercase tracking-wider block font-grotesk flex items-center gap-2">
                    <span>💬</span> PRIMARY TECHNICAL SKILLS
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(cflData.technicalSkills && cflData.technicalSkills.length > 0 ? cflData.technicalSkills : ['Java', 'Spring Boot', 'React.js', 'Microservices', 'SQL']).map((skill) => (
                      <span 
                        key={skill}
                        className="bg-rose-50 text-[#78161A] text-[11px] font-bold px-3.5 py-1 rounded-[5px] border border-rose-100/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Section 6: PRIMARY NONTECHNICAL SKILLS */}
                <div className="pt-4 border-t border-[#EAE3E4] space-y-3">
                  <h4 className="text-xs font-bold text-[#78161A] uppercase tracking-wider block font-grotesk flex items-center gap-2">
                    <span>💡</span> PRIMARY NONTECHNICAL SKILLS
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(cflData.nonTechnicalSkills && cflData.nonTechnicalSkills.length > 0 ? cflData.nonTechnicalSkills : ['Communication', 'Teamwork', 'Time Management']).map((skill) => (
                      <span 
                        key={skill}
                        className="bg-[#FFFBEB] text-[#78161A] text-[11px] font-bold px-3.5 py-1 rounded-[5px] border border-amber-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PERFORMANCE CYCLES SUB-TAB */}
        {activeTab === 'performance-cycles' && (
          <div className="space-y-6 text-left">
            {/* VIEW MODE 1: REVIEW CYCLES OVERVIEW (Image 1) */}
            {cycleViewMode === 'overview' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-1 border-b border-[#EAE3E4]">
                  <div>
                    <h3 className="text-[#1B1418] text-xl font-bold font-grotesk tracking-tight">
                      Review Cycles Overview
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 font-inter">
                    Financial Year 2026-2027
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { code: 'G30', title: 'Thirty Days Plan', icon: '🏛️', stageId: 1 },
                    { code: 'G60', title: 'Sixty Days Plan', icon: '🏛️', stageId: 2 },
                    { code: 'G90', title: 'Ninety Days Plan', icon: '🏛️', stageId: 3 },
                    { code: 'G100', title: 'Final Review', icon: '🎖️', stageId: 4 },
                  ].map((cycle) => {
                    const wf = (cycleWorkflows || []).find(w => 
                      w.stageCode === cycle.code || 
                      (w.stageId === cycle.stageId)
                    );
                    const wfStatus = wf?.status ? wf.status.toUpperCase() : '';
                    const isCompleted = ['CYCLE_COMPLETED', 'COMPLETED', 'APPROVED', 'CONFIRMED', 'SATISFIED'].includes(wfStatus);

                    return (
                      <div key={cycle.code} className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-xs flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="w-12 h-12 rounded-full bg-[#FCE7F3] text-[#BE185D] flex items-center justify-center text-xl">
                            {cycle.icon}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-800 font-grotesk">{cycle.title}</h4>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mt-3">STATUS</span>
                            <span className={`inline-flex mt-1 text-[11px] font-bold px-3.5 py-1 rounded-md ${
                              isCompleted ? 'bg-[#E6F4EA] text-[#137333]' : wfStatus ? 'bg-[#FEF7E0] text-[#B06000]' : 'bg-[#F1F5F9] text-slate-500'
                            }`}>
                              {isCompleted ? 'Completed' : wfStatus ? wfStatus.replace(/_/g, ' ') : 'Not Started'}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedCycleCode(cycle.code);
                            setSelectedCycleTitle(cycle.title);
                            setCycleViewMode('cycle_detail');
                          }}
                          className="w-full py-2.5 px-4 rounded-xl border border-[#78161A] text-[#78161A] hover:bg-rose-50 text-xs font-bold transition-all shadow-xs cursor-pointer bg-white"
                        >
                          View Full Details
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW MODE 2: SINGLE CYCLE DETAIL VIEW (Image 2) */}
            {cycleViewMode === 'cycle_detail' && (
              <div className="space-y-6">
                {/* Back to Performance Cycles Header Link */}
                <button 
                  onClick={() => setCycleViewMode('overview')}
                  className="flex items-center gap-2 text-xs font-bold text-[#78161A] hover:text-[#631013] transition-colors outline-none border-none bg-transparent p-0 cursor-pointer"
                >
                  <FaArrowLeft className="w-3 h-3" />
                  <span>Back to Performance Cycles</span>
                </button>

                {/* Dark Maroon Cycle Header Card */}
                <div className="bg-[#78161A] text-white rounded-2xl p-6 shadow-md flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold font-grotesk tracking-tight">{selectedCycleTitle}</h3>
                    <p className="text-xs text-rose-200 mt-1 font-medium">01 Apr 2026 to 30 Apr 2026</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-rose-200 tracking-wider uppercase block">CYCLE END DATE</span>
                    <span className="text-lg font-bold font-grotesk block mt-0.5">30 Apr 2026</span>
                  </div>
                </div>

                {/* 5 Stage Status Cards Row */}
                {(() => {
                  const wf = (cycleWorkflows || []).find(w => 
                    w.stageCode === selectedCycleCode || 
                    (selectedCycleCode === 'G30' && w.stageId === 1) ||
                    (selectedCycleCode === 'G60' && w.stageId === 2) ||
                    (selectedCycleCode === 'G90' && w.stageId === 3) ||
                    (selectedCycleCode === 'G100' && w.stageId === 4)
                  );
                  const status = wf ? (wf.status || '').toUpperCase() : 'NOT_STARTED';

                  const isGoalCreated = ['GOAL_ENABLED', 'GOALS_SUBMITTED', 'APPROVED', 'SUBMITTED_TO_HR', 'CYCLE_COMPLETED', 'COMPLETED', 'REVISION_REQUESTED'].includes(status);
                  const isManagerApproved = ['APPROVED', 'SUBMITTED_TO_HR', 'CYCLE_COMPLETED', 'COMPLETED'].includes(status);
                  const isSelfReviewed = ['SUBMITTED_TO_HR', 'CYCLE_COMPLETED', 'COMPLETED', 'SELF_REVIEW_COMPLETED'].includes(status) || wf?.selfAcceptedAt;
                  const isManagerFinalReviewed = ['SUBMITTED_TO_HR', 'CYCLE_COMPLETED', 'COMPLETED'].includes(status) || wf?.reviewCompletedAt;
                  const isSelfAccepted = ['CYCLE_COMPLETED', 'COMPLETED', 'SATISFIED'].includes(status) || wf?.selfAcceptanceStatus === 'ACCEPTED';

                  return (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Card 1: Goal Creation */}
                        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-xs flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="w-10 h-10 rounded-full bg-[#FCE7F3] text-[#BE185D] flex items-center justify-center text-lg">🎯</div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800 font-grotesk">Goal Creation</h4>
                              <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block mt-2">STATUS</span>
                              <span className={`inline-flex mt-1 text-[10.5px] font-bold px-3 py-1 rounded-md ${isGoalCreated ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#F1F5F9] text-slate-500'}`}>
                                {isGoalCreated ? 'Created On 01 Jun 2026' : 'Not Created'}
                              </span>
                            </div>
                          </div>
                          {isGoalCreated ? (
                            <button 
                              onClick={() => handleLoadCycleGoals(selectedCycleCode, selectedCycleTitle, 'preview_goals')}
                              className="w-full py-2 px-3 rounded-xl bg-[#78161A] text-white hover:bg-[#631013] text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              Preview Goals
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleActivateCycle(selectedCycleCode, selectedCycleTitle)}
                              className="w-full py-2 px-3 rounded-xl bg-[#78161A] text-white hover:bg-[#631013] text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              Activate Goal Setting
                            </button>
                          )}
                        </div>

                        {/* Card 2: Manager Approval */}
                        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-xs flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="w-10 h-10 rounded-full bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center text-lg">👤</div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800 font-grotesk">Manager Approval</h4>
                              <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block mt-2">STATUS</span>
                              <span className={`inline-flex mt-1 text-[10.5px] font-bold px-3 py-1 rounded-md ${isGoalCreated ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#F1F5F9] text-slate-500'}`}>
                                {isManagerApproved ? 'Approved On 02 Jun 2026' : status === 'GOALS_SUBMITTED' ? 'Under Review' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card 3: Self Review */}
                        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-xs flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="w-10 h-10 rounded-full bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center text-lg">👤</div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800 font-grotesk">Self Review</h4>
                              <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block mt-2">STATUS</span>
                              <span className={`inline-flex mt-1 text-[10.5px] font-bold px-3 py-1 rounded-md ${isGoalCreated ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#F1F5F9] text-slate-500'}`}>
                                {isSelfReviewed ? 'Completed On 20 Jun 2026' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          {isSelfReviewed && (
                            <button 
                              onClick={() => handleLoadCycleGoals(selectedCycleCode, selectedCycleTitle, 'self_review')}
                              className="w-full py-2 px-3 rounded-xl bg-[#78161A] text-white hover:bg-[#631013] text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              View Self Review
                            </button>
                          )}
                        </div>

                        {/* Card 4: Manager Final Review */}
                        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-xs flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-lg">⭐</div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800 font-grotesk">Manager Final Review</h4>
                              <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block mt-2">STATUS</span>
                              <span className={`inline-flex mt-1 text-[10.5px] font-bold px-3 py-1 rounded-md ${isGoalCreated ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#F1F5F9] text-slate-500'}`}>
                                {isManagerFinalReviewed ? 'Completed On 25 Jun 2026' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          {isManagerFinalReviewed && (
                            <button 
                              onClick={() => handleLoadCycleGoals(selectedCycleCode, selectedCycleTitle, 'manager_review')}
                              className="w-full py-2 px-3 rounded-xl bg-[#78161A] text-white hover:bg-[#631013] text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              View Manager Review
                            </button>
                          )}
                        </div>

                        {/* Card 5: Self Acceptance */}
                        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-xs flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center text-lg">☑️</div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800 font-grotesk">Self Acceptance</h4>
                              <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block mt-2">STATUS</span>
                              <span className={`inline-flex mt-1 text-[10.5px] font-bold px-3 py-1 rounded-md ${isSelfAccepted ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#F1F5F9] text-slate-500'}`}>
                                {isSelfAccepted ? 'Accepted On 26 Jun 2026' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Green Cycle Status Banner */}
                      <div className={`rounded-xl p-4 flex items-center gap-3 border ${
                        ['CYCLE_COMPLETED', 'COMPLETED'].includes(status) ? 'bg-[#E6F4EA] border-[#A7F3D0] text-[#137333]' : 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          ['CYCLE_COMPLETED', 'COMPLETED'].includes(status) ? 'bg-[#137333]' : 'bg-[#D97706]'
                        }`}>
                          ℹ
                        </div>
                        <span className="text-xs font-bold">
                          Cycle Status: <span className="uppercase font-extrabold">{status.replace(/_/g, ' ')}</span>
                        </span>
                      </div>

                      {/* Quarterly Timeline Card */}
                      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-xs space-y-6">
                        <h4 className="text-sm font-bold text-slate-800 font-grotesk">Quarterly Timeline</h4>
                        
                        <div className="relative py-4 px-2">
                          {/* Connecting line */}
                          <div className={`absolute top-[38px] left-12 right-12 h-[3px] z-0 ${
                            isSelfAccepted ? 'bg-[#137333]' : 'bg-slate-200'
                          }`} />
                          
                          <div className="relative z-10 flex justify-between items-center">
                            {[
                              { title: 'Goal Creation', isDone: isGoalCreated },
                              { title: 'Manager Approval', isDone: isManagerApproved },
                              { title: 'Self Review', isDone: isSelfReviewed },
                              { title: 'Manager Final Review', isDone: isManagerFinalReviewed },
                              { title: 'Self Acceptance', isDone: isSelfAccepted }
                            ].map((node, i) => (
                              <div key={i} className="flex flex-col items-center text-center space-y-2 bg-white px-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                                  node.isDone ? 'bg-[#137333] text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}>
                                  {node.isDone ? '✓' : i + 1}
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-slate-800">{node.title}</h5>
                                  <span className={`text-[10px] font-extrabold uppercase block mt-0.5 ${
                                    node.isDone ? 'text-[#137333]' : 'text-slate-400'
                                  }`}>
                                    {node.isDone ? 'COMPLETED' : 'PENDING'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-center items-center gap-6 pt-2 text-xs font-bold text-slate-600 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#137333]" />
                            <span>Completed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                            <span>Draft</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                            <span>Pending / In Progress</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* VIEW MODES 3, 4, 5: PREVIEW GOALS (Image 3), SELF REVIEW (Image 4), MANAGER REVIEW (Image 5) */}
            {['preview_goals', 'self_review', 'manager_review'].includes(cycleViewMode) && (
              <div className="space-y-6 text-left">
                {/* Back to Cycle Status Link */}
                <button 
                  onClick={() => setCycleViewMode('cycle_detail')}
                  className="flex items-center gap-2 text-xs font-bold text-[#78161A] hover:text-[#631013] transition-colors outline-none border-none bg-transparent p-0 cursor-pointer"
                >
                  <FaArrowLeft className="w-3 h-3" />
                  <span>Back to Cycle Status</span>
                </button>

                {/* Dark Maroon Header Banner */}
                <div className="bg-[#1B1418] text-white rounded-2xl p-5 shadow-lg flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FCE7F3] text-[#BE185D] flex items-center justify-center text-lg">
                      {cycleViewMode === 'self_review' ? '📄' : '🎯'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-grotesk tracking-tight">
                        {cycleViewMode === 'preview_goals' ? 'Goals Created by CFL' : cycleViewMode === 'self_review' ? 'Goals & Self Review' : 'SMART Goals'}
                      </h3>
                      <p className="text-xs text-slate-300 font-semibold mt-0.5">
                        {selectedCycleTitle} · {perfGoals.length > 0 ? perfGoals.length : 3} goal(s) defined
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#2D2328] border border-[#3E3238] rounded-xl px-5 py-2 text-right">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Weightage</span>
                    <span className="text-sm font-bold font-grotesk block text-white mt-0.5">
                      {perfGoals.length > 0 ? perfGoals.reduce((sum, g) => sum + (g.weightage || 0), 0) : 100}% / 100%
                    </span>
                  </div>
                </div>

                {/* Goals List */}
                <div className="space-y-4">
                  {loadingPerfGoals ? (
                    <div className="p-8 text-center text-xs font-bold text-slate-500">Loading goals from backend...</div>
                  ) : perfGoals.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#EAE3E4] p-10 text-center space-y-2">
                      <div className="text-3xl mb-1">🎯</div>
                      <h4 className="text-sm font-bold text-slate-800 font-grotesk">No SMART Goals Defined Yet</h4>
                      <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                        The CFL has not yet created or submitted SMART goals for this plan cycle.
                      </p>
                    </div>
                  ) : (
                    perfGoals.map((g, idx) => (
                      <div key={g.id || idx} className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-xs space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-[#FCE7F3] text-[#BE185D] font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <h4 className="text-base font-bold text-slate-800 font-grotesk">{g.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-[#E6F4EA] text-[#137333] text-[10.5px] font-bold px-3 py-1 rounded-md uppercase">
                              Completed
                            </span>
                            <span className="bg-[#FEF3C7] text-[#D97706] text-[10.5px] font-bold px-3 py-1 rounded-md font-grotesk">
                              {g.weightage || (idx === 0 ? 40 : 30)}%
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TARGET</span>
                            <span className="text-slate-700 font-semibold mt-1 block">{g.description || 'Complete certification / training'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CREATED ON</span>
                            <span className="text-slate-700 font-semibold mt-1 block">01 Jun 2026</span>
                          </div>
                        </div>

                        {/* Self Review Box (Image 3 and Image 4) */}
                        {(cycleViewMode === 'self_review' || cycleViewMode === 'manager_review') && (
                          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-4 flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <span className="font-bold text-[#047857] flex items-center gap-1 text-xs">
                                <span>✓</span> Self Review
                              </span>
                              <div>
                                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">REMARKS</span>
                                <span className="text-slate-700 font-semibold block">{g.selfRemarks || 'Completed all planned modules ahead of schedule.'}</span>
                              </div>
                            </div>
                            <div className="text-right pl-4">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">SELF ASSESSMENT SCORE</span>
                              <span className="text-lg font-bold text-[#047857] font-grotesk">96 <span className="text-xs text-slate-400 font-normal">/100</span></span>
                            </div>
                          </div>
                        )}

                        {/* Manager Review Box (Image 4) */}
                        {cycleViewMode === 'manager_review' && (
                          <div className="bg-[#F3E8FF] border border-[#E9D5FF] rounded-xl p-4 flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <span className="font-bold text-[#7E22CE] flex items-center gap-1 text-xs">
                                <span>👤</span> Manager Review
                              </span>
                              <div>
                                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">MANAGER COMMENTS</span>
                                <span className="text-slate-700 font-semibold block">{g.managerRemarks || 'Outstanding delivery this cycle.'}</span>
                              </div>
                            </div>
                            <div className="text-right pl-4">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">MANAGER ASSESSMENT SCORE</span>
                              <span className="text-lg font-bold text-[#7E22CE] font-grotesk">98 <span className="text-xs text-slate-400 font-normal">/100</span></span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 text-center flex flex-col items-center justify-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-[#FCE7F3] text-[#BE185D] flex items-center justify-center text-sm">🎯</div>
                    <span className="text-2xl font-bold text-slate-800 font-grotesk">{perfGoals.length > 0 ? perfGoals.length : 3}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL SMART GOALS</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 text-center flex flex-col items-center justify-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center text-sm">📄</div>
                    <span className="text-2xl font-bold text-slate-800 font-grotesk">0</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DEVELOPMENT GOALS</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 text-center flex flex-col items-center justify-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center text-sm">%</div>
                    <span className="text-2xl font-bold text-slate-800 font-grotesk">100%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL WEIGHTAGE</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 text-center flex flex-col items-center justify-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center text-sm">🗓️</div>
                    <span className="text-base font-bold text-slate-800 font-grotesk">{selectedCycleTitle}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PLAN</span>
                  </div>
                </div>

                {/* Go Back Button right-aligned */}
                <div className="flex justify-end">
                  <button 
                    onClick={() => setCycleViewMode('cycle_detail')}
                    className="px-5 py-2 rounded-xl border border-[#78161A] text-[#78161A] hover:bg-rose-50 text-xs font-bold transition-all shadow-xs cursor-pointer bg-white"
                  >
                    ← Go Back
                  </button>
                </div>

                {/* Blue notification banner */}
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3 text-xs text-[#1E40AF] font-medium flex items-center gap-2">
                  <span className="font-bold">ℹ SMART Goals:</span> Specific, Measurable, Achievable, Relevant, Time-bound objectives.
                  <span className="font-bold ml-2">Development Goals:</span> Training and skill development objectives.
                </div>
              </div>
            )}
          </div>
        )}

        {/* MENTOR SESSIONS & FEEDBACK SUB-TAB */}
        {activeTab === 'mentor-sessions' && (
          <div className="space-y-6 text-left">
            {/* Primary Mentor Card */}
            <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#ED8936] text-white font-black flex items-center justify-center text-sm shadow-xs">
                  RV
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-slate-800 leading-snug font-grotesk">
                    Rohit Verma
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    Assigned Mentor • DevOps Engineer
                  </p>
                </div>
              </div>
            </div>

            {/* Planned Sessions Header Card */}
            <div className="bg-white rounded-2xl border border-[#EAE3E4] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
              <div className="bg-[#1B1418] text-white p-4 flex items-center justify-between">
                <h4 className="text-[13px] font-bold flex items-center gap-2 font-grotesk tracking-wide">
                  <span>📅</span> Planned Sessions
                </h4>
                <span className="text-[10.5px] font-semibold text-slate-300">2 upcoming session(s)</span>
              </div>
              <div className="p-5 space-y-4">
                {/* Planned Session 1 */}
                <div className="border border-[#EAE3E4] rounded-xl p-4 space-y-3 hover:bg-slate-50/50 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      <span className="text-xs font-extrabold text-slate-800">22 May 2026, 03:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">In 7 days</span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Planned</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-2">
                    <div><span className="text-[9.5px] text-slate-400 font-bold block uppercase">TOPIC</span>Quarterly Goal Discussion</div>
                    <div><span className="text-[9.5px] text-slate-400 font-bold block uppercase">MODE</span>Zoom</div>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                      <span>🌱</span> Created by Mentor
                    </span>
                  </div>
                </div>

                {/* Planned Session 2 */}
                <div className="border border-[#EAE3E4] rounded-xl p-4 space-y-3 hover:bg-slate-50/50 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      <span className="text-xs font-extrabold text-slate-800">29 May 2026, 11:30 AM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">In 14 days</span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Planned</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-2">
                    <div><span className="text-[9.5px] text-slate-400 font-bold block uppercase">TOPIC</span>Mid Quarter Check in</div>
                    <div><span className="text-[9.5px] text-slate-400 font-bold block uppercase">MODE</span>Google Meet</div>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-100">
                      <span>🌱</span> Created by CFL
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Completed Sessions Header Card */}
            <div className="bg-white rounded-2xl border border-[#EAE3E4] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
              <div className="bg-[#137333] text-white p-4 flex items-center justify-between">
                <h4 className="text-[13px] font-bold flex items-center gap-2 font-grotesk tracking-wide">
                  <span>✅</span> Completed Sessions
                </h4>
                <span className="text-[10.5px] font-semibold text-emerald-100">3 session(s) — mentor and CFL feedback recorded below</span>
              </div>
              <div className="p-5 space-y-6">
                {/* Completed Session 1 */}
                <div className="border border-[#EAE3E4] rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-extrabold text-slate-800">15 May 2026, 10:00 AM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">✓ Feedback Complete</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Completed</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                    <div><span className="text-[9.5px] text-slate-400 font-bold block uppercase">TOPIC</span>Career Growth Discussion</div>
                    <div><span className="text-[9.5px] text-slate-400 font-bold block uppercase">MODE</span>Zoom</div>
                  </div>

                  {/* Mentor Feedback Box */}
                  <div className="bg-[#F3E8FF]/60 border border-[#E9D5FF] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                        <span>👤</span> Mentor Feedback
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        {'★'.repeat(5)} <span className="text-[10px] text-slate-400 font-bold ml-1">15 May 2026</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Manpreet is consistently improving her technical skills. She asks relevant questions and shows good initiative in solving problems.
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      {['Technical Skills', 'Problem Solving', 'Communication'].map(tag => (
                        <span key={tag} className="bg-rose-100/70 text-[#78161A] text-[9.5px] font-bold px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* CFL Feedback Box */}
                  <div className="bg-[#ECFDF5]/80 border border-[#A7F3D0] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                        <span>✓</span> CFL Feedback
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        {'★'.repeat(5)} <span className="text-[10px] text-slate-400 font-bold ml-1">15 May 2026</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Rohit is an excellent mentor. He explains technical concepts clearly and shares real-time examples which helps me a lot in understanding. His guidance is very valuable.
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      {['Technical Expertise', 'Guidance', 'Availability'].map(tag => (
                        <span key={tag} className="bg-rose-100/70 text-[#78161A] text-[9.5px] font-bold px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Completed Session 2 */}
                <div className="border border-[#EAE3E4] rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-extrabold text-slate-800">01 May 2026, 11:00 AM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">CFL Feedback Pending</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Completed</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                    <div><span className="text-[9.5px] text-slate-400 font-bold block uppercase">TOPIC</span>Sprint Retrospective & Growth Areas</div>
                    <div><span className="text-[9.5px] text-slate-400 font-bold block uppercase">MODE</span>Google Meet</div>
                  </div>

                  {/* Mentor Feedback Box */}
                  <div className="bg-[#F3E8FF]/60 border border-[#E9D5FF] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                        <span>👤</span> Mentor Feedback
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        {'★'.repeat(4)}<span className="text-slate-300">★</span> <span className="text-[10px] text-slate-400 font-bold ml-1">01 May 2026</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Good progress on the assigned module this sprint. Keep up the momentum and document your learnings.
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      {['Ownership', 'Documentation'].map(tag => (
                        <span key={tag} className="bg-rose-100/70 text-[#78161A] text-[9.5px] font-bold px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] font-semibold text-slate-400 flex items-center gap-2">
                    <span>🎓</span> CFL Feedback — Not yet submitted
                  </div>
                </div>

                {/* Completed Session 3 */}
                <div className="border border-[#EAE3E4] rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-extrabold text-slate-800">17 Apr 2026, 04:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">No Feedback Yet</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Completed</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                    <div><span className="text-[9.5px] text-slate-400 font-bold block uppercase">TOPIC</span>Onboarding Check-in</div>
                    <div><span className="text-[9.5px] text-slate-400 font-bold block uppercase">MODE</span>In-Person</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] font-semibold text-slate-400 flex items-center gap-2">
                    <span>👤</span> Mentor Feedback — Not yet submitted
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] font-semibold text-slate-400 flex items-center gap-2">
                    <span>🎓</span> CFL Feedback — Not yet submitted
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROBATION CONFIRMATION SUB-TAB (Matching User Attached Image & Dynamic Backend Status) */}
        {activeTab === 'probation-confirmation' && (
          <div className="space-y-6 text-left font-inter">
            {/* Header Title Bar */}
            <div className="flex justify-between items-center pb-2 border-b border-[#EAE3E4]">
              <div>
                <h3 className="text-base font-bold text-slate-800 font-grotesk flex items-center gap-2">
                  <span className="text-xl">🎓</span> Probation Evaluation & Confirmation Form
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  {probationDetail?.isConfirmed 
                    ? `Confirmed on ${probationDetail?.confirmationDate || '06 Sep 2026'}`
                    : 'Probation Status: Pending Confirmation'}
                </p>
              </div>
            </div>

            {/* Approval Tracking Timeline */}
            <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-6">
              <h4 className="text-xs font-bold text-slate-600 font-grotesk text-center tracking-wide">
                Approval Tracking Timeline
              </h4>

              <div className="relative flex items-center justify-between max-w-xl mx-auto px-12 py-4">
                {/* Connecting Line between node centers */}
                <div 
                  className={`absolute left-[70px] right-[70px] top-[36px] h-[3px] z-0 ${
                    probationDetail?.isConfirmed ? 'bg-[#16A34A]' : 'bg-slate-200'
                  }`} 
                />

                {/* Node 1: Manager Submission */}
                <div className="relative z-10 text-center flex flex-col items-center bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-sm ${
                    (probationDetail?.isManagerSubmitted || probationDetail?.isConfirmed) ? 'bg-[#16A34A] text-white' : 'bg-amber-100 text-amber-700 border-2 border-amber-400'
                  }`}>
                    {(probationDetail?.isManagerSubmitted || probationDetail?.isConfirmed) ? '✓' : '⏳'}
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 font-grotesk mt-2.5 block">Manager Submission</span>
                  <span className="text-[10px] font-extrabold text-[#1D4ED8] block mt-0.5">
                    {probationDetail?.timeline?.[0]?.name || cflData?.managerName?.toUpperCase() || cflData?.manager?.toUpperCase() || 'PRIYA SHARMA'}
                  </span>
                  <span className="text-[9.5px] font-semibold text-slate-400 block mt-0.5">
                    {probationDetail?.timeline?.[0]?.date || ((probationDetail?.isManagerSubmitted || probationDetail?.isConfirmed) ? '02 Sep 2026' : 'Pending')}
                  </span>
                </div>

                {/* Node 2: BU/Division Head Approval */}
                <div className="relative z-10 text-center flex flex-col items-center bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-sm ${
                    (probationDetail?.isManagerSubmitted || probationDetail?.isConfirmed) ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {(probationDetail?.isManagerSubmitted || probationDetail?.isConfirmed) ? '✓' : '•'}
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 font-grotesk mt-2.5 block">BU/Division Head Approval</span>
                  <span className={`text-[10px] font-extrabold block mt-0.5 ${(probationDetail?.isManagerSubmitted || probationDetail?.isConfirmed) ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                    {probationDetail?.timeline?.[1]?.name || 'VIKRAM REDDY'}
                  </span>
                  <span className="text-[9.5px] font-semibold text-slate-400 block mt-0.5">
                    {probationDetail?.timeline?.[1]?.date || ((probationDetail?.isManagerSubmitted || probationDetail?.isConfirmed) ? '05 Sep 2026' : 'Pending')}
                  </span>
                </div>

                {/* Node 3: HR Approval */}
                <div className="relative z-10 text-center flex flex-col items-center bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-sm ${
                    probationDetail?.isConfirmed ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {probationDetail?.isConfirmed ? '✓' : '•'}
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 font-grotesk mt-2.5 block">HR Approval</span>
                  <span className={`text-[10px] font-extrabold block mt-0.5 ${probationDetail?.isConfirmed ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                    {probationDetail?.timeline?.[2]?.name || 'MRIDUL MANGOLI'}
                  </span>
                  <span className="text-[9.5px] font-semibold text-slate-400 block mt-0.5">
                    {probationDetail?.timeline?.[2]?.date || (probationDetail?.isConfirmed ? '08 Sep 2026' : 'Pending')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 text-[10px] font-semibold text-slate-400 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span>Pending / In Progress</span>
                </div>
              </div>
            </div>

            {/* Employee Information Card */}
            <div className="bg-white rounded-2xl border border-[#EAE3E4] shadow-[0_4px_15px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="bg-[#78161A] text-white px-6 py-3 flex items-center gap-2">
                <span className="text-sm">👤</span>
                <h4 className="text-xs font-bold font-grotesk tracking-wide uppercase">Employee Information</h4>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
                <div>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">EMPLOYEE NAME</span>
                  <span className="text-xs font-bold text-slate-800 font-inter mt-1 block">{probationDetail?.employeeInfo?.name || cflData.cflName || currentName}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">EMPLOYEE CODE</span>
                  <span className="text-xs font-bold text-slate-800 font-inter mt-1 block">{probationDetail?.employeeInfo?.employeeCode || cflData.cflEmpCode || '9085126'}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">DESIGNATION</span>
                  <span className="text-xs font-bold text-slate-800 font-inter mt-1 block">{probationDetail?.employeeInfo?.designation || cflData.role || 'Java Developer'}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">LOCATION</span>
                  <span className="text-xs font-semibold text-slate-700 font-inter mt-1 block">{probationDetail?.employeeInfo?.location || cflData.location || 'Headquarters'}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">DEPARTMENT</span>
                  <span className="text-xs font-semibold text-slate-700 font-inter mt-1 block">{probationDetail?.employeeInfo?.department || cflData.department || 'SSD'}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">DATE OF JOINING</span>
                  <span className="text-xs font-semibold text-slate-700 font-inter mt-1 block">{probationDetail?.employeeInfo?.dateOfJoining || formatDate(cflData.dateOfJoining) || '01 Apr 2026'}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-slate-800 uppercase tracking-wider block">DATE OF CONFIRMATION</span>
                  <span className={`text-xs font-extrabold font-inter mt-1 block ${probationDetail?.isConfirmed ? 'text-slate-900' : 'text-amber-600'}`}>
                    {probationDetail?.employeeInfo?.dateOfConfirmation || (probationDetail?.isConfirmed ? '02 Sep 2026' : 'Pending Manager Confirmation')}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Callout Banner */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 text-xs text-[#1E40AF] font-medium flex items-start gap-3">
              <span className="font-bold text-sm leading-none mt-0.5">ℹ</span>
              <p className="leading-relaxed">
                To understand the progress of a new joiner, to support him/her during the initial probation period with necessary trainings & to evaluate his/her performance, probation evaluation is carried out on completion of the Third month from the Date of Joining (DOJ) while final employment confirmation is carried out on completion of the Sixth month from DOJ.
              </p>
            </div>

            {/* Section 1: Probation Evaluation: Third Month from DOJ */}
            <div className="bg-white rounded-2xl border border-[#EAE3E4] shadow-[0_4px_15px_rgba(0,0,0,0.02)] overflow-hidden space-y-4">
              <div className="bg-[#1B1418] text-white px-6 py-3.5">
                <h4 className="text-xs font-bold font-grotesk tracking-wide uppercase flex items-center gap-2">
                  <span>📋</span> Probation Evaluation: Third Month from DOJ
                </h4>
                <p className="text-[10.5px] text-slate-300 font-medium mt-0.5">
                  Rate the CFL's overall performance on the scale given below
                </p>
              </div>

              <div className="p-6 space-y-3">
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {(probationDetail?.thirdMonthEval?.criteriaRatings || [
                    { criteria: 'Performance Standard', rating: 'EXCELLENT' },
                    { criteria: 'Quality of Work', rating: 'EXCELLENT' },
                    { criteria: 'Subject Knowledge & Competence level', rating: 'EXCELLENT' },
                    { criteria: 'Initiative & willingness to take responsibilities', rating: 'EXCELLENT' },
                    { criteria: 'Attendance & Consistency in work', rating: 'EXCELLENT' },
                    { criteria: 'Team work & Cooperation', rating: 'EXCELLENT' },
                    { criteria: 'Organizing & time Management', rating: 'EXCELLENT' },
                    { criteria: 'Attitude towards Work', rating: 'EXCELLENT' },
                    { criteria: 'Well versed with Company Policies', rating: 'EXCELLENT' },
                    { criteria: "Thorough with Company's Code of Conduct", rating: 'EXCELLENT' }
                  ]).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-semibold text-slate-700">{item.criteria}</span>
                      <span className="bg-[#E6F4EA] text-[#137333] text-[10.5px] font-extrabold px-4 py-1.5 rounded-full uppercase">
                        {item.rating}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block font-grotesk">
                    ADDITIONAL REMARK(S) AND IMPROVEMENT PLAN (TRAINING) IF NEEDED
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-700">
                    {probationDetail?.thirdMonthEval?.additionalRemarks || 'Outstanding performance from month one — no improvement plan needed.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Employment Confirmation Evaluation */}
            <div className="bg-white rounded-2xl border border-[#EAE3E4] shadow-[0_4px_15px_rgba(0,0,0,0.02)] overflow-hidden space-y-4">
              <div className="bg-[#1B1418] text-white px-6 py-3.5">
                <h4 className="text-xs font-bold font-grotesk tracking-wide uppercase flex items-center gap-2">
                  <span>📌</span> Employment Confirmation Evaluation
                </h4>
                <p className="text-[10.5px] text-slate-300 font-medium mt-0.5">
                  Rate the CFL's overall performance on the scale given below, after 6 months from DOJ
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {(probationDetail?.sixthMonthEval?.criteriaRatings || [
                    { criteria: 'Performance Standard', rating: 'EXCELLENT' },
                    { criteria: 'Quality of Work', rating: 'EXCELLENT' },
                    { criteria: 'Subject Knowledge & Competence level', rating: 'EXCELLENT' },
                    { criteria: 'Initiative & willingness to take responsibilities', rating: 'EXCELLENT' },
                    { criteria: 'Attendance & Consistency in work', rating: 'EXCELLENT' },
                    { criteria: 'Team work & Cooperation', rating: 'EXCELLENT' },
                    { criteria: 'Organizing & time Management', rating: 'EXCELLENT' },
                    { criteria: 'Attitude towards Work', rating: 'EXCELLENT' },
                    { criteria: 'Well versed with Company Policies', rating: 'EXCELLENT' },
                    { criteria: "Thorough with Company's Code of Conduct", rating: 'EXCELLENT' }
                  ]).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-semibold text-slate-700">{item.criteria}</span>
                      <span className="bg-[#E6F4EA] text-[#137333] text-[10.5px] font-extrabold px-4 py-1.5 rounded-full uppercase">
                        {item.rating}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block font-grotesk">
                    PLEASE MENTION KEY ACHIEVEMENTS OR SCOPE FOR FURTHER IMPROVEMENTS
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-700">
                    {probationDetail?.sixthMonthEval?.keyAchievements || 'Led the platform migration, mentored two new joiners, and consistently exceeded delivery targets across all three review cycles.'}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block font-grotesk">
                    BASED ON THE PERFORMANCE OF THE EMPLOYEE, I RECOMMEND THE FOLLOWING:-
                  </label>
                  <div className="flex items-center gap-3">
                    {probationDetail?.isConfirmed ? (
                      <span className="bg-[#E6F4EA] text-[#137333] border border-[#A7F3D0] font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1">
                        Confirm ✓
                      </span>
                    ) : (
                      <span className="bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1">
                        Pending Manager Action
                      </span>
                    )}
                    <span className="bg-slate-50 text-slate-400 border border-slate-200 font-bold px-4 py-2 rounded-xl text-xs opacity-60">
                      Extended Probation
                    </span>
                    <span className="bg-slate-50 text-slate-400 border border-slate-200 font-bold px-4 py-2 rounded-xl text-xs opacity-60">
                      Termination Service
                    </span>
                  </div>
                </div>

                {/* Final Status Banner */}
                {probationDetail?.isConfirmed ? (
                  <div className="bg-[#E6F4EA] border border-[#A7F3D0] rounded-xl p-4 text-xs text-[#137333] font-bold flex items-center gap-2">
                    <span>✓</span>
                    <span>{probationDetail?.sixthMonthEval?.statusMessage || 'Confirmation fully approved. Employment Status updated to Confirm.'}</span>
                  </div>
                ) : probationDetail?.isManagerSubmitted ? (
                  <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4 text-xs text-[#B45309] font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>⏳</span>
                      <span>Probation evaluation approved by Manager & BU Head. Awaiting HR Approval.</span>
                    </div>
                    <button
                      onClick={handleHrApproveProbation}
                      className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Approve & Confirm</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4 text-xs text-[#B45309] font-bold flex items-center gap-2">
                    <span>⏳</span>
                    <span>Probation confirmation is currently pending Manager submission.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CFL FILES SUB-TAB (Matching User Attached Screenshot) */}
        {activeTab === 'cfl-files' && (
          <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-6 text-left font-inter">
            {/* Sub-tab Header */}
            <div className="flex justify-between items-center pb-2 border-b border-[#EAE3E4]">
              <h3 className="text-base font-bold text-slate-800 font-grotesk">
                CFL Files
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">
                View and download {currentName}'s uploaded documents
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-grotesk">
                    <th className="py-3 px-4">DOCUMENT NAME</th>
                    <th className="py-3 px-4">CATEGORY</th>
                    <th className="py-3 px-4">UPLOADED ON</th>
                    <th className="py-3 px-4">TYPE</th>
                    <th className="py-3 px-4">SIZE</th>
                    <th className="py-3 px-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cflDocuments && cflDocuments.length > 0 ? (
                    cflDocuments.map((doc, idx) => {
                      const category = doc.documentType || 'Document';
                      const ext = doc.fileName?.split('.').pop()?.toUpperCase() || 'FILE';
                      const sizeStr = doc.fileSize 
                        ? (doc.fileSize > 1024 * 1024 
                            ? (doc.fileSize / (1024 * 1024)).toFixed(1) + ' MB'
                            : (doc.fileSize / 1024).toFixed(0) + ' KB')
                        : '250 KB';
                      const uploadDate = doc.uploadedAt 
                        ? new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '15 Nov 2024';

                      // Badge category styles matching mockup (Certificate: Pink, Resume: Green, Logbook: Amber)
                      let categoryBadgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
                      if (category.toLowerCase().includes('certif')) {
                        categoryBadgeStyle = 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]';
                      } else if (category.toLowerCase().includes('resume') || category.toLowerCase().includes('cv')) {
                        categoryBadgeStyle = 'bg-[#D1FAE5] text-[#065F46] border-[#6EE7B7]';
                      } else if (category.toLowerCase().includes('logbook') || category.toLowerCase().includes('form')) {
                        categoryBadgeStyle = 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
                      }

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 font-semibold text-xs text-slate-800 flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs">
                              📄
                            </span>
                            <span>{doc.fileName}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-[10.5px] font-extrabold px-3 py-1 rounded-full border uppercase ${categoryBadgeStyle}`}>
                              {category}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs font-medium text-slate-500">
                            {uploadDate}
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-slate-700">
                            {ext}
                          </td>
                          <td className="py-4 px-4 text-xs font-semibold text-slate-500">
                            {sizeStr}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewDocument(doc.id)}
                                title="View Document"
                                className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-600 hover:text-slate-900 inline-flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                              >
                                👁
                              </button>
                              <button
                                onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                                title="Download Document"
                                className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-600 hover:text-slate-900 inline-flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                              >
                                ⤓
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-xs font-medium text-slate-400">
                        No documents uploaded for {currentName} yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROLE MOVEMENT SUB-TAB */}
        {activeTab === 'role-movement' && (
          <div className="space-y-6 text-left animate-fade-in font-inter">
            {/* Top Status Banner & Edit Action */}
            {roleMovement.isSaved && !isEditingRoleMovement ? (
              <div className="bg-[#E6F4EA] border border-[#CEECD3] px-5 py-3.5 rounded-xl text-[#137333] font-bold text-xs flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#137333] text-white flex items-center justify-center text-[10px] font-extrabold">✓</span>
                  <span>Last saved on {roleMovement.lastSavedDate || '20 Jul 2026'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingRoleMovement(true)}
                  className="bg-white hover:bg-slate-50 text-[#137333] border border-[#CEECD3] px-4 py-2 rounded-lg text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>✏️</span>
                  <span>Edit Record</span>
                </button>
              </div>
            ) : roleMovement.isSaved && isEditingRoleMovement ? (
              <div className="bg-amber-50 border border-amber-200 px-5 py-3.5 rounded-xl text-amber-800 font-bold text-xs flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">✏️</span>
                  <span>Editing saved record for {currentName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingRoleMovement(false)}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel Edit
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl text-slate-600 font-semibold text-xs flex items-center gap-2.5 shadow-sm">
                <span className="text-sm">ℹ️</span>
                <span>No role movement record saved yet for {currentName}. Fill out the fields below and click <strong>Save</strong>.</span>
              </div>
            )}

            {/* Internal Lateral Movement Form Box */}
            <div className="rounded-2xl overflow-hidden border border-[#EAE3E4] bg-white shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
              {/* Maroon Header Banner */}
              <div className="bg-[#78161A] text-white p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold font-grotesk">
                    <span>🔀</span>
                    <span>Internal Lateral Movement</span>
                  </div>
                  <p className="text-[11.5px] text-rose-100 font-medium">
                    Plan {currentName}'s potential role movement and skill development path
                  </p>
                </div>

                {roleMovement.isSaved && !isEditingRoleMovement && (
                  <button
                    type="button"
                    onClick={() => setIsEditingRoleMovement(true)}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>✏️</span>
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-6">
                {/* Existing Role Display */}
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    EXISTING ROLE
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-800 mt-1 font-grotesk">
                    {roleMovement.existingRole || cflData.role || 'CFL Employee'}
                  </h4>
                </div>

                {/* Possible Roles Grid */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    POSSIBLE ROLES
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* Formal Role Selection */}
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1.5">
                        FORMAL ROLE
                      </label>
                      <select
                        disabled={roleMovement.isSaved && !isEditingRoleMovement}
                        value={roleMovement.formalRole || ''}
                        onChange={(e) => setRoleMovement({ ...roleMovement, formalRole: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#78161A] transition-all disabled:bg-slate-50 disabled:text-slate-600"
                      >
                        <option value="">Select Formal Role</option>
                        {formalRoleOptions.map((opt, idx) => (
                          <option key={idx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Current Skills Tags */}
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1.5">
                        CURRENT SKILLS
                      </label>
                      {roleMovement.isSaved && !isEditingRoleMovement ? (
                        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex flex-wrap gap-2 min-h-[42px] items-center">
                          {roleMovement.currentSkills ? (
                            roleMovement.currentSkills.split(',').map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="bg-[#FFF0F0] text-[#78161A] border border-[#FFE0E0] text-[10.5px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"
                              >
                                {skill.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No skills listed</span>
                          )}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={roleMovement.currentSkills || ''}
                          onChange={(e) => setRoleMovement({ ...roleMovement, currentSkills: e.target.value })}
                          placeholder="e.g. AWS, Docker, Kubernetes, CI/CD"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#78161A] transition-all"
                        />
                      )}
                    </div>

                    {/* Skills Gap For Formal Role */}
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1.5">
                        SKILLS GAP FOR FORMAL ROLE
                      </label>
                      <textarea
                        disabled={roleMovement.isSaved && !isEditingRoleMovement}
                        rows="2"
                        value={roleMovement.skillsGap || ''}
                        onChange={(e) => setRoleMovement({ ...roleMovement, skillsGap: e.target.value })}
                        placeholder="Enter skills gap details..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 outline-none focus:border-[#78161A] transition-all resize-none disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Dropdowns Row: Movement & Backup */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                      POSSIBLE ROLE MOVEMENT IN 2-3 YRS
                    </label>
                    <select
                      disabled={roleMovement.isSaved && !isEditingRoleMovement}
                      value={roleMovement.possibleMovement || 'Select'}
                      onChange={(e) => setRoleMovement({ ...roleMovement, possibleMovement: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#78161A] transition-all disabled:bg-slate-50 disabled:text-slate-600"
                    >
                      {movementOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                      CAN THE RESOURCE BE A BACKUP FOR ANYONE IN THE TEAM?
                    </label>
                    <select
                      disabled={roleMovement.isSaved && !isEditingRoleMovement}
                      value={roleMovement.canBeBackup === true ? 'Yes' : roleMovement.canBeBackup === false ? 'No' : 'Select'}
                      onChange={(e) => setRoleMovement({ ...roleMovement, canBeBackup: e.target.value === 'Yes' ? true : e.target.value === 'No' ? false : null })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#78161A] transition-all disabled:bg-slate-50 disabled:text-slate-600"
                    >
                      <option value="Select">Select Choice</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Backup Resource Card */}
            <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-4">
              <div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                  CAN HE/SHE BE A BACK-UP?
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={roleMovement.isSaved && !isEditingRoleMovement}
                    onClick={() => setRoleMovement({ ...roleMovement, canBeBackup: true })}
                    className={`px-8 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                      roleMovement.canBeBackup === true
                        ? 'bg-[#137333] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } disabled:opacity-80`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    disabled={roleMovement.isSaved && !isEditingRoleMovement}
                    onClick={() => setRoleMovement({ ...roleMovement, canBeBackup: false })}
                    className={`px-8 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                      roleMovement.canBeBackup === false
                        ? 'bg-[#78161A] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } disabled:opacity-80`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                  MENTION NAME OF EMPLOYEE FOR WHOM HE/SHE CAN BE A BACK-UP
                </label>
                <input
                  type="text"
                  disabled={roleMovement.isSaved && !isEditingRoleMovement}
                  value={roleMovement.backupForEmpName || ''}
                  onChange={(e) => setRoleMovement({ ...roleMovement, backupForEmpName: e.target.value })}
                  placeholder="e.g. Ankit Chauhan"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#78161A] transition-all disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>
            </div>

            {/* Project Movement Card */}
            <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-4">
              <h4 className="text-xs font-extrabold text-[#78161A] uppercase tracking-wider text-center font-grotesk">
                PROJECT MOVEMENT
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1.5">
                    PROJECT 1
                  </label>
                  <input
                    type="text"
                    disabled={roleMovement.isSaved && !isEditingRoleMovement}
                    value={roleMovement.project1 || ''}
                    onChange={(e) => setRoleMovement({ ...roleMovement, project1: e.target.value })}
                    placeholder="Enter project 1"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#78161A] transition-all disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1.5">
                    PROJECT 2
                  </label>
                  <input
                    type="text"
                    disabled={roleMovement.isSaved && !isEditingRoleMovement}
                    value={roleMovement.project2 || ''}
                    onChange={(e) => setRoleMovement({ ...roleMovement, project2: e.target.value })}
                    placeholder="Enter project 2"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#78161A] transition-all disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1.5">
                    PROJECT 3
                  </label>
                  <input
                    type="text"
                    disabled={roleMovement.isSaved && !isEditingRoleMovement}
                    value={roleMovement.project3 || ''}
                    onChange={(e) => setRoleMovement({ ...roleMovement, project3: e.target.value })}
                    placeholder="Enter project 3"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#78161A] transition-all disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save / Edit Action Button */}
            {(!roleMovement.isSaved || isEditingRoleMovement) && (
              <div className="pt-2 text-center flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveRoleMovement}
                  disabled={savingRoleMovement}
                  className="bg-[#78161A] hover:bg-[#631013] active:scale-95 text-white px-10 py-3 rounded-xl font-bold text-xs shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>💾</span>
                  <span>{savingRoleMovement ? 'Saving...' : roleMovement.isSaved ? 'Update Record' : 'Save'}</span>
                </button>
                
                {roleMovement.isSaved && (
                  <button
                    type="button"
                    onClick={() => setIsEditingRoleMovement(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* CHANGE HISTORY SUB-TAB */}
        {activeTab === 'change-history' && (
          <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-4 text-left">
            <h3 className="text-[16px] font-bold text-[#78161A] font-grotesk pb-2 border-b border-[#EAE3E4]">
              Profile Change Audit History
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#EAE3E4]">
                    <th className="p-3 font-bold text-slate-600">DATE & TIME</th>
                    <th className="p-3 font-bold text-slate-600">UPDATED FIELD</th>
                    <th className="p-3 font-bold text-slate-600">OLD VALUE</th>
                    <th className="p-3 font-bold text-slate-600">NEW VALUE</th>
                    <th className="p-3 font-bold text-slate-600">MODIFIED BY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">02 Sep 2026, 09:30 AM</td>
                    <td className="p-3 font-bold text-[#78161A]">Mentor Assignment</td>
                    <td className="p-3 text-slate-400">Unassigned</td>
                    <td className="p-3 font-semibold text-slate-800">Rohit Verma</td>
                    <td className="p-3 font-semibold text-slate-600">HR Admin</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">01 Sep 2026, 04:15 PM</td>
                    <td className="p-3 font-bold text-[#78161A]">Scholastics Info</td>
                    <td className="p-3 text-slate-400">—</td>
                    <td className="p-3 font-semibold text-slate-800">SSC 88.5%, HSC 85.0%</td>
                    <td className="p-3 font-semibold text-slate-600">System Sync</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* HR Goal Tracking Modal */}
      {showGoalTrackerModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 font-grotesk flex items-center gap-2">
                  <span>🎯</span>
                  <span>{trackerStageTitle} — Goal Tracker</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium font-inter mt-0.5">
                  Viewing goals created and submitted by {cflData?.cflName || cflData?.name || 'Shalini'} for this review cycle.
                </p>
              </div>
              <button
                onClick={() => setShowGoalTrackerModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {loadingGoals ? (
              <div className="p-8 text-center text-xs font-bold text-slate-500 font-inter">
                Loading goals...
              </div>
            ) : stageGoals.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center space-y-1">
                <p className="text-xs font-bold text-slate-600 font-inter">No goals added yet by the CFL.</p>
                <p className="text-[11px] text-slate-400 font-medium font-inter">
                  Goal setting is enabled. Once {cflData?.cflName || 'CFL'} adds goals in their portal, they will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider font-inter border-b border-slate-200">
                      <th className="p-3">#</th>
                      <th className="p-3">Goal Title</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Weightage</th>
                      <th className="p-3">Target Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700 font-inter">
                    {stageGoals.map((g, idx) => (
                      <tr key={g.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-800">{g.title}</td>
                        <td className="p-3 text-slate-600 max-w-xs truncate">{g.description || '—'}</td>
                        <td className="p-3 font-bold text-[#78161A]">{g.weightage}%</td>
                        <td className="p-3 text-slate-600">{g.targetDate || '30 Apr 2026'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            g.status === 'SUBMITTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {g.status || 'DRAFT'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowGoalTrackerModal(false)}
                className="px-5 py-2 bg-[#78161A] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#631013] transition-all cursor-pointer"
              >
                Close Tracker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CflProfileOverview;
