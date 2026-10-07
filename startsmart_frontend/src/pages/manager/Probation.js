import React, { useEffect, useState } from 'react';
import { 
  FaUsers, 
  FaHourglassHalf, 
  FaBuilding, 
  FaClipboardList, 
  FaCheckCircle, 
  FaBell, 
  FaClock, 
  FaLock, 
  FaRegEye 
} from 'react-icons/fa';
import goalService from '../../services/goalService';
import cflAssignmentService from '../../services/cflAssignmentService';

const Probation = () => {
  const managerEmpCode = 2002;
  const [loading, setLoading] = useState(true);
  const [cflList, setCflList] = useState([]);

  const fetchProbationData = async () => {
    try {
      setLoading(true);

      // 1. Fetch CFL assignments for Manager 2002
      let assignedCfls = [];
      try {
        const assignmentsRes = await cflAssignmentService.getByManager(managerEmpCode, { page: 0, size: 50 });
        if (assignmentsRes && assignmentsRes.content) {
          assignedCfls = assignmentsRes.content;
        } else if (Array.isArray(assignmentsRes)) {
          assignedCfls = assignmentsRes;
        }
      } catch (e) {
        console.warn(`Failed to fetch assignments for manager ${managerEmpCode}:`, e);
      }

      // If assignment endpoint returns empty, try getting all assignments
      if (assignedCfls.length === 0) {
        try {
          const allRes = await cflAssignmentService.getAllAssignments();
          if (allRes && allRes.content) {
            assignedCfls = allRes.content.filter(a => String(a.managerEmpCode) === String(managerEmpCode));
          }
        } catch (ignored) {}
      }

      // 2. Fetch workflow statuses for each CFL to calculate missing review cycles
      const processed = await Promise.all(
        assignedCfls.map(async (cfl) => {
          const empCode = cfl.cflEmpCode || cfl.id;
          let workflows = [];
          try {
            workflows = await goalService.getWorkflowByCfl(empCode);
          } catch (err) {
            console.warn(`Could not load workflow for CFL ${empCode}:`, err);
          }

          // Check required review cycles completion
          const stages = [
            { code: 'G30', name: 'Thirty Days Plan' },
            { code: 'G60', name: 'Sixty Days Plan' },
            { code: 'G90', name: 'Ninety Days Plan' },
            { code: 'G100', name: 'Final Review' }
          ];

          const completedStageCodes = new Set();
          
          // Check local storage for G100 Annual Review completion
          const storedAnnualRaw = localStorage.getItem(`annual_review_G100_${empCode}`) || localStorage.getItem(`annual_review_remarks_${empCode}`);
          if (storedAnnualRaw) {
            completedStageCodes.add('G100');
          }

          if (Array.isArray(workflows)) {
            workflows.forEach(w => {
              const isCompletedStatus = 
                w.status === 'CYCLE_COMPLETED' || 
                w.status === 'CONFIRMED' || 
                w.status === 'COMPLETED' || 
                w.status === 'SUBMITTED_TO_HR' || 
                w.status === 'SUBMITTED' || 
                w.status === 'SUBMITTED_TO_EMPLOYEE' || 
                w.status === 'COMPLETED_SUBMITTED_HR' || 
                w.submissionStatus === 'SUBMITTED' || 
                Boolean(w.selfAcceptanceStatus) || 
                Boolean(w.managerRating);

              if (isCompletedStatus) {
                if (w.stageCode) completedStageCodes.add(w.stageCode);
                if (w.stageId === 1 || (w.stageName && w.stageName.includes('30'))) completedStageCodes.add('G30');
                if (w.stageId === 2 || (w.stageName && w.stageName.includes('60'))) completedStageCodes.add('G60');
                if (w.stageId === 3 || (w.stageName && w.stageName.includes('90'))) completedStageCodes.add('G90');
                if (w.stageId === 4 || (w.stageName && w.stageName.includes('Final'))) completedStageCodes.add('G100');
              }
            });
          }

          const missingPlans = stages
            .filter(s => !completedStageCodes.has(s.code))
            .map(s => s.name);

          const allCompleted = missingPlans.length === 0;
          let calculatedCategory = 'NOT_YET_ELIGIBLE';

          if (cfl.status === 'Confirm' || cfl.status === 'Confirmed' || cfl.employmentStatus === 'Confirm') {
            calculatedCategory = 'CONFIRMED_CLOSED';
          } else if (cfl.probationStatus === 'IN_APPROVAL_PIPELINE' || cfl.status === 'Pending HR Approval') {
            calculatedCategory = 'IN_APPROVAL_PIPELINE';
          } else if (allCompleted) {
            calculatedCategory = 'PENDING_ACTION';
          } else {
            calculatedCategory = 'NOT_YET_ELIGIBLE';
          }

          const initials = cfl.cflName
            ? cfl.cflName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : 'CF';

          return {
            cflEmpCode: empCode,
            name: cfl.cflName || `CFL ${empCode}`,
            initials,
            avatarColor: 'bg-[#E06A3C]',
            employmentStatus: cfl.status === 'Confirm' ? 'Confirm' : 'Probation',
            category: calculatedCategory,
            missingPlans: missingPlans,
            completedCount: completedStageCodes.size
          };
        })
      );

      setCflList(processed);
    } catch (err) {
      console.error('Error fetching probation data:', err);
    } fontFinally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProbationData();
  }, [managerEmpCode]);

  const handleConfirmProbation = async (empCode) => {
    try {
      await goalService.submitManagerProbation(empCode);
      setCflList(prev => prev.map(c => {
        if (c.cflEmpCode === empCode) {
          return {
            ...c,
            category: 'IN_APPROVAL_PIPELINE'
          };
        }
        return c;
      }));
      alert('Probation confirmation submitted successfully and sent to HR approval pipeline!');
    } catch (err) {
      console.error('Error submitting manager probation confirmation:', err);
      alert('Failed to submit probation confirmation to server. Please try again.');
    }
  };

  const pendingActionCfls = cflList.filter(c => c.category === 'PENDING_ACTION');
  const pipelineCfls = cflList.filter(c => c.category === 'IN_APPROVAL_PIPELINE');
  const notEligibleCfls = cflList.filter(c => c.category === 'NOT_YET_ELIGIBLE');
  const confirmedClosedCfls = cflList.filter(c => c.category === 'CONFIRMED_CLOSED');

  return (
    <div className="space-y-8 animate-fade-in duration-300 font-inter text-left">
      {/* Header Banner */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#1B1418] tracking-tight font-grotesk">
            Probation Management (Manager ID: {managerEmpCode})
          </h2>
          <p className="text-[13px] text-slate-500 mt-1 font-medium font-inter">
            Monitor CFL probation status, review goal completions, and confirm eligible candidates.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Action Card */}
        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold border border-amber-100">
            <FaBell />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Action</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight font-grotesk">{loading ? "..." : pendingActionCfls.length}</span>
          </div>
        </div>

        {/* In Approval Pipeline Card */}
        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold border border-blue-100">
            <FaClock />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">In Pipeline</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight font-grotesk">{loading ? "..." : pipelineCfls.length}</span>
          </div>
        </div>

        {/* Not Yet Eligible Card */}
        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold border border-rose-100">
            <FaHourglassHalf />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Not Yet Eligible</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight font-grotesk">{loading ? "..." : notEligibleCfls.length}</span>
          </div>
        </div>

        {/* Confirmed / Closed Card */}
        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold border border-emerald-100">
            <FaCheckCircle />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Confirmed</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight font-grotesk">{loading ? "..." : confirmedClosedCfls.length}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Pending Your Action */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <h3 className="text-base font-bold text-[#78161A] font-grotesk uppercase">
              Pending Your Action (Eligible for Confirmation)
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            {pendingActionCfls.length} Eligible
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 font-medium animate-pulse text-sm">
            Loading probation data...
          </div>
        ) : pendingActionCfls.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {pendingActionCfls.map(cfl => (
              <div key={cfl.cflEmpCode} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${cfl.avatarColor} text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm flex-shrink-0`}>
                    {cfl.initials}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-800">{cfl.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">EMP ID: {cfl.cflEmpCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <FaCheckCircle className="text-[10px]" /> All Goals & Reviews Completed
                  </span>
                  <button
                    onClick={() => handleConfirmProbation(cfl.cflEmpCode)}
                    className="bg-[#78161A] hover:bg-[#631013] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    Confirm Probation
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic py-4">No CFL currently pending your action.</p>
        )}
      </div>

      {/* SECTION 2: In Approval Pipeline */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <h3 className="text-base font-bold text-[#78161A] font-grotesk uppercase">
              In Approval Pipeline
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
            {pipelineCfls.length} In Progress
          </span>
        </div>

        {pipelineCfls.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {pipelineCfls.map(cfl => (
              <div key={cfl.cflEmpCode} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${cfl.avatarColor} text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm flex-shrink-0`}>
                    {cfl.initials}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-800">{cfl.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">EMP ID: {cfl.cflEmpCode}</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                  <FaClock className="text-[11px]" /> Pending HR / Admin Approval
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic py-4">No CFL currently in approval pipeline.</p>
        )}
      </div>

      {/* SECTION 3: Not Yet Eligible */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <h3 className="text-base font-bold text-[#78161A] font-grotesk uppercase">
              Not Yet Eligible
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
            {notEligibleCfls.length} Incomplete
          </span>
        </div>

        {notEligibleCfls.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notEligibleCfls.map(cfl => (
              <div key={cfl.cflEmpCode} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${cfl.avatarColor} text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm flex-shrink-0`}>
                    {cfl.initials}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-800">{cfl.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">EMP ID: {cfl.cflEmpCode}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1.5">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Missing Cycles ({cfl.missingPlans.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cfl.missingPlans.map((plan, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <FaLock className="text-[9px]" /> {plan}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic py-4">All CFLs have completed their eligibility requirements!</p>
        )}
      </div>

      {/* SECTION 4: Confirmed / Closed */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <h3 className="text-base font-bold text-[#78161A] font-grotesk uppercase">
              Confirmed / Closed
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            {confirmedClosedCfls.length} Confirmed
          </span>
        </div>

        {confirmedClosedCfls.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {confirmedClosedCfls.map(cfl => (
              <div key={cfl.cflEmpCode} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-[#E06A3C] text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm flex-shrink-0`}>
                    {cfl.initials}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-800">{cfl.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">EMP ID: {cfl.cflEmpCode}</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-[#E6F6EE] text-[#1E8E5A] border border-[#A7F3D0]">
                  ✓ Probation Confirmed
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic py-4">No confirmed CFLs yet.</p>
        )}
      </div>
    </div>
  );
};

export default Probation;
