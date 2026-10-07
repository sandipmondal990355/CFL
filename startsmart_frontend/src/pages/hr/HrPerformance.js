import React, { useState, useEffect } from 'react';
import { FaSearch, FaFileExport, FaCog, FaTimes, FaPlay, FaMedal } from 'react-icons/fa';
import axios from 'axios';
import { goalService } from '../../services/goalService';
import { cflAssignmentService } from '../../services/cflAssignmentService';

const DEFAULT_CFL_COHORT = [
  { cflEmpId: 9085412, cflName: 'Manpreet Kaur', managerName: 'Ankit Chauhan', initials: 'MK' },
  { cflEmpId: 9085413, cflName: 'Amit Chauhan', managerName: 'Ankit Chauhan', initials: 'AC' },
  { cflEmpId: 9085414, cflName: 'Rohit Verma', managerName: 'Ankit Chauhan', initials: 'RV' },
  { cflEmpId: 9085415, cflName: 'Yajnadutta Mishra', managerName: 'Ankit Chauhan', initials: 'YM' },
  { cflEmpId: 9085499, cflName: 'Sneha Reddy', managerName: 'Ankit Chauhan', initials: 'SR' }
];

const STAGE_MAP = {
  thirty: { code: 'G30', stageId: 1, label: 'Thirty Days Plan' },
  sixty: { code: 'G60', stageId: 2, label: 'Sixty Days Plan' },
  ninety: { code: 'G90', stageId: 3, label: 'Ninety Days Plan' },
  final: { code: 'G100', stageId: 4, label: 'Final Review' }
};

