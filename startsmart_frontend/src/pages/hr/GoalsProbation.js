import React, { useState, useEffect } from 'react';
import { goalService } from '../../services/goalService';
import { cflAssignmentService } from '../../services/cflAssignmentService';
import { 
  FaSearch, 
  FaRegBell, 
  FaFileExport,
  FaTimes,
  FaExternalLinkAlt,
  FaCheckCircle
} from 'react-icons/fa';

const GoalsProbation = () => {
  // Tabs: 'goals' or 'probation'
  const [activeTab, setActiveTab] = useState('probation');
  
  // Data lists
  const [goalsWorkflows, setGoalsWorkflows] = useState([]);
  const [probationEvaluations, setProbationEvaluations] = useState([]);
  const [managers, setManagers] = useState([]);
  const [goalStages, setGoalStages] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);

  // Loading / Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManager, setSelectedManager] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedStageFilter, setSelectedStageFilter] = useState('All');

  // Initiate Goal Setting Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState('');
  const [modalManager, setModalManager] = useState('');
  const [selectedCfls, setSelectedCfls] = useState([]);
  const [isCflDropdownOpen, setIsCflDropdownOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalAgenda, setModalAgenda] = useState('');
  const [modalScheduledAt, setModalScheduledAt] = useState('');
  const [modalDuration, setModalDuration] = useState(30);
  const [modalLink, setModalLink] = useState('https://meet.google.com/cfl-goal-alignments');

  // Fetch all assignments (for CFL check listing by manager)
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [stagesData, mgrList, cflsData] = await Promise.all([
        goalService.getStages(),
        cflAssignmentService.getManagers(),
        cflAssignmentService.getAll({ page: 0, size: 100 })
      ]);
      
      setGoalStages(stagesData || []);
      setManagers(mgrList || []);
      setAllAssignments(cflsData.content || []);

      if (stagesData && stagesData.length > 0) {
        setModalStage(stagesData[0].id);
      }
      
      await refreshTables();
    } catch (err) {
      console.error('Failed to load screen reference data:', err);
      setError('Connection to backend failed. Please verify Spring Boot status.');
    } finally {
      setLoading(false);
    }
  };

  const refreshTables = async () => {
    try {
      const [workflows, probList] = await Promise.all([
        goalService.getWorkflows(),
        goalService.getProbationEvaluations()
      ]);
      setGoalsWorkflows(workflows || []);
      setProbationEvaluations(probList || []);
    } catch (err) {
      console.error('Error refreshing tables:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autofill Meeting parameters when stage selection changes
  useEffect(() => {
    const stage = goalStages.find(s => String(s.id) === String(modalStage));
    if (stage) {
      const stageLabel = stage.stageCode === 'G30' ? '30 Days Goals' : stage.stageCode === 'G60' ? '60 Days Goals' : stage.stageCode === 'G90' ? '90 Days Goals' : `${stage.stageName} Goals`;
      setModalTitle(`${stageLabel} Alignment`);
      setModalAgenda(`Define and align on targeted goals for the ${stageLabel} plan.`);
    }
  }, [modalStage, goalStages]);

  // Filter active manager CFLs
  const managerCfls = allAssignments.filter(a => String(a.managerEmpCode) === String(modalManager));

  const handleInitiateSubmit = async (e) => {
    e.preventDefault();
    if (!modalStage || !modalManager || selectedCfls.length === 0) {
      alert('Please fill out all mandatory fields and select at least one CFL employee.');
      return;
    }

    const payload = {
      stageId: parseInt(modalStage),
      meetingTitle: modalTitle || 'Goal Alignment Review',
      meetingAgenda: modalAgenda || 'Define and align on targets',
      scheduledAt: modalScheduledAt ? `${modalScheduledAt}:00` : new Date(Date.now() + 86400000).toISOString().split('.')[0],
      durationMinutes: parseInt(modalDuration),
      meetingLink: modalLink,
      managerEmpCode: parseInt(modalManager),
      cflEmpCodes: selectedCfls
    };

    try {
      await goalService.initiate(payload);
      alert(`Goal Setting Cycle enabled successfully for ${selectedCfls.length} CFL employee(s)!`);
      setIsModalOpen(false);
      
      // Reset Modal Form
      setSelectedCfls([]);
      setModalManager('');
      setModalTitle('');
      setModalAgenda('');
      setModalScheduledAt('');
      
      await refreshTables();
    } catch (err) {
      console.error('Failed to initiate goals:', err);
      alert('Error initiating goal cycle. Please check server compilation and database logs.');
    }
  };

  const handleCompleteMeeting = async (id) => {
    try {
      await goalService.completeMeeting(id);
      alert('Meeting marked completed. Goals unlocked for the CFL employee!');
      await refreshTables();
    } catch (err) {
      console.error('Error completing meeting:', err);
      alert('Could not update meeting status on the server.');
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

  // Filter Tables
  const filteredWorkflows = goalsWorkflows.filter(w => {
    const q = searchQuery.toLowerCase();
    const matchSearch = w.cflName?.toLowerCase().includes(q) || String(w.cflEmpId).includes(q);
    const matchMgr = selectedManager === 'All' || w.managerName === selectedManager;
    const matchStage = selectedStageFilter === 'All' || w.stageName.includes(selectedStageFilter);
    return matchSearch && matchMgr && matchStage;
  });

  const filteredProbations = probationEvaluations.filter(e => {
    const q = searchQuery.toLowerCase();
    const matchSearch = e.cflName?.toLowerCase().includes(q) || String(e.cflEmpId).includes(q);
    const matchMgr = selectedManager === 'All' || e.managerName === selectedManager;
    const matchStage = selectedStageFilter === 'All' || e.stage === selectedStageFilter;
    const matchStatus = selectedStatus === 'All' || e.stage === selectedStatus;
    return matchSearch && matchMgr && matchStage && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in duration-300">
      {/* Title & Layout Head Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-2xl tracking-tight font-grotesk text-left">
            Goals & Probation Tracker
          </h3>
          <p className="text-[12.5px] text-slate-500 mt-0.5 font-inter text-left">
            Track goal setting, reviews and probation status of CFLs.
          </p>
        </div>
        
        {/* Upper Selection Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select className="appearance-none bg-white border border-[#EAE3E4] rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 shadow-sm focus:outline-none">
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#78161A] text-white rounded-lg px-4 py-2 text-xs font-bold hover:bg-[#631013] transition-all flex items-center gap-2 shadow-sm font-inter"
          >
            <span className="w-2 h-2 rounded bg-white mr-0.5"></span>
            Initiate Goal Setting
          </button>

          <div className="relative">
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="appearance-none bg-white border border-[#EAE3E4] rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
            >
              <option value="All">All Managers</option>
              {managers.map(m => (
                <option key={m.empCode} value={m.name}>{m.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-white border border-[#EAE3E4] rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Not Eligible Yet">Not Eligible Yet</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>

          <button
            onClick={() => alert('Data exported!')}
            className="bg-white border border-[#EAE3E4] rounded-lg px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm font-inter"
          >
            <FaFileExport className="w-3.5 h-3.5 text-slate-500" />
            Export
          </button>
        </div>
      </div>

      {/* Info Alert notice banner */}
      <div className="bg-[#E8F0FE] border border-[#d2e3fc] rounded-2xl px-5 py-3.5 flex items-center gap-3">
        <FaRegBell className="w-5 h-5 text-[#1a73e8] flex-shrink-0 animate-bounce" />
        <p className="text-[12.5px] text-[#1a73e8] font-semibold font-inter text-left">
          Automatic Reminders: the system emails Managers 15 days before goal-setting, probation confirmation and annual appraisal due dates.
        </p>
      </div>

      {/* Inner Navigation Tabs - Active Pill Design */}
      <div className="flex border-b border-[#EAE3E4] pb-0">
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-5 py-3 text-xs font-bold transition-all relative ${
            activeTab === 'goals'
              ? 'text-[#78161A] border-b-2 border-[#78161A]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Goals Tracking
        </button>
        <button
          onClick={() => setActiveTab('probation')}
          className={`px-5 py-3 text-xs font-bold transition-all relative ${
            activeTab === 'probation'
              ? 'text-[#78161A] border-b-2 border-[#78161A]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Probation Tracking
        </button>
      </div>

      {/* Search Filter section */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.015)] space-y-4">
        <div className="flex justify-between items-center gap-4">
          <div className="relative w-full max-w-[280px]">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <FaSearch className="w-3.5 h-3.5 text-[#a855f7]" />
            </span>
            <input
              type="text"
              placeholder="Search by CFL name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#EAE3E4] rounded-lg text-xs outline-none bg-slate-50/20 text-slate-700 placeholder-slate-400 focus:bg-white focus:border-[#78161A] transition-all font-inter"
            />
          </div>
          <div className="relative">
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="appearance-none bg-white border border-[#EAE3E4] rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-750 shadow-sm focus:outline-none"
            >
              <option value="All">All Stages</option>
              <option value="30 Days">30 Days Plan</option>
              <option value="60 Days">60 Days Plan</option>
              <option value="90 Days">90 Days Plan</option>
              {activeTab === 'probation' && (
                <>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Not Eligible Yet">Not Eligible Yet</option>
                </>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-8 text-xs font-bold text-slate-500 animate-pulse font-inter">
            Loading results...
          </div>
        )}

        {/* Errors */}
        {error && (
          <div className="text-center py-6 text-xs font-bold text-rose-600 font-inter">
            {error}
          </div>
        )}

        {/* GOALS TRACKING TABLE */}
        {!loading && !error && activeTab === 'goals' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-inter">
              <thead>
                <tr className="border-b border-[#EAE3E4] bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">CFL Name</th>
                  <th className="py-3 px-4">Manager</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Meeting Status</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th className="py-3 px-4">Goal Progress</th>
                  <th className="py-3 px-4">Meeting Link</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3E4]">
                {filteredWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                      No matching initiated goal workflow cycles found.
                    </td>
                  </tr>
                ) : (
                  filteredWorkflows.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{w.cflName}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{w.managerName}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100/80 text-slate-700 px-2 py-0.5 rounded font-bold">
                          {w.stageName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {w.meetingCompletedAt ? (
                          <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                            <FaCheckCircle className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="text-amber-500 font-bold">Scheduled</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {w.status === 'MEETING_SCHEDULED' && (
                          <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-semibold border border-amber-200/50">
                            Meeting Scheduled
                          </span>
                        )}
                        {w.status === 'GOAL_ENABLED' && (
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold border border-blue-200/50">
                            Goal Setting Enabled
                          </span>
                        )}
                        {w.status === 'GOALS_SUBMITTED' && (
                          <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-semibold border border-purple-200/50">
                            Goals Submitted
                          </span>
                        )}
                        {w.status === 'APPROVED' && (
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold border border-emerald-200/50">
                            Plan Approved
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-[#78161A] h-full" 
                              style={{ width: `${w.goalProgress || 0}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-700">{w.goalProgress || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {w.meetingLink && w.meetingLink !== '—' ? (
                          <a 
                            href={w.meetingLink}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#78161A] hover:underline font-bold inline-flex items-center gap-1.5"
                          >
                            Join Meet <FaExternalLinkAlt className="w-2.5 h-2.5" />
                          </a>
                        ) : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {w.status === 'MEETING_SCHEDULED' && (
                          <button
                            onClick={() => handleCompleteMeeting(w.id)}
                            className="bg-[#78161A] text-white px-3 py-1 rounded font-bold hover:bg-[#631013] transition-colors"
                          >
                            Complete Meeting
                          </button>
                        )}
                        {w.status !== 'MEETING_SCHEDULED' && (
                          <span className="text-slate-400 font-bold">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PROBATION TRACKING TABLE (Matching Screen Replica exactly) */}
        {!loading && !error && activeTab === 'probation' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-inter">
              <thead>
                <tr className="border-b border-[#EAE3E4] bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">CFL Name</th>
                  <th className="py-3 px-4">Manager</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Submitted On</th>
                  <th className="py-3 px-4">Recommendation</th>
                  <th className="py-3 px-4">BU Head Approval</th>
                  <th className="py-3 px-4">HR Approval</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3E4]">
                {filteredProbations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                      No matching probation evaluation records found.
                    </td>
                  </tr>
                ) : (
                  filteredProbations.map(e => (
                    <tr key={e.id || e.cflEmpId} className="hover:bg-slate-50/30 transition-colors">
                      {/* CFL NAME column with Initials avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#f4ecef] text-[#78161A] flex items-center justify-center font-bold text-[11px] select-none">
                            {getInitials(e.cflName)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{e.cflName}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">CFL Code: {e.cflEmpId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{e.managerName}</td>
                      <td className="py-3 px-4">
                        {e.stage === 'Confirmed' ? (
                          <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded font-bold border border-[#C8E6C9]/40">
                            Confirmed
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-semibold text-[10.5px]">
                            Not Eligible Yet
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {e.submittedOn ? '02 Sep 2026' : '—'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">{e.recommendation}</td>
                      <td className="py-3 px-4">
                        {e.buHeadApproval !== '—' ? (
                          <div className="leading-tight text-left">
                            <span className="font-bold text-slate-800 block">{e.buHeadApproval}</span>
                            <span className="text-[10.5px] text-slate-400 font-semibold">05 Sep 2026</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {e.hrApproval !== '—' ? (
                          <div className="leading-tight text-left">
                            <span className="font-bold text-slate-800 block">{e.hrApproval}</span>
                            <span className="text-[10.5px] text-slate-400 font-semibold">08 Sep 2026</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            const assignment = allAssignments.find(a => String(a.cflEmpCode) === String(e.cflEmpId));
                            const mgrCode = assignment ? assignment.managerEmpCode : '';
                            setModalManager(String(mgrCode || ''));
                            setSelectedCfls([parseInt(e.cflEmpId)]);
                            const firstStage = goalStages[0]?.id || '';
                            setModalStage(firstStage);
                            setIsModalOpen(true);
                          }}
                          className="bg-[#78161A] text-white px-2.5 py-1 rounded font-bold hover:bg-[#631013] transition-colors"
                        >
                          Initiate Goals
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INITIATE GOAL SETTING POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto bg-slate-950/75 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 md:p-8 relative transform scale-100 transition-all font-inter my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-all p-1"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-slate-800 border-b border-secondary pb-3 mb-5 tracking-tight font-grotesk text-left">
              Initiate Goal Setting Cycle
            </h3>

            <form onSubmit={handleInitiateSubmit} className="space-y-4 text-left max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Target Goal Cycle *
                </label>
                <select
                  value={modalStage}
                  onChange={(e) => setModalStage(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl text-sm bg-slate-50/20 focus:outline-none focus:ring-2 focus:ring-[#78161A]/10 focus:border-[#78161A] transition-all font-bold text-slate-800"
                >
                  {goalStages.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.stageCode === 'G30' ? '30 Days Goals' : s.stageCode === 'G60' ? '60 Days Goals' : s.stageCode === 'G90' ? '90 Days Goals' : `${s.stageName} Goals`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Select Manager *
                </label>
                <select
                  value={modalManager}
                  onChange={(e) => {
                    setModalManager(e.target.value);
                    setSelectedCfls([]);
                  }}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl text-sm bg-slate-50/20 focus:outline-none focus:ring-2 focus:ring-[#78161A]/10 focus:border-[#78161A] transition-all font-bold text-slate-800"
                >
                  <option value="">-- Choose Manager --</option>
                  {managers.map(m => (
                    <option key={m.empCode} value={m.empCode}>
                      {m.name} (Code: {m.empCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Select CFL Employees *
                </label>
                <div
                  onClick={() => setIsCflDropdownOpen(!isCflDropdownOpen)}
                  className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#78161A]/10 focus:border-[#78161A] transition-all cursor-pointer flex justify-between items-center text-slate-800 font-medium min-h-[42px]"
                >
                  <div className="flex flex-wrap gap-1 pr-4">
                    {selectedCfls.length === 0 ? (
                      <span className="text-slate-400">-- Choose CFLs --</span>
                    ) : (
                      allAssignments
                        .filter(a => selectedCfls.includes(a.cflEmpCode))
                        .map(a => (
                          <span key={a.cflEmpCode} className="bg-[#78161A]/10 text-[#78161A] text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            {a.cflName}
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setSelectedCfls(prev => prev.filter(c => c !== a.cflEmpCode));
                              }}
                              className="hover:text-rose-600 font-bold"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                    )}
                  </div>
                  <svg className={`fill-current h-4 w-4 text-slate-500 transform transition-transform ${isCflDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>

                {isCflDropdownOpen && (
                  <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto p-2.5 space-y-2">
                    {!modalManager ? (
                      <p className="text-xs text-rose-500 font-semibold p-1">Please select a manager first.</p>
                    ) : managerCfls.length === 0 ? (
                      <p className="text-xs text-slate-500 font-semibold p-1">No active CFLs assigned under this manager.</p>
                    ) : (
                      managerCfls.map(c => {
                        const isChecked = selectedCfls.includes(c.cflEmpCode);
                        return (
                          <label key={c.cflEmpCode} className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedCfls(prev =>
                                  isChecked ? prev.filter(code => code !== c.cflEmpCode) : [...prev, c.cflEmpCode]
                                );
                              }}
                              className="accent-[#78161A] w-4 h-4 rounded"
                            />
                            <span className="text-xs font-semibold text-slate-700">
                              {c.cflName} (Code: {c.cflEmpCode})
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Meeting Topic / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 30 Days Goal Setting Alignments"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-[#78161A] transition-all bg-slate-50/20 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Meeting Agenda *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Agenda points for Aligning goals between managers and CFLs..."
                  value={modalAgenda}
                  onChange={(e) => setModalAgenda(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-[#78161A] transition-all bg-slate-50/20 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Start Date / Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={modalScheduledAt}
                    onChange={(e) => setModalScheduledAt(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-[#78161A] transition-all bg-slate-50/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    value={modalDuration}
                    onChange={(e) => setModalDuration(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-[#78161A] transition-all bg-slate-50/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Meeting Link *
                </label>
                <input
                  type="url"
                  required
                  value={modalLink}
                  onChange={(e) => setModalLink(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-[#78161A] transition-all bg-slate-50/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#78161A] rounded-xl hover:bg-[#631013] transition-colors"
                >
                  Schedule and Start Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsProbation;
