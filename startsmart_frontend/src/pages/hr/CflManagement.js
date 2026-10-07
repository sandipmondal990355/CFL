import React, { useState, useEffect } from 'react';
import { cflAssignmentService } from '../../services/cflAssignmentService';
import { goalService } from '../../services/goalService';
import { 
  FaSearch, 
  FaSlidersH, 
  FaFileExport, 
  FaPlus, 
  FaTimes,
  FaUpload
} from 'react-icons/fa';
import Button from '../../components/atoms/Button';
import AddCflForm from './AddCflForm';

const CflManagement = ({ openModalInitially, onCloseModalInitially, onSelectCfl }) => {
  // Cohort datasets from backend API
  const [cflList, setCflList] = useState([]);
  const [workflowsList, setWorkflowsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic dropdown lists for managers and mentors
  const [managersList, setManagersList] = useState([]);
  const [mentorsList, setMentorsList] = useState([]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5;

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBU, setSelectedBU] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedManager, setSelectedManager] = useState('All');
  const [selectedMentor, setSelectedMentor] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Avatar background style colors
  const getAvatarColor = (name) => {
    if (!name) return 'bg-[#E06A3C]';
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-[#E06A3C]', // Orange
      'bg-[#3B82F6]', // Blue
      'bg-[#10B981]', // Green
      'bg-[#F59E0B]', // Amber
      'bg-[#E11D48]', // Rose
      'bg-[#7C3AED]', // Violet
    ];
    return colors[sum % colors.length];
  };

  // Status Badge styles mapping
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Probation':
        return 'bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74]';
      case 'Confirm':
      case 'Completed':
      case '✓ Confirmed':
        return 'bg-[#E6F6EE] text-[#1E8E5A] border border-[#A7F3D0]';
      case 'Pending Manager Approval':
        return 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]';
      case 'Draft':
        return 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]';
      case 'Not Started':
      case 'Awaiting Final Review':
      default:
        return 'bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0]';
    }
  };

  // Compute CFL progress cycles metrics dynamically from backend workflows
  const getCflMetrics = (cfl) => {
    const code = parseInt(cfl.employeeCode) || cfl.cflEmpCode;
    const progress = cfl.goalProgress !== undefined && cfl.goalProgress !== null ? cfl.goalProgress : 0;
    const status = cfl.status;

    let employmentStatus = status === 'On Track' ? 'Probation' : (status || 'Probation');

    const getStageStatus = (stagePrefix) => {
      // Find matching workflow for this CFL and stage
      const matchingWf = workflowsList.find(w => 
        String(w.cflEmpId) === String(code) && 
        (
          (w.stageCode && w.stageCode.toUpperCase().includes(stagePrefix)) ||
          (w.stageName && w.stageName.toUpperCase().includes(stagePrefix)) ||
          (stagePrefix === '30' && (w.stageId === 1 || (w.stageCode && w.stageCode.includes('G30')))) ||
          (stagePrefix === '60' && (w.stageId === 2 || (w.stageCode && w.stageCode.includes('G60')))) ||
          (stagePrefix === '90' && (w.stageId === 3 || (w.stageCode && w.stageCode.includes('G90')))) ||
          (stagePrefix === 'FINAL' && (w.stageId === 4 || (w.stageCode && w.stageCode.includes('G100'))))
        )
      );

      if (!matchingWf) return 'Not Started';

      const wfStatus = matchingWf.status ? matchingWf.status.toUpperCase() : '';
      if (['CYCLE_COMPLETED', 'COMPLETED', 'APPROVED', 'CONFIRMED', 'SATISFIED'].includes(wfStatus)) {
        return 'Completed';
      }
      if (['GOALS_SUBMITTED', 'SELF_REVIEW_COMPLETED', 'PENDING_APPROVAL'].includes(wfStatus)) {
        return 'Pending Manager Approval';
      }
      if (['GOAL_ENABLED', 'MEETING_SCHEDULED', 'REVISION_REQUESTED', 'DRAFT'].includes(wfStatus)) {
        return 'Draft';
      }
      return 'Not Started';
    };

    const thirtyDays = getStageStatus('30');
    const sixtyDays = getStageStatus('60');
    const ninetyDays = getStageStatus('90');
    const finalReview = getStageStatus('FINAL');

    return {
      employmentStatus,
      thirtyDays,
      sixtyDays,
      ninetyDays,
      finalReview
    };
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBU('All');
    setSelectedRole('All');
    setSelectedManager('All');
    setSelectedMentor('All');
    setSelectedStatus('All');
  };

  const hasActiveFilters = searchQuery !== '' ||
                           selectedBU !== 'All' ||
                           selectedRole !== 'All' ||
                           selectedManager !== 'All' ||
                           selectedMentor !== 'All' ||
                           selectedStatus !== 'All';

  // Control view toggle: true shows "Add New CFL" form, false shows table list
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    cflEmpCode: '',
    department: 'SSD',
    role: 'Java Developer', // Designation
    subDepartment: '',
    dateOfJoining: '',
    project: '',
    projectClassification: '',
    buHead: '',
    location: '',
    gender: 'Male',
    vertical: '',
    contactNumber: '',
    subArea: '',
    category: '',
    ssc: '',
    hsc: '',
    ug: '',
    pg: '',
    instituteName: '',
    instituteBranch: '',
    primaryTechSkills: '',
    primaryNonTechSkills: '',
    bio: '',
    hrEmpCode: '1001',
    managerCode: '2001',
    customManagerName: '',
    customManagerCode: '',
    customManagerEmail: '',
    mentorCode: '3001',
    customMentorName: '',
    customMentorCode: '',
    customMentorEmail: '',
    goalProgress: 0,
    status: 'On Track'
  });

  // Load managers & mentors lists from backend
  const loadDropdownData = async () => {
    try {
      const [mgrs, ments] = await Promise.all([
        cflAssignmentService.getManagers(),
        cflAssignmentService.getMentors()
      ]);
      setManagersList(mgrs || []);
      setMentorsList(ments || []);
    } catch (err) {
      console.error('Failed to load managers/mentors:', err);
    }
  };

  // Initial load on mount
  useEffect(() => {
    loadDropdownData();
  }, []);

  // Reset page to 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, selectedBU, selectedRole, selectedManager, selectedMentor, selectedStatus]);

  // Fetch CFL Assignments from backend endpoint
  useEffect(() => {
    let active = true;

    const fetchCflAssignments = async () => {
      try {
        setLoading(true);
        const [data, workflows] = await Promise.all([
          cflAssignmentService.getAll({
            search: searchQuery,
            businessUnit: selectedBU,
            department: selectedRole !== 'All' ? selectedRole : undefined,
            manager: selectedManager,
            mentor: selectedMentor,
            status: selectedStatus,
            page: page,
            size: pageSize
          }),
          goalService.getWorkflows().catch(err => {
            console.warn('Failed to fetch workflows from backend:', err);
            return [];
          })
        ]);

        if (active) {
          setWorkflowsList(workflows || []);
          const formatted = (data.content || []).map(item => ({
            id: item.id,
            employeeCode: String(item.cflEmpCode),
            name: item.cflName,
            email: item.cflEmail,
            role: item.role,
            department: item.department,
            manager: item.managerName,
            mentor: item.mentorName,
            goalProgress: item.goalProgress,
            status: item.status,
            businessUnit: item.businessUnit,
            managerEmpCode: item.managerEmpCode,
            mentorEmpCode: item.mentorEmpCode,
            hrEmpCode: item.hrEmpCode
          }));
          setCflList(formatted);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error('Error fetching CFL assignments:', err);
          setError('Could not connect to StartSmart server backend.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCflAssignments();

    return () => {
      active = false;
    };
  }, [searchQuery, selectedBU, selectedRole, selectedManager, selectedMentor, selectedStatus, page]);

  // Modal Sync Prop (maps to in-page form view instead of popup)
  useEffect(() => {
    if (openModalInitially) {
      setShowAddForm(true);
    }
  }, [openModalInitially]);

  const handleCloseForm = () => {
    setShowAddForm(false);
    if (onCloseModalInitially) {
      onCloseModalInitially();
    }
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      cflEmpCode: '',
      department: 'SSD',
      role: 'Java Developer',
      subDepartment: '',
      dateOfJoining: '',
      project: '',
      projectClassification: '',
      buHead: '',
      location: '',
      gender: 'Male',
      vertical: '',
      contactNumber: '',
      subArea: '',
      category: '',
      ssc: '',
      hsc: '',
      ug: '',
      pg: '',
      instituteName: '',
      instituteBranch: '',
      primaryTechSkills: '',
      primaryNonTechSkills: '',
      bio: '',
      hrEmpCode: '1001',
      managerCode: '2001',
      customManagerName: '',
      customManagerCode: '',
      customManagerEmail: '',
      mentorCode: '3001',
      customMentorName: '',
      customMentorCode: '',
      customMentorEmail: '',
      goalProgress: 0,
      status: 'On Track'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    let managerEmpCode = parseInt(formData.managerCode);
    let managerName = '';
    let managerEmail = '';

    if (formData.managerCode === 'custom') {
      managerEmpCode = parseInt(formData.customManagerCode);
      managerName = formData.customManagerName;
      managerEmail = formData.customManagerEmail;
    } else {
      const selected = managersList.find(m => m.empCode === managerEmpCode);
      if (selected) {
        managerName = selected.name;
        managerEmail = selected.email;
      }
    }

    let mentorEmpCode = parseInt(formData.mentorCode);
    let mentorName = '';
    let mentorEmail = '';

    if (formData.mentorCode === 'custom') {
      mentorEmpCode = parseInt(formData.customMentorCode);
      mentorName = formData.customMentorName;
      mentorEmail = formData.customMentorEmail;
    } else {
      const selected = mentorsList.find(m => m.empCode === mentorEmpCode);
      if (selected) {
        mentorName = selected.name;
        mentorEmail = selected.email;
      }
    }

    const fullName = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ');
    const techSkillsArray = formData.primaryTechSkills ? formData.primaryTechSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
    const nonTechSkillsArray = formData.primaryNonTechSkills ? formData.primaryNonTechSkills.split(',').map(s => s.trim()).filter(Boolean) : [];

    const payload = {
      cflEmpCode: parseInt(formData.cflEmpCode),
      cflName: fullName,
      cflEmail: formData.email,
      role: formData.role,
      department: formData.department,
      businessUnit: formData.department,
      hrEmpCode: parseInt(formData.hrEmpCode) || 1001,
      managerEmpCode,
      managerName,
      managerEmail,
      mentorEmpCode,
      mentorName,
      mentorEmail,
      effectiveFrom: formData.dateOfJoining || new Date().toISOString().split('T')[0],
      status: formData.status,
      goalProgress: parseInt(formData.goalProgress) || 0,
      
      // Extended fields
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      designation: formData.role,
      subDepartment: formData.subDepartment,
      dateOfJoining: formData.dateOfJoining || null,
      project: formData.project,
      projectClassification: formData.projectClassification,
      buHead: formData.buHead,
      location: formData.location,
      gender: formData.gender,
      vertical: formData.vertical,
      contactNumber: formData.contactNumber,
      subArea: formData.subArea,
      category: formData.category,
      sscPercentage: formData.ssc,
      hscPercentage: formData.hsc,
      ugPercentage: formData.ug,
      pgPercentage: formData.pg,
      instituteName: formData.instituteName,
      instituteBranch: formData.instituteBranch,
      primaryTechSkills: techSkillsArray,
      primaryNonTechSkills: nonTechSkillsArray,
      bio: formData.bio
    };

    try {
      // 1. Onboard complete CFL details to PostgreSQL database
      await cflAssignmentService.onboard(payload);

      // reload managers & mentors in case new custom manager/mentor was registered
      await loadDropdownData();
      
      // reset page to 0 and trigger reload
      setPage(0);
      handleCloseForm();
      if (page === 0) {
        setPage(null);
        setTimeout(() => setPage(0), 10);
      }
    } catch (err) {
      console.error('Error onboarding CFL:', err);
      alert('Failed to register CFL. Please verify fields and check backend server.');
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

  const startOnboardingClick = () => {
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6 animate-fade-in duration-300">
      {/* Directory Content Header */}
      <div className="flex justify-between items-start pb-2">
        <div>
          <h3 className="font-bold text-[#1B1418] text-2xl tracking-tight font-grotesk">
            My CFLs
          </h3>
          <p className="text-[13px] text-slate-500 mt-1 font-medium font-inter">
            Complete tracking of every CFL's employment status and review cycle progress.
          </p>
        </div>
        
        {/* Actions panel */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px] font-black uppercase tracking-wider font-inter">
              YEAR
            </span>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-white border border-[#EAE3E4] rounded-lg px-4 py-2 pr-9 text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#78161A]/10 focus:border-[#78161A] cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>

          {!showAddForm && (
            <>
              <button
                onClick={startOnboardingClick}
                className="bg-[#78161A] hover:bg-[#631013] active:scale-95 transition-all text-white text-[12px] font-bold px-4 py-[9.5px] rounded-lg flex items-center gap-1.5 shadow-md font-inter"
              >
                <FaPlus className="text-[10px]" />
                <span>Add New CFL</span>
              </button>

              <button
                onClick={() => alert('Bulk upload trigger')}
                className="bg-white hover:bg-slate-50 border border-[#78161A] text-[#78161A] text-[12px] font-bold px-4 py-[9.5px] rounded-lg flex items-center gap-1.5 shadow-sm font-inter transition-all"
              >
                <FaUpload className="text-[11px]" />
                <span>Bulk Upload</span>
              </button>
            </>
          )}

          <button
            onClick={() => alert('Data exported!')}
            className="bg-white hover:bg-slate-50 border border-[#78161A] text-[#78161A] text-[12px] font-bold px-4 py-[9.5px] rounded-lg flex items-center gap-1.5 shadow-sm font-inter transition-all"
          >
            <FaFileExport className="text-[11px]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {!showAddForm ? (
        /* Main Filter & List Container Card */
        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex flex-col gap-6">
          {/* Search bar */}
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <FaSearch className="text-[13px]" />
            </span>
            <input
              type="text"
              placeholder="Search by CFL name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#EAE3E4] pl-10 pr-4 py-3 rounded-xl text-slate-700 placeholder-slate-400 text-[13.5px] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#78161A]/10 focus:border-[#78161A] font-inter font-semibold"
            />
          </div>

          {/* Labeled dropdown filters */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            {/* BUSINESS UNIT */}
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-inter">
                BUSINESS UNIT
              </span>
              <div className="relative">
                <select
                  value={selectedBU}
                  onChange={(e) => setSelectedBU(e.target.value)}
                  className="appearance-none bg-white border border-[#EAE3E4] rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none w-full"
                >
                  <option value="All">Select All</option>
                  <option value="SSD">SSD</option>
                  <option value="Digital">Digital</option>
                  <option value="Cloud">Cloud</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            {/* ROLE */}
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-inter">
                ROLE
              </span>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="appearance-none bg-white border border-[#EAE3E4] rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none w-full"
                >
                  <option value="All">Select All</option>
                  <option value="Java Developer">Java Developer</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="QA Engineer">QA Engineer</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            {/* MANAGER */}
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-inter">
                MANAGER
              </span>
              <div className="relative">
                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="appearance-none bg-white border border-[#EAE3E4] rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none w-full"
                >
                  <option value="All">Select All</option>
                  {managersList.map(m => (
                    <option key={m.empCode} value={m.name}>{m.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            {/* MENTOR */}
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-inter">
                MENTOR
              </span>
              <div className="relative">
                <select
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="appearance-none bg-white border border-[#EAE3E4] rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none w-full"
                >
                  <option value="All">Select All</option>
                  {mentorsList.map(m => (
                    <option key={m.empCode} value={m.name}>{m.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            {/* STATUS */}
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-inter">
                EMPLOYMENT STATUS
              </span>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none bg-white border border-[#EAE3E4] rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none w-full"
                >
                  <option value="All">Select All</option>
                  <option value="On Track">On Track</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="At Risk">At Risk</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex flex-col pt-[18px]">
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-[#78161A] hover:text-[#631013] transition-all flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EAE3E4] hover:bg-slate-50 shadow-sm font-inter"
                >
                  <FaTimes className="w-2.5 h-2.5" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto w-full pt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100 min-w-[200px]">
                  CFL
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100 min-w-[150px]">
                  MANAGER
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100 min-w-[150px]">
                  MENTOR
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100 min-w-[160px]">
                  EMPLOYMENT STATUS
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100 min-w-[120px]">
                  THIRTY DAYS
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100 min-w-[120px]">
                  SIXTY DAYS
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100 min-w-[120px]">
                  NINETY DAYS
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100 min-w-[120px]">
                  FINAL REVIEW
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-sm text-slate-400 font-medium font-inter animate-pulse">
                    Loading CFL assignments...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-sm text-rose-500 font-bold font-inter">
                    {error}
                  </td>
                </tr>
              ) : cflList.length > 0 ? (
                cflList.map((cfl) => {
                  const metrics = getCflMetrics(cfl);
                  return (
                    <tr 
                      key={cfl.id || cfl.employeeCode} 
                      onClick={() => onSelectCfl && onSelectCfl(cfl)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100/60"
                    >
                      {/* CFL Name & Avatar */}
                      <td className="py-4 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(cfl.name)} text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm flex-shrink-0 font-inter`}>
                          {getInitials(cfl.name)}
                        </div>
                        <span className="text-[13.5px] font-bold text-slate-800 font-inter leading-none">
                          {cfl.name}
                        </span>
                      </td>

                      {/* MANAGER */}
                      <td className="py-4 text-[13.5px] font-medium text-slate-600 font-inter">
                        {cfl.manager || 'Unassigned'}
                      </td>

                      {/* MENTOR */}
                      <td className="py-4 text-[13.5px] font-medium text-slate-600 font-inter">
                        {cfl.mentor || 'Unassigned'}
                      </td>

                      {/* Employment Status Badge */}
                      <td className="py-4">
                        <span className={`inline-flex items-center px-4 py-1.25 rounded-full text-[11px] font-bold ${getBadgeStyle(metrics.employmentStatus)}`}>
                          {metrics.employmentStatus}
                        </span>
                      </td>

                      {/* Thirty Days */}
                      <td className="py-4">
                        <span className={`inline-flex items-center px-3.5 py-1.25 rounded-full text-[11px] font-bold ${getBadgeStyle(metrics.thirtyDays)}`}>
                          {metrics.thirtyDays}
                        </span>
                      </td>

                      {/* Sixty Days */}
                      <td className="py-4">
                        <span className={`inline-flex items-center px-3.5 py-1.25 rounded-full text-[11px] font-bold ${getBadgeStyle(metrics.sixtyDays)}`}>
                          {metrics.sixtyDays}
                        </span>
                      </td>

                      {/* Ninety Days */}
                      <td className="py-4">
                        <span className={`inline-flex items-center px-3.5 py-1.25 rounded-full text-[11px] font-bold ${getBadgeStyle(metrics.ninetyDays)}`}>
                          {metrics.ninetyDays}
                        </span>
                      </td>

                      {/* Final Review */}
                      <td className="py-4">
                        <span className={`inline-flex items-center px-3.5 py-1.25 rounded-full text-[11px] font-bold ${getBadgeStyle(metrics.finalReview)}`}>
                          {metrics.finalReview}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-sm text-slate-400 font-medium font-inter">
                    No CFL matches your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-between items-center bg-white border border-[#EAE3E4] rounded-2xl p-4 shadow-sm font-inter mt-4">
            <div className="text-[12px] font-semibold text-slate-500">
              Showing Page {page + 1} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-[#EAE3E4] rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    page === i 
                      ? 'bg-[#78161A] text-white shadow-sm'
                      : 'bg-white border border-[#EAE3E4] text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-[#EAE3E4] rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      ) : (
        <AddCflForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleFormSubmit={handleFormSubmit}
          handleCloseForm={handleCloseForm}
          managersList={managersList}
          mentorsList={mentorsList}
        />
      )}
    </div>
  );
};

export default CflManagement;