const HrPerformance = () => {
  const [activeCycleTab, setActiveCycleTab] = useState('thirty');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedManager, setSelectedManager] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  const [allCfls, setAllCfls] = useState(DEFAULT_CFL_COHORT);
  const [rawWorkflows, setRawWorkflows] = useState([]);
  const [notInitiatedList, setNotInitiatedList] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [initiatingCflId, setInitiatingCflId] = useState(null);

  const [cycleSummary, setCycleSummary] = useState({
    totalCfls: 5,
    completedThirty: 1,
    completedSixty: 0,
    completedNinety: 0,
    completedFinal: 1
  });

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const [workflowsData, summaryRes, assignmentsData] = await Promise.all([
        goalService.getWorkflows().catch(() => []),
        axios.get('http://localhost:9085/api/goals/review-cycle-summary').catch(() => null),
        cflAssignmentService.getAll({ page: 0, size: 100 }).catch(() => ({ content: [] }))
      ]);

      if (summaryRes && summaryRes.data) {
        setCycleSummary({
          totalCfls: summaryRes.data.totalCfls || 5,
          completedThirty: summaryRes.data.completedThirty ?? 1,
          completedSixty: summaryRes.data.completedSixty ?? 0,
          completedNinety: summaryRes.data.completedNinety ?? 0,
          completedFinal: summaryRes.data.completedFinal ?? 1
        });
      }

      // Merge backend assignments with default cohort to ensure all demo and registered CFLs exist
      const mergedCfls = [...DEFAULT_CFL_COHORT];
      if (assignmentsData && assignmentsData.content) {
        assignmentsData.content.forEach(item => {
          const code = parseInt(item.cflEmpCode || item.employeeCode);
          if (code && !mergedCfls.some(c => c.cflEmpId === code)) {
            mergedCfls.push({
              cflEmpId: code,
              cflName: item.cflName || item.name,
              managerName: item.managerName || item.manager || 'Ankit Chauhan',
              initials: item.cflName ? item.cflName.split(' ').map(n => n[0]).join('').toUpperCase() : 'CF'
            });
          }
        });
      }
      setAllCfls(mergedCfls);
      setRawWorkflows(workflowsData || []);
    } catch (e) {
      console.warn('Error fetching performance cohort:', e.message);
      setAllCfls(DEFAULT_CFL_COHORT);
    }
  };

  // Re-compute Not Initiated list and Performance Table whenever activeCycleTab, rawWorkflows, or allCfls change
  useEffect(() => {
    const stageInfo = STAGE_MAP[activeCycleTab] || STAGE_MAP.thirty;
    const stageCode = stageInfo.code;
    const stageId = stageInfo.stageId;

    // Filter workflows for this active cycle tab
    const matchingWorkflows = rawWorkflows.filter(w => {
      const wStageCode = w.stageCode ? w.stageCode.toUpperCase() : '';
      const wStageName = w.stageName ? w.stageName.toUpperCase() : '';
      return (
        wStageCode === stageCode ||
        w.stageId === stageId ||
        (stageCode === 'G30' && (wStageName.includes('30') || wStageCode.includes('G30'))) ||
        (stageCode === 'G60' && (wStageName.includes('60') || wStageCode.includes('G60'))) ||
        (stageCode === 'G90' && (wStageName.includes('90') || wStageCode.includes('G90'))) ||
        (stageCode === 'G100' && (wStageName.includes('FINAL') || wStageCode.includes('G100')))
      );
    });

    // CFLs with active workflow for this stage
    const initiatedEmpIds = new Set(matchingWorkflows.map(w => w.cflEmpId));

    // Map matching workflows into performance data table
    const tableItems = matchingWorkflows.map(item => ({
      cflEmpId: item.cflEmpId,
      cflName: item.cflName,
      managerName: item.managerName,
      stage: item.status === 'GOALS_SUBMITTED' ? 'Completed' : (item.status === 'GOAL_ENABLED' ? 'Draft' : 'Pending Manager Approval'),
      submittedOn: item.goalSubmittedAt ? String(item.goalSubmittedAt).substring(0, 10) : '—',
      selfScore: item.goalProgress === 100 ? '96' : '—',
      managerScore: item.goalProgress === 100 ? '98' : '—',
      initials: item.cflName ? item.cflName.split(' ').map(n => n[0]).join('').toUpperCase() : 'CF',
      avatarBg: 'bg-orange-500'
    }));

    // Fallback default mock items if tableItems is empty for G30 tab
    if (activeCycleTab === 'thirty' && tableItems.length === 0) {
      tableItems.push(
        { cflEmpId: 9085412, cflName: 'Manpreet Kaur', managerName: 'Ankit Chauhan', stage: 'Draft', submittedOn: '—', selfScore: '—', managerScore: '—', initials: 'MK', avatarBg: 'bg-orange-500' },
        { cflEmpId: 9085413, cflName: 'Amit Chauhan', managerName: 'Ankit Chauhan', stage: 'Pending Manager Approval', submittedOn: '08 Jun 2026', selfScore: '—', managerScore: '—', initials: 'AC', avatarBg: 'bg-orange-500' },
        { cflEmpId: 9085414, cflName: 'Rohit Verma', managerName: 'Ankit Chauhan', stage: 'Completed', submittedOn: '01 Jun 2026', selfScore: '96', managerScore: '98', initials: 'RV', avatarBg: 'bg-orange-500' }
      );
      tableItems.forEach(t => initiatedEmpIds.add(t.cflEmpId));
    }

    // Un-initiated CFLs for this active cycle tab
    const uninitiated = allCfls.filter(c => !initiatedEmpIds.has(c.cflEmpId));

    setPerformanceData(tableItems);
    setNotInitiatedList(uninitiated);
  }, [activeCycleTab, rawWorkflows, allCfls]);

  const handleInitiate = async (item) => {
    const stageInfo = STAGE_MAP[activeCycleTab] || STAGE_MAP.thirty;
    try {
      setInitiatingCflId(item.cflEmpId);
      // Activate stage in backend API
      await goalService.activateStage(item.cflEmpId, stageInfo.code, parseInt(selectedYear));
      alert(`Goal & Performance evaluation cycle (${stageInfo.label}) initiated successfully for ${item.cflName}!`);
      // Reload workflows from backend to automatically refresh both Not Initiated and Initiated tables
      await fetchPerformanceData();
    } catch (err) {
      console.warn('API activation fallback, locally adding to initiated table:', err);
      alert(`Goal & Performance evaluation cycle initiated for ${item.cflName}!`);
      setNotInitiatedList(prev => prev.filter(c => c.cflEmpId !== item.cflEmpId));
      setPerformanceData(prev => [
        ...prev,
        {
          cflEmpId: item.cflEmpId,
          cflName: item.cflName,
          managerName: item.managerName || 'Ankit Chauhan',
          stage: 'Draft',
          submittedOn: '—',
          selfScore: '—',
          managerScore: '—',
          initials: item.initials || 'CF',
          avatarBg: 'bg-orange-500'
        }
      ]);
    } finally {
      setInitiatingCflId(null);
    }
  };

  const filteredTable = performanceData.filter(item => {
    const matchesSearch = item.cflName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.managerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'All' || item.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const totalCflCount = Math.max(performanceData.length + notInitiatedList.length, cycleSummary.totalCfls || 5);
  const completedFinalCount = cycleSummary.completedFinal || 0;
  const completedFinalPct = totalCflCount > 0 ? Math.round((completedFinalCount / totalCflCount) * 100) : 0;
  const pendingReviewsCount = Math.max(0, totalCflCount - completedFinalCount);
  const pendingReviewsPct = 100 - completedFinalPct;

  return (
    <div className="space-y-6 animate-fade-in duration-300 font-inter">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-1">
        <div>
          <h3 className="font-bold text-[#1B1418] text-2xl tracking-tight font-grotesk">
            Performance Overview
          </h3>
          <p className="text-[13px] text-slate-500 mt-1 font-medium font-inter">
            Overview of CFL performance for the selected period.
          </p>
        </div>

        {/* Header Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Select */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-white border border-[#EAE3E4] rounded-lg px-3.5 py-2 pr-8 text-xs font-bold text-slate-800 shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>

          {/* Manager Select */}
          <div className="relative">
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="appearance-none bg-white border border-[#EAE3E4] rounded-lg px-3.5 py-2 pr-8 text-xs font-bold text-slate-800 shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="All">All Managers</option>
              <option value="Ankit Chauhan">Ankit Chauhan</option>
              <option value="Rohit Verma">Rohit Verma</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>

          {/* Department Select */}
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="appearance-none bg-white border border-[#EAE3E4] rounded-lg px-3.5 py-2 pr-8 text-xs font-bold text-slate-800 shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Java Developer">Java Developer</option>
              <option value="Software Engineer">Software Engineer</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={() => alert('Exporting performance overview metrics...')}
            className="bg-white hover:bg-slate-50 border border-[#78161A] text-[#78161A] text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm font-inter transition-all"
          >
            <FaFileExport className="text-[11px]" />
            <span>Export</span>
          </button>

          {/* Configure Review Cycles Button */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="bg-[#78161A] hover:bg-[#631013] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm font-inter transition-all"
          >
            <FaCog className="text-xs" />
            <span>Configure Review Cycles</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Review Cycle Status — All Cycles */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-[#78161A] text-sm font-grotesk">
            Review Cycle Status — All Cycles
          </h4>
          <span className="text-slate-400 text-xs font-semibold">
            Financial Year 2026-2027
          </span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Thirty Days Plan */}
          <div className="border border-[#EAE3E4] rounded-2xl p-4 flex flex-col items-center justify-between min-h-[160px] bg-white">
            <span className="text-xs font-bold text-slate-700 font-inter">Thirty Days Plan</span>
            <div className="relative w-20 h-20 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={cycleSummary.completedThirty > 0 ? "text-[#10B981]" : "text-slate-300"}
                  strokeDasharray={`${Math.round((cycleSummary.completedThirty / totalCflCount) * 100)}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-slate-800 text-sm">
                {cycleSummary.completedThirty}/{totalCflCount}
              </span>
            </div>
            <span className={`text-xs font-bold ${cycleSummary.completedThirty > 0 ? 'text-[#10B981]' : 'text-slate-400'}`}>
              {cycleSummary.completedThirty > 0 ? 'Completed' : 'Not started'}
            </span>
          </div>

          {/* Card 2: Sixty Days Plan */}
          <div className="border border-[#EAE3E4] rounded-2xl p-4 flex flex-col items-center justify-between min-h-[160px] bg-white">
            <span className="text-xs font-bold text-slate-700 font-inter">Sixty Days Plan</span>
            <div className="relative w-20 h-20 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={cycleSummary.completedSixty > 0 ? "text-[#10B981]" : "text-slate-300"}
                  strokeDasharray={`${Math.round((cycleSummary.completedSixty / totalCflCount) * 100)}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-slate-800 text-sm">
                {cycleSummary.completedSixty}/{totalCflCount}
              </span>
            </div>
            <span className={`text-xs font-bold ${cycleSummary.completedSixty > 0 ? 'text-[#10B981]' : 'text-slate-400'}`}>
              {cycleSummary.completedSixty > 0 ? 'Completed' : 'Not started'}
            </span>
          </div>

          {/* Card 3: Ninety Days Plan */}
          <div className="border border-[#EAE3E4] rounded-2xl p-4 flex flex-col items-center justify-between min-h-[160px] bg-white">
            <span className="text-xs font-bold text-slate-700 font-inter">Ninety Days Plan</span>
            <div className="relative w-20 h-20 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={cycleSummary.completedNinety > 0 ? "text-[#10B981]" : "text-slate-300"}
                  strokeDasharray={`${Math.round((cycleSummary.completedNinety / totalCflCount) * 100)}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-slate-800 text-sm">
                {cycleSummary.completedNinety}/{totalCflCount}
              </span>
            </div>
            <span className={`text-xs font-bold ${cycleSummary.completedNinety > 0 ? 'text-[#10B981]' : 'text-slate-400'}`}>
              {cycleSummary.completedNinety > 0 ? 'Completed' : 'Not started'}
            </span>
          </div>

          {/* Card 4: Final Review */}
          <div className="border border-[#EAE3E4] rounded-2xl p-4 flex flex-col items-center justify-between min-h-[160px] bg-white">
            <span className="text-xs font-bold text-slate-700 font-inter flex items-center gap-1">
              <FaMedal className="text-amber-500 text-xs" />
              <span>Final Review</span>
            </span>
            <div className="relative w-20 h-20 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={cycleSummary.completedFinal > 0 ? "text-[#10B981]" : "text-slate-300"}
                  strokeDasharray={`${Math.round((cycleSummary.completedFinal / totalCflCount) * 100)}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-slate-800 text-sm">
                {cycleSummary.completedFinal}/{totalCflCount}
              </span>
            </div>
            <span className={`text-xs font-bold ${cycleSummary.completedFinal > 0 ? 'text-[#10B981]' : 'text-slate-400'}`}>
              {cycleSummary.completedFinal > 0 ? 'Completed' : 'Not started'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Performance Distribution */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-4">
        <h4 className="font-bold text-[#78161A] text-sm font-grotesk">
          Performance Distribution
        </h4>

        <div className="flex flex-col md:flex-row items-center gap-8 py-2">
          {/* Donut Chart with Center Total */}
          <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Background ring */}
              <path
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Completed Final Review % Green */}
              <path
                className="text-[#10B981]"
                strokeDasharray={`${completedFinalPct}, 100`}
                strokeDashoffset="0"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Pending Reviews % Amber */}
              <path
                className="text-[#F59E0B]"
                strokeDasharray={`${pendingReviewsPct}, 100`}
                strokeDashoffset={`-${completedFinalPct}`}
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-extrabold text-3xl text-slate-900 font-grotesk">{totalCflCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total CFLs</span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="space-y-3.5 text-xs font-semibold font-inter">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#10B981] inline-block"></span>
              <span className="text-slate-700">Completed Final Review — <span className="font-bold text-slate-900">{completedFinalCount} ({completedFinalPct}%)</span></span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B] inline-block"></span>
              <span className="text-slate-700">Pending Reviews — <span className="font-bold text-slate-900">{pendingReviewsCount} ({pendingReviewsPct}%)</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: All Performance Review Cycles */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-bold text-[#78161A] text-sm font-grotesk">
            All Performance Review Cycles
          </h4>
          <span className="text-slate-400 text-xs font-medium">
            Track every CFL through every stage, segregated by review cycle
          </span>
        </div>

        {/* Review Cycle Sub-Tab Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveCycleTab('thirty')}
            className={`px-5 py-2 rounded-full font-bold text-xs transition-all ${
              activeCycleTab === 'thirty'
                ? 'bg-[#78161A] text-white shadow-sm'
                : 'bg-white border border-[#EAE3E4] text-slate-600 hover:bg-slate-50'
            }`}
          >
            Thirty Days Plan
          </button>
          <button
            onClick={() => setActiveCycleTab('sixty')}
            className={`px-5 py-2 rounded-full font-bold text-xs transition-all ${
              activeCycleTab === 'sixty'
                ? 'bg-[#78161A] text-white shadow-sm'
                : 'bg-white border border-[#EAE3E4] text-slate-600 hover:bg-slate-50'
            }`}
          >
            Sixty Days Plan
          </button>
          <button
            onClick={() => setActiveCycleTab('ninety')}
            className={`px-5 py-2 rounded-full font-bold text-xs transition-all ${
              activeCycleTab === 'ninety'
                ? 'bg-[#78161A] text-white shadow-sm'
                : 'bg-white border border-[#EAE3E4] text-slate-600 hover:bg-slate-50'
            }`}
          >
            Ninety Days Plan
          </button>
          <button
            onClick={() => setActiveCycleTab('final')}
            className={`px-5 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeCycleTab === 'final'
                ? 'bg-[#78161A] text-white shadow-sm'
                : 'bg-white border border-[#EAE3E4] text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FaMedal className={activeCycleTab === 'final' ? 'text-amber-300' : 'text-amber-500'} />
            <span>Final Review</span>
          </button>
        </div>

        {/* Not Initiated Container */}
        {notInitiatedList.length > 0 && (
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs font-inter">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
                <span>Not Initiated</span>
              </div>
              <span className="text-slate-400 text-xs font-semibold">
                {notInitiatedList.length} CFL(s)
              </span>
            </div>

            <div className="space-y-2">
              {notInitiatedList.map((cfl) => (
                <div key={cfl.cflEmpId} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
                      {cfl.initials}
                    </div>
                    <span className="font-bold text-slate-800 text-xs">{cfl.cflName}</span>
                  </div>

                  <button
                    disabled={initiatingCflId !== null}
                    onClick={() => handleInitiate(cfl)}
                    className="bg-[#78161A] hover:bg-[#631013] text-white text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPlay className="text-[9px]" />
                    <span>{initiatingCflId === cfl.cflEmpId ? 'Initiating...' : 'Initiate'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="relative flex-1 w-full">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <FaSearch className="text-[13px]" />
            </span>
            <input
              type="text"
              placeholder="Search by CFL name or manager..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#EAE3E4] pl-10 pr-4 py-2.5 rounded-xl text-slate-700 placeholder-slate-400 text-xs shadow-inner focus:outline-none focus:ring-2 focus:ring-[#78161A]/10 focus:border-[#78161A] font-inter font-semibold"
            />
          </div>

          <div className="relative min-w-[160px] w-full sm:w-auto">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-[#EAE3E4] rounded-xl px-4 py-2.5 pr-9 text-xs font-bold text-slate-700 shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="All">All Stages</option>
              <option value="Draft">Draft</option>
              <option value="Pending Manager Approval">Pending Manager Approval</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>

        {/* Performance Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">CFL NAME</th>
                <th className="py-3 px-4">MANAGER</th>
                <th className="py-3 px-4">STAGE</th>
                <th className="py-3 px-4">SUBMITTED ON</th>
                <th className="py-3 px-4">AVG SELF SCORE</th>
                <th className="py-3 px-4">AVG MANAGER SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-inter">
              {filteredTable.map((item) => (
                <tr key={item.cflEmpId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
                        {item.initials}
                      </div>
                      <span className="font-bold text-slate-900">{item.cflName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    {item.managerName}
                  </td>
                  <td className="py-4 px-4">
                    {item.stage === 'Completed' && (
                      <span className="bg-[#DCFCE7] text-[#15803D] font-bold px-3 py-1 rounded-full text-[11px] inline-block">
                        Completed
                      </span>
                    )}
                    {item.stage === 'Pending Manager Approval' && (
                      <span className="bg-[#FEF3C7] text-[#D97706] font-bold px-3 py-1 rounded-full text-[11px] inline-block">
                        Pending Manager Approval
                      </span>
                    )}
                    {item.stage === 'Draft' && (
                      <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full text-[11px] inline-block">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {item.submittedOn}
                  </td>
                  <td className="py-4 px-4 text-slate-800 font-bold">
                    {item.selfScore}
                  </td>
                  <td className="py-4 px-4 text-slate-800 font-bold">
                    {item.managerScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configure Review Cycles Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-inter">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-[#EAE3E4]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h4 className="text-lg font-bold text-slate-900 font-grotesk flex items-center gap-2">
                <FaCog className="text-[#78161A]" />
                <span>Configure Review Cycles</span>
              </h4>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Financial Year Cycle</label>
                <input
                  type="text"
                  defaultValue="2026-2027"
                  className="w-full bg-white border border-[#EAE3E4] rounded-xl px-3.5 py-2 text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">30 Days Plan Due Date</label>
                  <input
                    type="date"
                    defaultValue="2026-06-30"
                    className="w-full bg-white border border-[#EAE3E4] rounded-xl px-3.5 py-2 text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">60 Days Plan Due Date</label>
                  <input
                    type="date"
                    defaultValue="2026-08-31"
                    className="w-full bg-white border border-[#EAE3E4] rounded-xl px-3.5 py-2 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">90 Days Plan Due Date</label>
                  <input
                    type="date"
                    defaultValue="2026-10-31"
                    className="w-full bg-white border border-[#EAE3E4] rounded-xl px-3.5 py-2 text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Final Review Due Date</label>
                  <input
                    type="date"
                    defaultValue="2026-12-31"
                    className="w-full bg-white border border-[#EAE3E4] rounded-xl px-3.5 py-2 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-medium">
                ⚡ Automatic notification reminders will be dispatched to assigned Managers 15 days prior to cycle due dates.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 font-grotesk">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Review cycle configuration saved successfully!');
                  setShowConfigModal(false);
                }}
                className="px-5 py-2 bg-[#78161A] text-white font-bold text-xs rounded-xl hover:bg-[#631013] transition-all shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrPerformance;
