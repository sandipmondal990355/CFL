import React, { useState, useEffect } from 'react';
import {
  FaRegEye,
  FaSearch,
  FaLock,
  FaTimes,
  FaCheck,
  FaArrowLeft,
  FaEdit,
  FaUser,
  FaInfoCircle
} from 'react-icons/fa';
import { goalService } from '../../services/goalService';
import { cflAssignmentService } from '../../services/cflAssignmentService';
import { documentService } from '../../services/documentService';

const formatSelfAcceptanceStatus = (status) => {
  if (!status) return 'Accepted Evaluation';
  if (status === 'VERY_SATISFIED' || status.includes('VERY_SATISFIED') || status.includes('Very Satisfied')) return '😍 Selection Status: Very Satisfied / Accept Evaluation';
  if (status === 'SATISFIED' || status.includes('SATISFIED') || status.includes('Satisfied')) return '😊 Selection Status: Satisfied / Accept Evaluation';
  if (status === 'NEUTRAL' || status.includes('NEUTRAL') || status.includes('Neutral')) return '😐 Selection Status: Neutral / Accept Evaluation';
  if (status === 'DISSATISFIED' || status.includes('DISSATISFIED') || status.includes('Dissatisfied')) return '🙁 Selection Status: Dissatisfied / Request Clarification';
  if (status === 'VERY_DISSATISFIED' || status.includes('VERY_DISSATISFIED') || status.includes('Very Dissatisfied')) return '😠 Selection Status: Very Dissatisfied / Request Clarification';
  return status;
};

const Performance = () => {
  const managerEmpCode = 2002;
  const [activePlan, setActivePlan] = useState('thirty-days');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All Stages');

  // Loading state
  const [loading, setLoading] = useState(true);

  // Modal State for inspecting/approving goals
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedCfl, setSelectedCfl] = useState(null);

  // Detailed Summary View State (non-null when manager clicks "Created" / View)
  const [selectedCflForSummary, setSelectedCflForSummary] = useState(null);
  const [isReviewActionActive, setIsReviewActionActive] = useState(false);
  const [editableGoalWeightages, setEditableGoalWeightages] = useState({ 1: 40, 2: 30, 3: 30 });

  // Request Changes Modal state
  const [requestChangesModalOpen, setRequestChangesModalOpen] = useState(false);
  const [requestChangesTarget, setRequestChangesTarget] = useState(null);
  const [managerRemarksInput, setManagerRemarksInput] = useState('');

  // Thirty Days team review data dynamically populated from backend API
  const [thirtyDaysData, setThirtyDaysData] = useState([]);
  const [rawWorkflows, setRawWorkflows] = useState([]);

  // Manager Ratings & Comments per goal for review
  const [managerRatings, setManagerRatings] = useState({});
  const [managerComments, setManagerComments] = useState({});

  // Annual Review multi-step screen state
  const [selectedCflForAnnualReview, setSelectedCflForAnnualReview] = useState(null);
  const [annualReviewStep, setAnnualReviewStep] = useState(1);
  const [managerRemarksText, setManagerRemarksText] = useState("");
  const [achievementLevel, setAchievementLevel] = useState("");
  const [potentialSelection, setPotentialSelection] = useState("");
  const [performanceSelection, setPerformanceSelection] = useState("");

  const handleOpenAnnualReview = (cfl) => {
    setSelectedCflForAnnualReview(cfl);
    setAnnualReviewStep(1);

    const empCode = cfl?.cflEmpCode || cfl?.empCode || cfl?.id || 9085126;
    // Clear any stale local storage draft for this employee so it starts completely empty
    localStorage.removeItem(`annual_review_remarks_${empCode}`);
    
    // Always start with empty remarks for fresh manager entry
    setManagerRemarksText("");
  };

  const handleSaveManagerRemarks = async (showToast = true) => {
    if (!selectedCflForAnnualReview) return;
    const empCode = selectedCflForAnnualReview.cflEmpCode || selectedCflForAnnualReview.empCode || selectedCflForAnnualReview.id || 9085126;

    // Save locally in localStorage
    localStorage.getItem(`annual_review_remarks_${empCode}`);
    localStorage.setItem(`annual_review_remarks_${empCode}`, managerRemarksText);

    // Submit to backend
    try {
      await goalService.submitManagerReview(empCode, 'G100', [], managerRemarksText);
      if (showToast) {
        alert("Manager's Remarks draft saved successfully to backend!");
      }
    } catch (err) {
      console.warn("Backend save note:", err.message);
      if (showToast) {
        alert("Manager's Remarks draft saved locally!");
      }
    }
  };

  // 9-Box Grid Reference Guide Modal State
  const [showGridGuideModal, setShowGridGuideModal] = useState(false);

  // 9-Box Grid Assessment Calculation Logic
  const getNineBoxAssessment = (achievement, potential, performance) => {
    if (!potential || !performance) {
      return {
        talentStatus: "Awaiting selection",
        managerRating: "Awaiting selection",
        ratingDescription: "Awaiting selection"
      };
    }

    const pKey = potential.toLowerCase();
    const perfKey = performance.toLowerCase();

    if (pKey === 'high' && perfKey === 'high') {
      return {
        talentStatus: "Key Talent",
        managerRating: "A+",
        ratingDescription: "Outstanding Contributor"
      };
    } else if (pKey === 'high' && perfKey === 'medium') {
      return {
        talentStatus: "Emerging Talent",
        managerRating: "A",
        ratingDescription: "Exceeds Expectations"
      };
    } else if (pKey === 'high' && perfKey === 'low') {
      return {
        talentStatus: "Mis-Fit",
        managerRating: "A",
        ratingDescription: "Exceeds Expectations"
      };
    } else if (pKey === 'medium' && perfKey === 'high') {
      return {
        talentStatus: "Talent",
        managerRating: "B+",
        ratingDescription: "Meets Expectations"
      };
    } else if (pKey === 'medium' && perfKey === 'medium') {
      return {
        talentStatus: "Critical Resource",
        managerRating: "B",
        ratingDescription: "Partially Meets Expectations"
      };
    } else if (pKey === 'medium' && perfKey === 'low') {
      return {
        talentStatus: "Watch List",
        managerRating: "B",
        ratingDescription: achievement?.toLowerCase() === 'excellent' ? "Meets Expectations" : "Partially Meets Expectations"
      };
    } else if (pKey === 'low' && perfKey === 'high') {
      return {
        talentStatus: "Expert",
        managerRating: "B",
        ratingDescription: "Partially Meets Expectations"
      };
    } else if (pKey === 'low' && perfKey === 'medium') {
      return {
        talentStatus: "Stable",
        managerRating: "B",
        ratingDescription: "Partially Meets Expectations"
      };
    } else if (pKey === 'low' && perfKey === 'low') {
      return {
        talentStatus: "Risk",
        managerRating: "C",
        ratingDescription: "Does Not Meet Expectations"
      };
    }

    return {
      talentStatus: "Awaiting selection",
      managerRating: "Awaiting selection",
      ratingDescription: "Awaiting selection"
    };
  };

  // POSH Document Viewer Modal State
  const [showPoshDocModal, setShowPoshDocModal] = useState(false);
  const [poshDocDetails, setPoshDocDetails] = useState({ fileName: 'POSH (2).pdf', fileData: null, cflName: '', empCode: '' });

  const handleOpenPoshDoc = async () => {
    const empCode = selectedCflForAnnualReview?.empCode || selectedCflForAnnualReview?.cflEmpCode || selectedCflForAnnualReview?.id || 9085126;
    const cflName = selectedCflForAnnualReview?.cflName || selectedCflForAnnualReview?.name || 'Snehal Singh';
    const storedRaw = localStorage.getItem(`annual_review_G100_${empCode}`);
    let fileName = "POSH (2).pdf";
    let fileData = null;
    let viewUrl = null;
    let docId = null;

    if (storedRaw) {
      try {
        const parsed = JSON.parse(storedRaw);
        if (parsed.poshCertificateName) fileName = parsed.poshCertificateName;
        if (parsed.poshCertificateData) fileData = parsed.poshCertificateData;
        if (parsed.poshDocumentId) docId = parsed.poshDocumentId;
      } catch (e) {}
    }

    // Try fetching from backend API
    try {
      const backendDocs = await documentService.getByCflAndType(empCode, 'POSH_CERTIFICATE');
      if (backendDocs && backendDocs.length > 0) {
        const poshDoc = backendDocs[0];
        if (poshDoc) {
          docId = poshDoc.id;
          fileName = poshDoc.fileName || fileName;
        }
      }
    } catch (err) {
      console.warn("Could not fetch POSH documents from backend API, checking all documents:", err);
      try {
        const allDocs = await documentService.getByCfl(empCode);
        if (allDocs && allDocs.length > 0) {
          const poshDoc = allDocs.find(d => d.documentType === 'POSH_CERTIFICATE') || allDocs[allDocs.length - 1];
          if (poshDoc) {
            docId = poshDoc.id;
            fileName = poshDoc.fileName || fileName;
          }
        }
      } catch (ignored) {}
    }


    if (docId) {
      viewUrl = documentService.getViewUrl(docId);
    }

    // If direct viewUrl exists, open in new tab or set viewUrl
    if (viewUrl) {
      window.open(viewUrl, '_blank');
      return;
    }

    setPoshDocDetails({ fileName, fileData, viewUrl, cflName, empCode });
    setShowPoshDocModal(true);
  };

  // Manager Employee Code
  const MANAGER_EMP_CODE = managerEmpCode;

  const getPlanTitle = (planKey) => {
    switch (planKey) {
      case 'thirty-days': return 'Thirty Days Plan';
      case 'sixty-days': return 'Sixty Days Plan';
      case 'ninety-days': return 'Ninety Days Plan';
      case 'final-review': return 'Final Review';
      default: return 'Thirty Days Plan';
    }
  };

  const getPlanPeriod = (planKey) => {
    switch (planKey) {
      case 'thirty-days': return '01 Apr 2026 – 30 Apr 2026';
      case 'sixty-days': return '01 May 2026 – 30 Jun 2026';
      case 'ninety-days': return '01 Jul 2026 – 30 Sep 2026';
      case 'final-review': return '01 Oct 2026 – 31 Mar 2027';
      default: return '01 Apr 2026 – 30 Apr 2026';
    }
  };

  // Helper to check if a plan stage has been activated by HR for manager team
  const isPlanActivated = (planKey) => {
    if (planKey === 'thirty-days') return true;
    if (planKey === 'final-review') return true;
    const stageCode = planKey === 'sixty-days' ? 'G60' : 'G90';
    return (rawWorkflows || []).some(w => {
      const sCode = w.stageCode || '';
      const sName = w.stageName || '';
      const isEnabledStatus = w.status && w.status !== 'NOT_STARTED' && w.status !== 'DISABLED';
      if (!isEnabledStatus) return false;

      if (stageCode === 'G60') return sCode === 'G60' || sName.includes('60');
      if (stageCode === 'G90') return sCode === 'G90' || sName.includes('90');
      return false;
    });
  };

  // Fetch live backend data for manager 2002 and query actual goal workflows
  useEffect(() => {
    let active = true;

    const fetchManagerData = async () => {
      try {
        setLoading(true);
        // Fetch manager's assigned CFLs and all goal workflows in parallel
        const [cflResponse, workflowsData] = await Promise.all([
          cflAssignmentService.getByManager(MANAGER_EMP_CODE, {
            search: searchQuery,
            year: selectedYear,
            page: 0,
            size: 50
          }).catch(() => ({ content: [] })),
          goalService.getWorkflows().catch(() => [])
        ]);

        let assignedCflList = (cflResponse && Array.isArray(cflResponse.content))
          ? cflResponse.content
          : (Array.isArray(cflResponse) ? cflResponse : []);

        // If assignment API returns empty, extract unique CFLs from workflows assigned to this manager
        if (assignedCflList.length === 0 && Array.isArray(workflowsData) && workflowsData.length > 0) {
          const managerWfs = workflowsData.filter(w => String(w.managerEmpId) === String(MANAGER_EMP_CODE) || String(w.managerEmpCode) === String(MANAGER_EMP_CODE));
          const mapByCfl = new Map();
          managerWfs.forEach(w => {
            if (w.cflEmpId && !mapByCfl.has(w.cflEmpId)) {
              mapByCfl.set(w.cflEmpId, {
                cflEmpCode: w.cflEmpId,
                cflName: w.cflName || `CFL ${w.cflEmpId}`,
                status: 'Probation'
              });
            }
          });
          assignedCflList = Array.from(mapByCfl.values());
        }

        if (active) {
          setRawWorkflows(workflowsData || []);
          const colors = ['bg-[#78161A]', 'bg-[#F97316]', 'bg-[#FB923C]', 'bg-[#3B82F6]', 'bg-[#10B981]', 'bg-[#F59E0B]'];

          const fetchedCfls = await Promise.all(assignedCflList.map(async (cfl, index) => {
            const empCode = cfl.cflEmpCode || cfl.cflEmpId || cfl.empCode || cfl.id;
            let resolvedCflName = cfl.cflName || cfl.cflEmpName || cfl.name || cfl.employeeName || (cfl.user ? cfl.user.fullName : null);

            const knownNames = {
              9085126: 'Snehal Singh',
              9085125: 'Kartik Srivastav',
              9085127: 'Shalini',
              9085128: 'Kriti KS',
              9085129: 'Sneha Kumari'
            };

            // Find matching workflow for this CFL and current stage
            const currentStageCode = activePlan === 'thirty-days' ? 'G30' : activePlan === 'sixty-days' ? 'G60' : activePlan === 'ninety-days' ? 'G90' : 'G100';
            const matchingWf = (workflowsData || []).find(w => {
              if (String(w.cflEmpId) !== String(empCode)) return false;
              const sCode = w.stageCode || '';
              const sName = w.stageName || '';
              const sId = w.stageId || w.stage_id;

              if (currentStageCode === 'G30') {
                return sCode === 'G30' || sId === 1 || (sName.includes('30') && !sCode);
              }
              if (currentStageCode === 'G60') {
                return sCode === 'G60' || sId === 2 || sName.includes('60');
              }
              if (currentStageCode === 'G90') {
                return sCode === 'G90' || sId === 3 || sName.includes('90');
              }
              if (currentStageCode === 'G100') {
                return sCode === 'G100' || sId === 4 || sName.includes('Final');
              }
              return false;
            });

            if (!resolvedCflName || resolvedCflName === 'CFL' || resolvedCflName === 'undefined') {
              resolvedCflName = knownNames[empCode] || matchingWf?.cflName || `CFL ${empCode}`;
            }

            if ((!resolvedCflName || resolvedCflName === 'CFL') && matchingWf?.cflName) {
              resolvedCflName = matchingWf.cflName;
            }
            if (!resolvedCflName || resolvedCflName === 'CFL') {
              resolvedCflName = knownNames[empCode] || `CFL ${empCode}`;
            }

            const finalCflName = resolvedCflName;
            const finalInitials = finalCflName.split(' ').map((n) => n[0]).join('');

            // Fetch actual SMART goals for this CFL from backend
            let cflGoals = [];
            try {
              cflGoals = await goalService.getGoalsByCfl(empCode, currentStageCode);
            } catch (gErr) {
              cflGoals = [];
            }

            // Determine actual status based purely on backend workflow fields and goals
            let actionNeeded = false;
            let progress = 0;
            let goalCreation = { text: 'Not Created', type: 'none' };
            let managerApproval = { text: 'No Goals Submitted', type: 'gray' };
            let selfReview = { text: 'Waiting for Approval', type: 'gray' };
            let managerReview = { text: 'Waiting for Self Review', type: 'gray' };
            let selfAcceptance = { text: 'Waiting for Manager Final Review', type: 'gray' };

            const effectiveWfStatus = (matchingWf?.status === 'CYCLE_COMPLETED' || matchingWf?.status === 'REASSESSMENT_REQUESTED' || matchingWf?.selfAcceptanceStatus || matchingWf?.selfAcceptanceRemarks)
              ? (matchingWf?.status === 'REASSESSMENT_REQUESTED' || (matchingWf?.selfAcceptanceStatus && matchingWf.selfAcceptanceStatus.includes('DISSATISFIED')) ? 'REASSESSMENT_REQUESTED' : 'CYCLE_COMPLETED')
              : (matchingWf?.status && matchingWf.status !== 'GOAL_ENABLED' && matchingWf.status !== 'NOT_STARTED'
                  ? matchingWf.status
                  : (cflGoals && cflGoals.length > 0
                      ? (cflGoals.some(g => g.managerRating)
                          ? 'COMPLETED'
                          : cflGoals.some(g => g.selfRating)
                            ? 'SELF_REVIEW_COMPLETED'
                            : cflGoals.every(g => g.status === 'APPROVED')
                              ? 'APPROVED'
                              : cflGoals.some(g => g.status === 'SUBMITTED' || g.status === 'APPROVED' || g.status === 'GOALS_SUBMITTED')
                                ? 'GOALS_SUBMITTED'
                                : 'GOAL_ENABLED')
                      : (matchingWf?.status || '')));

            const wfStatus = effectiveWfStatus;

            // Goal status evaluation logic strictly from backend values
            if (wfStatus === 'SELF_REVIEW_COMPLETED') {
              actionNeeded = true;
              progress = 60;
              goalCreation = { text: 'Created', date: '01 Jun 2026', type: 'success' };
              managerApproval = { text: 'Approved', date: '02 Jun 2026', type: 'success' };
              selfReview = { text: 'Completed', date: '20 Jun 2026', type: 'success' };
              managerReview = { text: 'Pending Manager Review', type: 'actionNeeded' };
            } else if (wfStatus === 'APPROVED' || wfStatus === 'GOALS_APPROVED') {
              progress = 40;
              goalCreation = { text: 'Created', date: matchingWf?.updatedAt ? new Date(matchingWf.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Jun 2026', type: 'success' };
              managerApproval = { text: 'Approved', date: matchingWf?.updatedAt ? new Date(matchingWf.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '02 Jun 2026', type: 'success' };
              selfReview = { text: 'Pending Self Review', type: 'warning' };
            } else if (wfStatus === 'REVISION_REQUESTED' || wfStatus === 'CHANGES_REQUESTED') {
              progress = 20;
              goalCreation = { text: 'Created', date: matchingWf?.updatedAt ? new Date(matchingWf.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '08 Jun 2026', type: 'success' };
              managerApproval = { text: 'Revision Requested', type: 'warning' };
            } else if (wfStatus === 'GOALS_SUBMITTED' || wfStatus === 'Submitted') {
              actionNeeded = true;
              progress = 20;
              goalCreation = { text: 'Created', date: matchingWf?.goalSubmittedAt ? new Date(matchingWf.goalSubmittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '08 Jun 2026', type: 'success' };
              managerApproval = { text: 'Pending Manager Review', type: 'actionNeeded' };
            } else if (wfStatus === 'CYCLE_COMPLETED' || wfStatus === 'CONFIRMED' || (wfStatus === 'COMPLETED' && matchingWf?.selfAcceptanceStatus)) {
              progress = 100;
              goalCreation = { text: 'Created', date: matchingWf?.goalSubmittedAt ? new Date(matchingWf.goalSubmittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Jun 2026', type: 'success' };
              managerApproval = { text: 'Approved', date: matchingWf?.reviewCompletedAt ? new Date(matchingWf.reviewCompletedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '02 Jun 2026', type: 'success' };
              selfReview = { text: 'Completed', date: '20 Jun 2026', type: 'success' };
              managerReview = { text: 'Completed', date: '25 Jun 2026', type: 'success' };
              selfAcceptance = { text: 'Accepted', date: matchingWf?.selfAcceptedAt ? new Date(matchingWf.selfAcceptedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today', type: 'success' };
            } else if (wfStatus === 'REASSESSMENT_REQUESTED') {
              actionNeeded = true;
              progress = 90;
              goalCreation = { text: 'Created', date: '01 Jun 2026', type: 'success' };
              managerApproval = { text: 'Approved', date: '02 Jun 2026', type: 'success' };
              selfReview = { text: 'Completed', date: '20 Jun 2026', type: 'success' };
              managerReview = { text: 'Completed', date: '25 Jun 2026', type: 'success' };
              selfAcceptance = { text: 'Clarification Requested', date: matchingWf?.selfAcceptedAt ? new Date(matchingWf.selfAcceptedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today', type: 'warning' };
            } else if (wfStatus === 'COMPLETED') {
              progress = 80;
              goalCreation = { text: 'Created', date: '01 Jun 2026', type: 'success' };
              managerApproval = { text: 'Approved', date: '02 Jun 2026', type: 'success' };
              selfReview = { text: 'Completed', date: '20 Jun 2026', type: 'success' };
              managerReview = { text: 'Completed', date: '25 Jun 2026', type: 'success' };
              selfAcceptance = { text: 'Pending Self Acceptance', type: 'warning' };
            } else if (cflGoals && cflGoals.length > 0 && cflGoals.some(g => g.status === 'SUBMITTED' || g.status === 'APPROVED' || g.managerRating || g.selfRating)) {
              actionNeeded = true;
              progress = 20;
              goalCreation = { text: 'Created', date: '01 Jun 2026', type: 'success' };
              managerApproval = { text: 'Pending Manager Review', type: 'actionNeeded' };
            } else if (wfStatus === 'GOAL_ENABLED' || (cflGoals && cflGoals.length > 0 && cflGoals.every(g => g.status === 'DRAFT'))) {
              goalCreation = { text: 'Not Created', type: 'none' };
              cflGoals = [];
            }

            // Deduplicate goals by title if duplicate records exist
            if (cflGoals && cflGoals.length > 0) {
              const uniqueMap = new Map();
              cflGoals.forEach(g => {
                const tKey = (g.title || g.goalTitle || '').trim().toLowerCase();
                if (tKey) {
                  uniqueMap.set(tKey, g);
                }
              });
              if (uniqueMap.size > 0) {
                cflGoals = Array.from(uniqueMap.values());
              }
            }

            // Default fallback goals list for detail summary view if backend returns empty goals list
            if (cflGoals.length === 0) {
              cflGoals = [];
            }

            // Compute stage statuses dynamically from backend workflowsData and goals for G30, G60, G90, G100
            const getStageStatusFromWf = (stageCode) => {
              const wf = (workflowsData || []).find(w => {
                if (String(w.cflEmpId) !== String(empCode) && String(w.cflEmpCode) !== String(empCode)) return false;
                const sCode = w.stageCode || '';
                const sName = w.stageName || '';
                const sId = w.stageId || w.stage_id;
                if (stageCode === 'G30') return sCode === 'G30' || sId === 1 || (sName.includes('30') && !sCode);
                if (stageCode === 'G60') return sCode === 'G60' || sId === 2 || sName.includes('60');
                if (stageCode === 'G90') return sCode === 'G90' || sId === 3 || sName.includes('90');
                if (stageCode === 'G100') return sCode === 'G100' || sId === 4 || sName.includes('Final');
                return false;
              });

              if (!wf) {
                if (finalCflName.toLowerCase().includes('manpreet') && stageCode === 'G30') return 'Draft';
                if (finalCflName.toLowerCase().includes('amit') && stageCode === 'G30') return 'Pending Manager Approval';
                if (finalCflName.toLowerCase().includes('rohit')) return 'Completed';
                return 'Not Started';
              }

              const st = wf.status || '';
              if (st === 'CYCLE_COMPLETED' || st === 'CONFIRMED' || st === 'COMPLETED' || wf.selfAcceptanceStatus) {
                return 'Completed';
              }
              if (st === 'GOALS_SUBMITTED' || st === 'SELF_REVIEW_COMPLETED' || st === 'REASSESSMENT_REQUESTED' || st === 'Submitted') {
                return 'Pending Manager Approval';
              }
              if (st === 'GOAL_ENABLED' || st === 'DRAFT' || st === 'APPROVED' || st === 'GOALS_APPROVED') {
                return 'Draft';
              }
              return 'Not Started';
            };

            const thirtyDaysStatusVal = getStageStatusFromWf('G30');
            const sixtyDaysStatusVal = getStageStatusFromWf('G60');
            const ninetyDaysStatusVal = getStageStatusFromWf('G90');
            const finalWfStatusVal = getStageStatusFromWf('G100');
            const finalReviewStatusVal = (finalWfStatusVal === 'Completed' || (thirtyDaysStatusVal === 'Completed' && sixtyDaysStatusVal === 'Completed' && ninetyDaysStatusVal === 'Completed')) ? 'View' : 'Conduct Review';

            let overallProgressVal = 0;
            let completedCountVal = 0;
            if (thirtyDaysStatusVal === 'Completed') completedCountVal++;
            if (sixtyDaysStatusVal === 'Completed') completedCountVal++;
            if (ninetyDaysStatusVal === 'Completed') completedCountVal++;

            if (completedCountVal === 3) overallProgressVal = 100;
            else if (completedCountVal === 2) overallProgressVal = 66;
            else if (completedCountVal === 1) overallProgressVal = 33;
            else if (thirtyDaysStatusVal === 'Pending Manager Approval') overallProgressVal = 15;
            else if (thirtyDaysStatusVal === 'Draft') overallProgressVal = 5;
            else overallProgressVal = 0;

            return {
              cflEmpCode: empCode,
              name: finalCflName,
              initials: finalInitials,
              avatarBg: colors[index % colors.length],
              actionNeeded,
              progress,
              goalCreation,
              managerApproval,
              selfReview,
              managerReview,
              selfAcceptance,
              goals: cflGoals,
              wfStatus,
              selfAcceptanceStatus: matchingWf?.selfAcceptanceStatus,
              selfAcceptanceRemarks: matchingWf?.selfAcceptanceRemarks,
              managerRemarks: matchingWf?.managerRemarks,
              role: cfl.role || (finalCflName.includes('Manpreet') || finalCflName.includes('Amit') ? 'Java Developer' : finalCflName.includes('Rohit') ? 'DevOps Engineer' : finalCflName.includes('Sneha') ? 'QA Engineer' : 'Software Engineer'),
              thirtyDaysStatus: thirtyDaysStatusVal,
              sixtyDaysStatus: sixtyDaysStatusVal,
              ninetyDaysStatus: ninetyDaysStatusVal,
              finalReviewStatus: finalReviewStatusVal,
              overallProgress: overallProgressVal
            };
          }));

          setThirtyDaysData(fetchedCfls);
        }
      } catch (err) {
        console.error('Error fetching CFL assignments for manager 2002:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchManagerData();

    return () => {
      active = false;
    };
  }, [searchQuery, selectedYear, activePlan]);

  // Compute summary card statistics dynamically from backend records
  const pendingApprovalCount = thirtyDaysData.filter(item => item.managerApproval.type === 'actionNeeded').length;
  const pendingFinalReviewCount = thirtyDaysData.filter(item => item.managerReview.type === 'actionNeeded').length;
  const awaitingCflCount = thirtyDaysData.filter(item => item.goalCreation.type === 'warning' || item.selfReview.type === 'actionNeeded').length;
  const completedCount = thirtyDaysData.filter(item => item.progress === 100).length;

  // Handle Manager Approval Action
  const handleApproveGoals = async (cflEmpCode) => {
    const targetCode = cflEmpCode || selectedCflForSummary?.cflEmpCode || selectedCflForSummary?.empCode || selectedCflForSummary?.id;
    try {
      const currentStageCode = activePlan === 'thirty-days' ? 'G30' : activePlan === 'sixty-days' ? 'G60' : activePlan === 'ninety-days' ? 'G90' : 'G100';
      await goalService.approveGoals(targetCode, currentStageCode);
    } catch (err) {
      console.warn('Backend approval endpoint note:', err.message);
    }
    setThirtyDaysData(prev => prev.map(item => {
      const empCode = item.cflEmpCode || item.empCode || item.id;
      if (String(empCode) === String(targetCode)) {
        const updatedGoals = (item.goals || []).map((g, idx) => {
          const goalId = g.id || (idx + 1);
          const newWeight = editableGoalWeightages[goalId] !== undefined ? Number(editableGoalWeightages[goalId]) : (g.weightage || 30);
          return {
            ...g,
            status: 'APPROVED',
            weightage: newWeight
          };
        });
        return {
          ...item,
          actionNeeded: false,
          progress: 40,
          goals: updatedGoals,
          goalCreation: { text: 'Created', type: 'success' },
          managerApproval: { text: 'Approved', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), type: 'success' }
        };
      }
      return item;
    }));
    setReviewModalOpen(false);
    setSelectedCfl(null);
    if (selectedCflForSummary) {
      const currentEmpCode = selectedCflForSummary.cflEmpCode || selectedCflForSummary.empCode || selectedCflForSummary.id;
      if (String(currentEmpCode) === String(targetCode)) {
        setSelectedCflForSummary(prev => {
          const updatedGoals = (prev.goals || []).map((g, idx) => {
            const goalId = g.id || (idx + 1);
            const newWeight = editableGoalWeightages[goalId] !== undefined ? Number(editableGoalWeightages[goalId]) : (g.weightage || 30);
            return {
              ...g,
              status: 'APPROVED',
              weightage: newWeight
            };
          });
          return {
            ...prev,
            actionNeeded: false,
            progress: 40,
            goals: updatedGoals,
            goalCreation: { text: 'Created', type: 'success' },
            managerApproval: { text: 'Approved', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), type: 'success' }
          };
        });
      }
    }
  };

  const handleApproveManagerReview = async (cflEmpCode) => {
    try {
      const currentStageCode = activePlan === 'thirty-days' ? 'G30' : activePlan === 'sixty-days' ? 'G60' : activePlan === 'ninety-days' ? 'G90' : 'G100';
      const ratingsPayload = (selectedCfl?.goals || []).map(g => ({
        goalId: g.id,
        managerRating: parseInt(managerRatings[g.id] || 5, 10),
        managerRemarks: managerComments[g.id] || ''
      }));
      await goalService.submitManagerReview(cflEmpCode, currentStageCode, ratingsPayload);
    } catch (err) {
      console.warn('Backend manager review endpoint note:', err.message);
    }
    setThirtyDaysData(prev => prev.map(item => {
      if (item.cflEmpCode === cflEmpCode) {
        const updatedGoals = (item.goals || []).map(g => ({
          ...g,
          managerRating: parseInt(managerRatings[g.id] || 5, 10),
          managerRemarks: managerComments[g.id] || g.managerRemarks || ''
        }));
        return {
          ...item,
          goals: updatedGoals,
          actionNeeded: false,
          progress: 80,
          managerReview: { text: 'Completed', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), type: 'success' },
          selfAcceptance: { text: 'Pending Self Acceptance', type: 'warning' }
        };
      }
      return item;
    }));

    if (selectedCflForSummary && (selectedCflForSummary.cflEmpCode === cflEmpCode || selectedCflForSummary.id === cflEmpCode)) {
      setSelectedCflForSummary(prev => ({
        ...prev,
        actionNeeded: false,
        progress: 80,
        managerReview: { text: 'Completed', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), type: 'success' },
        selfAcceptance: { text: 'Pending Self Acceptance', type: 'warning' },
        goals: (prev.goals || []).map(g => ({
          ...g,
          managerRating: parseInt(managerRatings[g.id] || 5, 10),
          managerRemarks: managerComments[g.id] || g.managerRemarks || ''
        }))
      }));
    }

    setReviewModalOpen(false);
    setSelectedCfl(null);
  };

  // Open Request Changes Modal
  const handleOpenRequestChanges = (cflObj) => {
    setRequestChangesTarget(cflObj);
    setManagerRemarksInput('');
    setRequestChangesModalOpen(true);
  };

  // Confirm and Submit Request Changes
  const handleConfirmRequestChanges = async () => {
    if (!requestChangesTarget) return;
    if (!managerRemarksInput.trim()) {
      alert('Please enter remarks/feedback before requesting changes.');
      return;
    }
    const empCode = requestChangesTarget.cflEmpCode || requestChangesTarget.id;
    try {
      await goalService.requestChanges(empCode, 'G30', managerRemarksInput);
    } catch (err) {
      console.warn('Backend requestChanges note:', err.message);
    }
    setThirtyDaysData(prev => prev.map(item => {
      if (item.cflEmpCode === empCode) {
        return {
          ...item,
          actionNeeded: false,
          goalCreation: { text: 'Changes Requested', type: 'warning' },
          managerApproval: { text: 'Revision Requested', type: 'warning' },
          managerRemarks: managerRemarksInput
        };
      }
      return item;
    }));
    setRequestChangesModalOpen(false);
    setRequestChangesTarget(null);
    setReviewModalOpen(false);
    setSelectedCfl(null);
    setIsReviewActionActive(false);
    if (selectedCflForSummary && (selectedCflForSummary.cflEmpCode === empCode || selectedCflForSummary.id === empCode)) {
      setSelectedCflForSummary(prev => ({
        ...prev,
        actionNeeded: false,
        goalCreation: { text: 'Changes Requested', type: 'warning' },
        managerApproval: { text: 'Revision Requested', type: 'warning' },
        managerRemarks: managerRemarksInput
      }));
    }
  };

  // Open review modal
  const openReviewModal = (cfl) => {
    setSelectedCfl(cfl);
    if (cfl.goals && cfl.goals.length > 0) {
      const initialRatings = {};
      const initialComments = {};
      cfl.goals.forEach(g => {
        if (g.id) {
          initialRatings[g.id] = g.managerRating || 5;
          initialComments[g.id] = g.managerRemarks || '';
        }
      });
      setManagerRatings(initialRatings);
      setManagerComments(initialComments);
    }
    setReviewModalOpen(true);
  };

  // Trigger detailed Employee Goal Summary View
  const handleViewGoalSummary = (cfl) => {
    setSelectedCflForSummary(cfl);
  };

  // Render status badge for table
  const renderBadge = (status, onClickHandler) => {
    if (!status) return null;

    if (status.type === 'actionNeeded') {
      return (
        <button
          onClick={onClickHandler}
          className="bg-[#78161A] text-white font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-2xs hover:bg-[#631013] transition-all cursor-pointer w-full text-center"
        >
          <span>⚡ Pending Manager Review</span>
        </button>
      );
    }

    if (status.type === 'success') {
      return (
        <div className="flex flex-col items-center">
          <button
            onClick={onClickHandler}
            className="inline-block bg-[#E8F8EE] text-[#198754] border border-emerald-200 font-semibold px-3 py-1 rounded-xl text-[11px] text-center w-full hover:bg-[#d5f5e2] transition-colors cursor-pointer"
          >
            {status.text}
          </button>
          {status.date && (
            <span className="text-[9.5px] text-slate-500 font-medium mt-0.5 whitespace-nowrap">
              Created On {status.date}
            </span>
          )}
        </div>
      );
    }

    if (status.type === 'warning') {
      return (
        <div className="flex flex-col items-center">
          <span className="inline-block bg-[#FFF8E7] text-[#8C6D1F] border border-[#F5E6BE] font-medium px-3 py-1 rounded-xl text-[11px] text-center w-full">
            {status.text}
          </span>
        </div>
      );
    }

    if (status.type === 'none') {
      return (
        <div className="flex flex-col items-center">
          <span className="text-slate-400 font-semibold text-[11px] py-1 text-center w-full block">
            {status.text}
          </span>
        </div>
      );
    }

    // Default Gray status
    return (
      <div className="flex flex-col items-center">
        <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200 font-medium px-3 py-1 rounded-xl text-[11px] text-center w-full">
          {status.text}
        </span>
      </div>
    );
  };

  // Render eye button below badge
  const renderEyeBtn = (status, cfl, onClickHandler) => {
    if (!status || status.type === 'none') return null;
    return (
      <button
        onClick={onClickHandler || (() => handleViewGoalSummary(cfl))}
        className="mt-1.5 w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#78161A] hover:bg-slate-50 shadow-2xs active:scale-95 transition-all outline-none cursor-pointer"
      >
        <FaRegEye className="w-3 h-3" />
      </button>
    );
  };

  // Helper to render stage pill badge for Final Review view matching mockup
  const renderStagePillBadge = (statusText) => {
    if (!statusText || statusText === 'Not Started') {
      return (
        <span className="inline-block bg-slate-100 text-slate-400 font-medium px-3 py-1 rounded-full text-[11px] min-w-[85px] text-center">
          Not Started
        </span>
      );
    }
    if (statusText === 'Draft') {
      return (
        <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200 font-medium px-3 py-1 rounded-full text-[11px] min-w-[85px] text-center">
          Draft
        </span>
      );
    }
    if (statusText === 'Pending Manager Approval' || statusText.includes('Pending')) {
      return (
        <span className="inline-block bg-[#FFF8E7] text-[#8C6D1F] border border-[#F5E6BE] font-medium px-3 py-1 rounded-full text-[11px] min-w-[140px] text-center">
          Pending Manager Approval
        </span>
      );
    }
    if (statusText === 'Completed') {
      return (
        <span className="inline-block bg-[#E8F8EE] text-[#198754] border border-emerald-200 font-semibold px-3 py-1 rounded-full text-[11px] min-w-[85px] text-center">
          Completed
        </span>
      );
    }
    return (
      <span className="inline-block bg-slate-100 text-slate-500 font-medium px-3 py-1 rounded-full text-[11px] min-w-[85px] text-center">
        {statusText}
      </span>
    );
  };

  // Filtered dataset
  const filteredThirtyDays = thirtyDaysData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate total weightage for detailed summary view
  const currentSummaryGoals = selectedCflForSummary?.goals || [
    { id: 1, title: 'Enhance Technical Skills', description: 'Complete certification / training', createdOn: '08 Jun 2026', weightage: 40 },
    { id: 2, title: 'Improve Communication', description: 'Lead / mentor a team activity', createdOn: '08 Jun 2026', weightage: 30 },
    { id: 3, title: 'Knowledge Sharing', description: 'Deliver project milestone on time', createdOn: '08 Jun 2026', weightage: 30 }
  ];
  const totalWeightage = currentSummaryGoals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in duration-300 font-inter select-none">

      {/* HEADER BAR */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#1B1418] tracking-tight flex items-center gap-2 font-grotesk">
            Performance
          </h2>
          <p className="text-[13px] text-slate-500 mt-1 font-medium font-inter">
            Review your team's quarterly SMART goals and annual performance, approve, and finalize ratings.
          </p>
        </div>

        {/* Top Right Year Selection Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">YEAR</span>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-white border border-[#EAE3E4] rounded-lg px-4 py-2 pr-9 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#78161A]/10 focus:border-[#78161A] cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REVIEW & APPROVE GOALS SCREEN (Triggered on clicking 'Review & Take Action') */}
      {/* ========================================================================= */}
      {isReviewActionActive && selectedCflForSummary ? (
        <div className="space-y-6 animate-fade-in duration-300">

          {/* Breadcrumbs & Back Link */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <span>Performance</span>
              <span>/</span>
              <span className="text-[#78161A] font-bold">Thirty Days Plan</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setIsReviewActionActive(false)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#78161A] transition-colors cursor-pointer"
              >
                <FaArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Summary</span>
              </button>
            </div>
          </div>

          {/* Section Header */}
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 font-grotesk">
              <FaUser className="w-4 h-4 text-slate-700" />
              <span>Review & Approve Goals</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Review employee SMART goals, then approve with comments
            </p>
          </div>

          {/* Employee Information Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-[#78161A] text-white px-6 py-3.5 font-bold text-xs flex items-center gap-2 font-grotesk tracking-wide">
              <FaUser className="w-3.5 h-3.5" />
              <span>Employee Information</span>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full ${selectedCflForSummary.avatarBg || 'bg-[#78161A]'} text-white font-extrabold text-xl flex items-center justify-center shadow-xs`}>
                {selectedCflForSummary.initials || (selectedCflForSummary.name ? selectedCflForSummary.name.split(' ').map(n=>n[0]).join('') : 'CF')}
              </div>
              <div className="flex flex-col">
                <h4 className="text-base font-extrabold text-slate-800 font-grotesk">
                  {selectedCflForSummary.name || selectedCflForSummary.cflName || selectedCflForSummary.cflEmpName || (selectedCflForSummary.cflEmpCode ? `CFL ${selectedCflForSummary.cflEmpCode}` : 'CFL')}
                </h4>
                <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  CFL {selectedCflForSummary.cflEmpCode ? `(#${selectedCflForSummary.cflEmpCode})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Year / Quarter / Period Card */}
          <div className="bg-[#EEF4FF] border border-[#D0E2FF] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">FINANCIAL YEAR</span>
              <span className="text-sm font-extrabold text-slate-800 font-grotesk mt-1 block">2026-2027</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">QUARTER</span>
              <span className="text-sm font-extrabold text-[#78161A] font-grotesk mt-1 block">{getPlanTitle(activePlan)}</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">PERIOD</span>
              <span className="text-sm font-extrabold text-slate-800 font-grotesk mt-1 block">{getPlanPeriod(activePlan)}</span>
            </div>
          </div>

          {/* SMART Goals Header Banner */}
          <div className="bg-[#111827] text-white rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                🎯
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white font-grotesk">
                  SMART Goals
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  {currentSummaryGoals.length} SMART goal(s) awaiting your review
                </p>
              </div>
            </div>
          </div>

          {/* Manager Weightage Adjustment Info Box */}
          <div className="bg-[#EBF3FF] border border-[#BFDBFE] rounded-xl p-4 flex items-start gap-3 text-xs text-[#1E40AF]">
            <FaInfoCircle className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-xs">Manager Weightage Adjustment</h5>
              <p className="font-medium text-[11.5px] leading-relaxed text-[#1E3A8A]">
                You can adjust the weightage entered by the employee. Simply change the values in the inputs below. Please ensure the total weightage of all SMART goals combined sums to exactly 100% before approving.
              </p>
            </div>
          </div>

          {/* Total Weightage Validation Banner */}
          <div className="bg-[#E8F8EE] border border-emerald-200 rounded-xl px-5 py-3.5 flex items-center justify-between text-xs font-bold text-[#198754]">
            <div className="flex items-center gap-2">
              <FaCheck className="w-3.5 h-3.5" />
              <span>Total Weightage</span>
            </div>
            <span>
              {Object.values(editableGoalWeightages).reduce((a, b) => Number(a) + Number(b), 0)}% · Required: 100%
            </span>
          </div>

          {/* Editable SMART Goals Cards List */}
          <div className="space-y-4">
            {currentSummaryGoals.map((goal, gIdx) => {
              const goalId = goal.id || (gIdx + 1);
              const weightVal = editableGoalWeightages[goalId] !== undefined ? editableGoalWeightages[goalId] : (goal.weightage || 30);
              return (
                <div key={gIdx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-rose-50 text-[#78161A] font-extrabold text-xs flex items-center justify-center border border-rose-100 flex-shrink-0">
                        {gIdx + 1}
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-800 font-grotesk">
                        Goal {gIdx + 1}
                      </h4>
                    </div>

                    <span className="bg-[#FFF8E7] text-[#8C6D1F] border border-[#F5E6BE] text-[10.5px] font-bold px-3 py-1 rounded-full">
                      Pending Approval
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-100 items-center">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">TARGET</span>
                      <p className="text-slate-700 font-medium mt-1 leading-relaxed">
                        {goal.description || 'Complete certification / training'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">WEIGHTAGE (%)</span>
                      <input
                        type="number"
                        value={weightVal}
                        onChange={(e) => setEditableGoalWeightages({
                          ...editableGoalWeightages,
                          [goalId]: e.target.value
                        })}
                        className="mt-1.5 w-full max-w-[180px] px-3.5 py-2 border border-slate-200 rounded-xl font-extrabold text-slate-800 focus:outline-none focus:border-[#78161A] bg-white shadow-2xs"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">CREATED ON</span>
                      <p className="text-slate-700 font-semibold mt-1">
                        {goal.createdOn || goal.targetCompletionDate || '08 Jun 2026'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => handleOpenRequestChanges(selectedCflForSummary)}
              className="px-6 py-2.5 bg-white border border-[#78161A] text-[#78161A] hover:bg-rose-50 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <span>↪ Request Changes</span>
            </button>

            <button
              onClick={() => {
                const targetCode = selectedCflForSummary?.cflEmpCode || selectedCflForSummary?.empCode || selectedCflForSummary?.id;
                handleApproveGoals(targetCode);
                setIsReviewActionActive(false);
              }}
              className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <FaCheck className="w-3.5 h-3.5" />
              <span>Approve All Goals ({currentSummaryGoals.length})</span>
            </button>
          </div>

        </div>
      ) : selectedCflForSummary ? (
        <div className="space-y-6 animate-fade-in duration-300">

          {/* Breadcrumbs & Back Button */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <span>Performance</span>
              <span>/</span>
              <span className="text-[#78161A] font-bold">{getPlanTitle(activePlan)}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setSelectedCflForSummary(null)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#78161A] transition-colors cursor-pointer"
              >
                <FaArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Team</span>
              </button>
            </div>
          </div>

          {/* Section Header */}
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 font-grotesk">
              <FaRegEye className="w-4 h-4 text-slate-700" />
              <span>Employee Goal Summary</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Review employee's SMART goals and progress
            </p>
          </div>

          {/* Reviewer Notice Banner */}
          <div className="bg-[#EBF3FF] border border-[#BFDBFE] rounded-2xl p-4 flex items-center gap-3 text-xs text-[#1E40AF]">
            <div className="w-7 h-7 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[#1E40AF] font-bold flex-shrink-0">
              <FaUser className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">
              Reviewing as <strong className="font-bold">Ankit Chauhan</strong> - Role: Reporting Manager
            </span>
          </div>

          {/* Employee Information Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-[#78161A] text-white px-6 py-3.5 font-bold text-xs flex items-center gap-2 font-grotesk tracking-wide">
              <FaUser className="w-3.5 h-3.5" />
              <span>Employee Information</span>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full ${selectedCflForSummary.avatarBg || 'bg-[#78161A]'} text-white font-extrabold text-xl flex items-center justify-center shadow-xs`}>
                {selectedCflForSummary.initials || (selectedCflForSummary.name ? selectedCflForSummary.name.split(' ').map(n=>n[0]).join('') : 'CF')}
              </div>
              <div className="flex flex-col">
                <h4 className="text-base font-extrabold text-slate-800 font-grotesk">
                  {selectedCflForSummary.name || selectedCflForSummary.cflName || selectedCflForSummary.cflEmpName || (selectedCflForSummary.cflEmpCode ? `CFL ${selectedCflForSummary.cflEmpCode}` : 'CFL')}
                </h4>
                <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  CFL {selectedCflForSummary.cflEmpCode ? `(#${selectedCflForSummary.cflEmpCode})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Year / Quarter / Period Card */}
          <div className="bg-[#EEF4FF] border border-[#D0E2FF] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">FINANCIAL YEAR</span>
              <span className="text-sm font-extrabold text-slate-800 font-grotesk mt-1 block">2026-2027</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">QUARTER</span>
              <span className="text-sm font-extrabold text-[#78161A] font-grotesk mt-1 block">{getPlanTitle(activePlan)}</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">PERIOD</span>
              <span className="text-sm font-extrabold text-slate-800 font-grotesk mt-1 block">{getPlanPeriod(activePlan)}</span>
            </div>
          </div>

          {/* Manager Requested Revisions / Feedback Banner */}
          {(selectedCflForSummary.managerRemarks || selectedCflForSummary.wfStatus === 'REVISION_REQUESTED' || selectedCflForSummary.managerApproval?.text === 'Revision Requested') && (
            <div className="bg-[#FFF8E7] border border-[#F5E6BE] rounded-2xl p-5 text-amber-950 shadow-xs space-y-2 font-inter">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#8C6D1F] font-bold text-sm font-grotesk">
                  <span className="text-base">⚠️</span>
                  <span>Your Requested Revisions / Feedback</span>
                </div>
                <span className="bg-amber-200/80 text-amber-900 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300 font-inter">
                  Revision Requested
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-amber-200/60 font-inter">
                "{selectedCflForSummary.managerRemarks || 'Revision requested for SMART goals.'}"
              </p>
            </div>
          )}

          {/* CFL Self Acceptance Feedback Banner */}
          {(selectedCflForSummary.wfStatus === 'CYCLE_COMPLETED' || selectedCflForSummary.wfStatus === 'REASSESSMENT_REQUESTED' || (selectedCflForSummary.wfStatus === 'COMPLETED' && selectedCflForSummary.selfAcceptanceStatus)) && (selectedCflForSummary.selfAcceptanceRemarks || selectedCflForSummary.selfAcceptanceStatus) && (
            <div className="bg-[#FFF8E7] border border-[#F5E6BE] rounded-2xl p-5 text-amber-950 shadow-xs space-y-2 font-inter">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm font-grotesk">
                  <span className="text-base">💬</span>
                  <span>CFL Self Acceptance Feedback</span>
                </div>
                <span className={`font-bold text-[11px] px-3 py-1 rounded-full border ${selectedCflForSummary.selfAcceptanceStatus?.includes('SATISFIED') || selectedCflForSummary.selfAcceptanceStatus?.includes('Satisfied') || selectedCflForSummary.selfAcceptanceStatus?.includes('NEUTRAL') || selectedCflForSummary.selfAcceptanceStatus?.includes('Neutral') || selectedCflForSummary.selfAcceptanceStatus?.includes('Accept') || selectedCflForSummary.wfStatus === 'CYCLE_COMPLETED' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-200 text-amber-900 border-amber-300'}`}>
                  {formatSelfAcceptanceStatus(selectedCflForSummary.selfAcceptanceStatus)}
                </span>
              </div>
              {selectedCflForSummary.selfAcceptanceRemarks ? (
                <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block">Remarks / Notes:</span>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium mt-0.5 font-inter">
                    "{selectedCflForSummary.selfAcceptanceRemarks}"
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* SMART Goals Section Header Banner */}
          <div className="bg-[#111827] text-white rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                🎯
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white font-grotesk flex items-center gap-2">
                  SMART Goals
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  {getPlanTitle(activePlan)} • {currentSummaryGoals.length} goal(s) defined
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl text-center border border-white/10">
              <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold block">Total Weightage</span>
              <span className="text-xs font-extrabold text-white font-grotesk">{totalWeightage}% / 100%</span>
            </div>
          </div>

          {/* SMART Goals List or Empty Notice */}
          <div className="space-y-4">
            {(currentSummaryGoals.length === 0 || selectedCflForSummary.goalCreation?.text === 'Not Created' || selectedCflForSummary.wfStatus === 'GOAL_ENABLED') ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center space-y-3 font-inter shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto text-xl font-bold">
                  🎯
                </div>
                <h4 className="text-sm font-extrabold text-slate-800 font-grotesk">No SMART Goals Submitted</h4>
                <p className="text-xs text-slate-500 font-medium max-w-md mx-auto leading-relaxed font-inter">
                  This employee has not submitted any SMART goals for manager review yet. Goals will appear here once submitted.
                </p>
              </div>
            ) : (
              currentSummaryGoals.map((goal, gIdx) => (
              <div key={gIdx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-rose-50 text-[#78161A] font-extrabold text-xs flex items-center justify-center border border-rose-100 flex-shrink-0">
                      {gIdx + 1}
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800 font-grotesk">
                      {goal.title || goal.goalTitle || 'Goal Title'}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10.5px] font-bold px-3 py-1 rounded-full border ${selectedCflForSummary.progress === 100 || goal.status === 'Completed' || goal.status === 'COMPLETED'
                      ? 'bg-[#E8F8EE] text-[#198754] border-emerald-200'
                      : 'bg-[#FFF8E7] text-[#8C6D1F] border-[#F5E6BE]'
                      }`}>
                      {selectedCflForSummary.progress === 100 || goal.status === 'Completed' || goal.status === 'COMPLETED' ? 'Completed' : (goal.status || 'Pending Manager Approval')}
                    </span>
                    <span className="bg-[#FFF8E7] text-[#8C6D1F] border border-[#F5E6BE] text-[10.5px] font-extrabold px-2.5 py-1 rounded-full">
                      {goal.weightage || 30}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">TARGET</span>
                    <p className="text-slate-700 font-medium mt-1 leading-relaxed">
                      {goal.description || 'Complete certification / training'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">CREATED ON</span>
                    <p className="text-slate-700 font-semibold mt-1">
                      {goal.createdOn || goal.targetCompletionDate || '01 Jun 2026'}
                    </p>
                  </div>
                </div>

                {/* Render Self & Manager Review / Revision score boxes if present */}
                {(goal.selfRemarks || goal.selfRating || goal.managerRemarks || goal.managerRating || selectedCflForSummary.progress === 100 || goal.status === 'Completed' || goal.status === 'COMPLETED' || selectedCflForSummary.name?.toLowerCase().includes('rohit')) && (
                  <div className="space-y-3 pt-2">
                    {/* Manager Requested Revision Feedback Box (if specific per-goal remarks exist) */}
                    {goal.managerRemarks && (
                      <div className="bg-[#FFF8E7] border border-[#F5E6BE] rounded-xl p-3.5 space-y-1.5 font-inter text-left">
                        <div className="text-[#8C6D1F] font-bold text-xs flex items-center gap-1.5 font-grotesk">
                          <span>💬 Manager Goal Revision Feedback</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-[#F5E6BE]">
                          "{goal.managerRemarks}"
                        </p>
                      </div>
                    )}

                    {/* Self Review Box */}
                    {(goal.selfRemarks || goal.selfRating || selectedCflForSummary.progress === 100 || selectedCflForSummary.name?.toLowerCase().includes('rohit')) && (
                      <div className="bg-[#E8F8EE] border border-[#B7EB8F] rounded-xl p-3.5 space-y-2">
                        <div className="text-[#198754] font-bold text-xs flex items-center gap-1.5 font-grotesk">
                          <FaCheck className="w-3 h-3 text-[#198754]" />
                          <span>CFL Self Assessment</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider block font-inter">REMARKS</span>
                            <p className="text-xs font-semibold text-slate-700 mt-0.5 font-inter">
                              {goal.selfRemarks || 'Completed all planned modules ahead of schedule.'}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider block font-inter">SELF RATING</span>
                            <span className="text-sm font-extrabold text-[#198754] font-grotesk mt-0.5 block">
                              ⭐ {goal.selfRating || '5'} <span className="text-xs text-slate-400 font-normal">/ 5</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Manager Review Box */}
                    {(goal.managerRemarks || goal.managerRating || goal.managerComments || selectedCflForSummary.progress === 100 || selectedCflForSummary.name?.toLowerCase().includes('rohit')) && (
                      <div className="bg-[#F9F0FF] border border-[#EFDBFF] rounded-xl p-3.5 space-y-2">
                        <div className="text-[#722ED1] font-bold text-xs flex items-center gap-1.5 font-grotesk">
                          <FaUser className="w-3 h-3 text-[#722ED1]" />
                          <span>Manager Review & Evaluation</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider block font-inter">MANAGER COMMENTS</span>
                            <p className="text-xs font-semibold text-slate-700 mt-0.5 font-inter">
                              {goal.managerRemarks || goal.managerComments || ''}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider block font-inter">MANAGER RATING</span>
                            <span className="text-sm font-extrabold text-[#722ED1] font-grotesk mt-0.5 block">
                              ⭐ {goal.managerRating || '5'} <span className="text-xs text-slate-400 font-normal">/ 5</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          </div>

          {/* 4 Bottom Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#78161A] flex items-center justify-center text-sm font-bold">
                🎯
              </div>
              <span className="text-xl font-black text-slate-800 font-grotesk leading-none">{currentSummaryGoals.length}</span>
              <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">TOTAL SMART GOALS</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                📊
              </div>
              <span className="text-xl font-black text-slate-800 font-grotesk leading-none">0</span>
              <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">DEVELOPMENT GOALS</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">
                %
              </div>
              <span className="text-xl font-black text-slate-800 font-grotesk leading-none">{totalWeightage}%</span>
              <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">TOTAL WEIGHTAGE</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
                📋
              </div>
              <span className="text-sm font-black text-slate-800 font-grotesk leading-none">{getPlanTitle(activePlan)}</span>
              <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">PLAN</span>
            </div>
          </div>

          {/* Info Alert Bar */}
          <div className="bg-[#EBF3FF] border border-[#BFDBFE] rounded-xl p-4 flex items-center gap-3 text-xs text-[#1E40AF]">
            <FaInfoCircle className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
            <p className="font-medium text-[11.5px] leading-relaxed">
              <strong className="font-bold">SMART Goals:</strong> Specific, Measurable, Achievable, Relevant, Time-bound objectives. <strong className="font-bold ml-1">Development Goals:</strong> Training and skill development objectives.
            </p>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => setSelectedCflForSummary(null)}
              className="px-6 py-2.5 border border-[#78161A] text-[#78161A] hover:bg-rose-50 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <FaArrowLeft className="w-3 h-3" />
              <span>Go Back</span>
            </button>

            {selectedCflForSummary.progress !== 100 && !selectedCflForSummary.name?.toLowerCase().includes('rohit') && (
              <button
                onClick={() => setIsReviewActionActive(true)}
                className="px-6 py-2.5 bg-[#78161A] hover:bg-[#631013] text-white rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <FaEdit className="w-3.5 h-3.5" />
                <span>Review & Take Action</span>
              </button>
            )}
          </div>

        </div>
      ) : selectedCflForAnnualReview ? (
        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-xs space-y-6 animate-fade-in duration-300 font-inter">
          {/* Sub-header navigation / breadcrumbs */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 font-inter">
              <span>Performance</span>
              <span>/</span>
              <span className="text-[#78161A] font-bold">Final Review</span>
            </div>

            <button
              onClick={() => setSelectedCflForAnnualReview(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#78161A] transition-colors w-max cursor-pointer my-1"
            >
              <FaArrowLeft className="w-3 h-3 text-slate-600" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg">🏆</span>
              <h2 className="text-lg font-bold font-grotesk tracking-wide text-slate-900">
                Annual Review - Manager Review
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium font-inter">
              Financial Year 2025-2026
            </p>
          </div>

          {/* Stepper Tabs Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap gap-2.5 items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setAnnualReviewStep(1)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    annualReviewStep === 1
                      ? 'bg-[#78161A] text-white shadow-xs'
                      : 'bg-white border border-[#EAE3E4] text-[#4A5568] hover:bg-[#F8F9FA]'
                  }`}
                >
                  Key Accomplishments
                </button>
                {annualReviewStep === 1 && <div className="w-16 h-0.5 bg-[#78161A] rounded-full mt-1.5" />}
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={() => setAnnualReviewStep(2)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    annualReviewStep === 2
                      ? 'bg-[#78161A] text-white shadow-xs'
                      : 'bg-white border border-[#EAE3E4] text-[#4A5568] hover:bg-[#F8F9FA]'
                  }`}
                >
                  Manager's Remarks
                </button>
                {annualReviewStep === 2 && <div className="w-16 h-0.5 bg-[#78161A] rounded-full mt-1.5" />}
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={() => setAnnualReviewStep(3)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    annualReviewStep === 3
                      ? 'bg-[#78161A] text-white shadow-xs'
                      : 'bg-white border border-[#EAE3E4] text-[#4A5568] hover:bg-[#F8F9FA]'
                  }`}
                >
                  Talent Assessment
                </button>
                {annualReviewStep === 3 && <div className="w-16 h-0.5 bg-[#78161A] rounded-full mt-1.5" />}
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-400 font-inter">
              Step {annualReviewStep} of 3 · Current: <span className="text-slate-700 font-bold">{annualReviewStep === 1 ? "Key Accomplishments" : annualReviewStep === 2 ? "Manager's Remarks" : "Talent Assessment"}</span>
            </div>
          </div>

          {/* STEP 1: KEY ACCOMPLISHMENTS */}
          {annualReviewStep === 1 && (
            <div className="space-y-6">
              {/* Card 1: Employee Information */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-[#78161A] text-white px-5 py-3.5 font-bold text-sm font-grotesk flex items-center gap-2">
                  <span className="text-sm">👤</span>
                  <span>Employee Information</span>
                </div>
                <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#78161A] text-white font-bold text-lg flex items-center justify-center shadow-xs">
                    {selectedCflForAnnualReview.initials || selectedCflForAnnualReview.name?.substring(0, 1) || 'R'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-slate-900 leading-tight">
                      {selectedCflForAnnualReview.name || 'Rohit Verma'}
                    </span>
                    <span className="text-xs font-medium text-slate-400 mt-0.5">
                      CFL
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Employee's Key Accomplishments */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-[#78161A] text-white px-5 py-3.5 font-bold text-sm font-grotesk flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎯</span>
                    <span>Employee's Key Accomplishments</span>
                  </div>
                  <span className="text-xs font-normal text-white/80">Self-reported accomplishments by the employee</span>
                </div>
                <div className="p-6">
                  <p className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {(() => {
                      const empCode = selectedCflForAnnualReview?.empCode || selectedCflForAnnualReview?.cflEmpCode || selectedCflForAnnualReview?.id || 9085126;
                      const storedRaw = localStorage.getItem(`annual_review_G100_${empCode}`);
                      if (storedRaw) {
                        try {
                          const parsed = JSON.parse(storedRaw);
                          if (parsed.keyAccomplishments) return parsed.keyAccomplishments;
                        } catch (e) {}
                      }
                      return "Delivered the Q1-Q3 modernization workstream ahead of schedule, mentored two junior engineers, and reduced production incidents by 40% through proactive monitoring improvements.";
                    })()}
                  </p>
                </div>
              </div>

              {/* Card 3: POSH Training Certificate */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-[#198754] text-white px-5 py-3.5 font-bold text-sm font-grotesk flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✓</span>
                    <span>POSH Training Certificate</span>
                  </div>
                  <span className="text-xs font-normal text-white/80">POSH completion certificate uploaded by the employee</span>
                </div>
                <div className="p-6">
                  <div
                    onClick={handleOpenPoshDoc}
                    className="bg-slate-50/80 hover:bg-slate-100/90 transition-all cursor-pointer border border-slate-200 rounded-xl p-4 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-200/70 text-slate-500 flex items-center justify-center group-hover:bg-[#78161A]/10 group-hover:text-[#78161A] transition-colors">
                        📄
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-[#78161A] transition-colors">
                          {(() => {
                            const empCode = selectedCflForAnnualReview?.empCode || selectedCflForAnnualReview?.cflEmpCode || selectedCflForAnnualReview?.id || 9085126;
                            const storedRaw = localStorage.getItem(`annual_review_G100_${empCode}`);
                            if (storedRaw) {
                              try {
                                const parsed = JSON.parse(storedRaw);
                                if (parsed.poshCertificateName) return parsed.poshCertificateName;
                              } catch (e) {}
                            }
                            return "POSH (2).pdf";
                          })()}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                          Click to view document
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPoshDoc();
                      }}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#78161A] hover:bg-white shadow-2xs transition-all cursor-pointer"
                    >
                      <FaRegEye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MANAGER'S REMARKS */}
          {annualReviewStep === 2 && (
            <div className="space-y-6">
              {/* Card 1: Employee Information */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-[#78161A] text-white px-5 py-3.5 font-bold text-sm font-grotesk flex items-center gap-2">
                  <span className="text-sm">👤</span>
                  <span>Employee Information</span>
                </div>
                <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#78161A] text-white font-bold text-lg flex items-center justify-center shadow-xs">
                    {selectedCflForAnnualReview.initials || selectedCflForAnnualReview.name?.substring(0, 1) || 'R'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-slate-900 leading-tight">
                      {selectedCflForAnnualReview.name || 'Rohit Verma'}
                    </span>
                    <span className="text-xs font-medium text-slate-400 mt-0.5">
                      CFL
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Manager's Remarks */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-[#78161A] text-white px-5 py-3.5 font-bold text-sm font-grotesk flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👤</span>
                    <span>Manager's Remarks</span>
                  </div>
                  <span className="text-xs font-normal text-white/80">Provide your detailed assessment and feedback</span>
                </div>
                <div className="p-6 space-y-4">
                  <textarea
                    rows={4}
                    value={managerRemarksText}
                    onChange={(e) => setManagerRemarksText(e.target.value)}
                    placeholder="Provide your detailed assessment and feedback..."
                    className="w-full border border-slate-200 rounded-xl p-4 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-[#78161A] leading-relaxed transition-colors shadow-2xs"
                  />

                  {/* Tips Box */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 font-inter space-y-2">
                    <p className="font-bold text-slate-800 text-xs">Tips for effective remarks:</p>
                    <ul className="space-y-1.5 text-slate-500 pl-1">
                      <li className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">•</span>
                        <span>Highlight specific achievements and contributions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">•</span>
                        <span>Mention areas of strength and opportunities for growth</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">•</span>
                        <span>Provide constructive feedback for development</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">•</span>
                        <span>Align remarks with the ratings provided</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TALENT ASSESSMENT */}
          {annualReviewStep === 3 && (
            <div className="space-y-6">
              {/* Card 1: Employee Information */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-[#78161A] text-white px-5 py-3.5 font-bold text-sm font-grotesk flex items-center gap-2">
                  <span className="text-sm">👤</span>
                  <span>Employee Information</span>
                </div>
                <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#78161A] text-white font-bold text-lg flex items-center justify-center shadow-xs">
                    {selectedCflForAnnualReview.initials || selectedCflForAnnualReview.name?.substring(0, 1) || 'R'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-slate-900 leading-tight">
                      {selectedCflForAnnualReview.name || 'Rohit Verma'}
                    </span>
                    <span className="text-xs font-medium text-slate-400 mt-0.5">
                      CFL
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Talent Assessment */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-[#78161A] text-white px-5 py-4 font-bold text-sm font-grotesk space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📈</span>
                    <span>Talent Assessment</span>
                  </div>
                  <p className="text-xs font-normal text-white/80 leading-relaxed max-w-4xl">
                    While evaluating a team member, upon selecting the "Achievement Level", "Potential", and "Performance" — Pre-determined "Talent Status" will automatically populate. In case you wish to modify the selected "Achievement Level", please click on the "Reset" button.
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        setAchievementLevel("");
                        setPotentialSelection("");
                        setPerformanceSelection("");
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>🔄</span>
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={() => setShowGridGuideModal(true)}
                      className="px-3.5 py-1.5 rounded-full bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>ℹ️</span>
                      <span>View Grid Guide</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Dropdowns row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2 font-inter">
                        ACHIEVEMENT LEVEL *
                      </label>
                      <select
                        value={achievementLevel}
                        onChange={(e) => setAchievementLevel(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#78161A] cursor-pointer shadow-2xs"
                      >
                        <option value="">Select Achievement Level</option>
                        <option value="Exceptional">Exceptional</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Performer">Performer</option>
                        <option value="Need Improvement">Need Improvement</option>
                        <option value="Unsatisfactory">Unsatisfactory</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2 font-inter">
                        POTENTIAL *
                      </label>
                      <select
                        value={potentialSelection}
                        onChange={(e) => setPotentialSelection(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#78161A] cursor-pointer shadow-2xs"
                      >
                        <option value="">Select Potential</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2 font-inter">
                        PERFORMANCE *
                      </label>
                      <select
                        value={performanceSelection}
                        onChange={(e) => setPerformanceSelection(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#78161A] cursor-pointer shadow-2xs"
                      >
                        <option value="">Select Performance</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  {/* 9-Box Grid Assessment Results Box */}
                  {(() => {
                    const assessment = getNineBoxAssessment(achievementLevel, potentialSelection, performanceSelection);
                    return (
                      <div className="bg-[#FFF5F5] border border-rose-100 rounded-xl p-5 font-inter">
                        <div className="flex items-center gap-2 text-rose-900 font-bold text-xs mb-3">
                          <span>📈</span>
                          <span>9-Box Grid Assessment Results</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold text-rose-900 uppercase tracking-wider">
                              TALENT STATUS
                            </span>
                            <span className="text-xs font-bold text-slate-800 mt-1">
                              {assessment.talentStatus}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold text-rose-900 uppercase tracking-wider">
                              MANAGER RATING
                            </span>
                            <span className="text-xs font-bold text-slate-800 mt-1">
                              {assessment.managerRating}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold text-rose-900 uppercase tracking-wider">
                              RATING DESCRIPTION
                            </span>
                            <span className="text-xs font-bold text-slate-800 mt-1">
                              {assessment.ratingDescription}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-rose-800/80 font-normal mt-4 border-t border-rose-100/60 pt-2.5">
                          * Talent Status, Manager Rating, and Rating Description are automatically populated based on Achievement Level, Potential, and Performance selections and cannot be edited manually.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Required Fields Amber Alert Banner */}
              {(!achievementLevel || !potentialSelection || !performanceSelection) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 font-semibold flex items-center gap-2 font-inter shadow-2xs">
                  <span className="text-amber-600 text-sm">⚠️</span>
                  <span>Required fields to complete: Achievement Level · Potential · Performance</span>
                </div>
              )}
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              disabled={annualReviewStep === 1}
              onClick={() => setAnnualReviewStep((prev) => Math.max(1, prev - 1))}
              className="px-5 py-2.5 rounded-xl border border-[#78161A] text-[#78161A] hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-xs font-bold shadow-2xs"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSaveManagerRemarks(true)}
                className="px-5 py-2.5 rounded-xl border border-[#78161A] text-[#78161A] hover:bg-rose-50 cursor-pointer flex items-center gap-1.5 transition-all text-xs font-bold shadow-2xs"
              >
                <span>💾</span>
                <span>Save Draft</span>
              </button>

              {annualReviewStep < 3 ? (
                <button
                  onClick={async () => {
                    if (annualReviewStep === 2) {
                      await handleSaveManagerRemarks(false);
                    }
                    setAnnualReviewStep((prev) => Math.min(3, prev + 1));
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#78161A] text-white text-xs font-bold hover:bg-[#601115] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  onClick={async () => {
                    if (!achievementLevel || !potentialSelection || !performanceSelection) {
                      alert("Please complete all required fields: Achievement Level, Potential, and Performance.");
                      return;
                    }

                    const empCode = selectedCflForAnnualReview?.cflEmpCode || selectedCflForAnnualReview?.empCode || selectedCflForAnnualReview?.id;
                    const existingRaw = localStorage.getItem(`annual_review_G100_${empCode}`);
                    let existingData = {};
                    if (existingRaw) {
                      try { existingData = JSON.parse(existingRaw); } catch (e) {}
                    }

                    const assessment = getNineBoxAssessment(achievementLevel, potentialSelection, performanceSelection);
                    const updatedData = {
                      ...existingData,
                      cflEmpId: empCode,
                      stageCode: 'G100',
                      managerRemarks: managerRemarksText,
                      achievementLevel,
                      potentialSelection,
                      performanceSelection,
                      talentStatus: assessment.talentStatus,
                      managerRating: assessment.managerRating,
                      ratingDescription: assessment.ratingDescription,
                      status: 'SUBMITTED_TO_EMPLOYEE',
                      managerSubmittedAt: new Date().toISOString()
                    };

                    localStorage.setItem(`annual_review_G100_${empCode}`, JSON.stringify(updatedData));

                    try {
                      await goalService.submitManagerReview(empCode, 'G100', [], managerRemarksText);
                    } catch (e) {
                      console.warn("Backend submitManagerReview notice:", e.message);
                    }

                    alert("Final Annual Review submitted to employee successfully!");
                    setSelectedCflForAnnualReview(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#78161A] text-white text-xs font-bold hover:bg-[#601115] transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>🚩</span>
                  <span>Submit to Employee</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Pill Selection Sub-Navigation Tabs */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActivePlan('thirty-days')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${activePlan === 'thirty-days'
                ? 'bg-[#78161A] text-white'
                : 'bg-white border border-[#EAE3E4] text-[#4A5568] hover:bg-[#F8F9FA]'
                }`}
            >
              Thirty Days Plan {!isPlanActivated('thirty-days') && <span className="text-[10px] text-slate-400 font-normal ml-0.5">(Not Created)</span>}
            </button>
            <button
              onClick={() => setActivePlan('sixty-days')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${activePlan === 'sixty-days'
                ? 'bg-[#78161A] text-white'
                : 'bg-white border border-[#EAE3E4] text-[#4A5568] hover:bg-[#F8F9FA]'
                }`}
            >
              Sixty Days Plan {!isPlanActivated('sixty-days') && <span className="text-[10px] text-slate-400 font-normal ml-0.5">(Not Created)</span>}
            </button>
            <button
              onClick={() => setActivePlan('ninety-days')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${activePlan === 'ninety-days'
                ? 'bg-[#78161A] text-white'
                : 'bg-white border border-[#EAE3E4] text-[#4A5568] hover:bg-[#F8F9FA]'
                }`}
            >
              Ninety Days Plan {!isPlanActivated('ninety-days') && <span className="text-[10px] text-slate-400 font-normal ml-0.5">(Not Created)</span>}
            </button>
            <button
              onClick={() => setActivePlan('final-review')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${activePlan === 'final-review'
                ? 'bg-[#78161A] text-white'
                : 'bg-white border border-[#EAE3E4] text-[#4A5568] hover:bg-[#F8F9FA]'
                }`}
            >
              🏅 Final Review {!isPlanActivated('final-review') && <span className="text-[10px] text-slate-400 font-normal ml-0.5">(Not Created)</span>}
            </button>
          </div>

          {/* Main Inner State Renderings */}
          {!isPlanActivated(activePlan) ? (
            <div className="bg-white rounded-2xl border border-[#EAE3E4] p-16 shadow-xs flex flex-col items-center justify-center text-center max-w-[1200px] w-full min-h-[350px] animate-fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-rose-800 text-[26px]">
                <FaLock className="text-amber-500 w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 mt-5 font-grotesk tracking-tight">
                {activePlan === 'thirty-days' ? 'Thirty Days Plan' : activePlan === 'sixty-days' ? 'Sixty Days Plan' : activePlan === 'ninety-days' ? 'Ninety Days Plan' : 'Final Review Plan'} has not been configured yet
              </h3>
              <p className="text-[13px] text-slate-500 mt-2 font-medium max-w-sm font-inter">
                Ask HR to configure and activate this review cycle from <span className="font-semibold text-slate-700">Performance &gt; Configure Review Cycles</span>.
              </p>
            </div>
          ) : activePlan === 'final-review' ? (
            <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-xs space-y-6 animate-fade-in duration-300">
              {/* Burgundy Red solid dashboard banner */}
              <div className="bg-[#78161A] text-white rounded-2xl p-6 relative overflow-hidden flex justify-between items-center shadow-xs">
                <div>
                  <h3 className="text-xl font-bold font-grotesk tracking-wide text-white">
                    Annual Performance Review 2025-2026
                  </h3>
                  <p className="text-xs text-white/70 font-semibold font-inter mt-1.5">
                    Full Year Assessment
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-xs text-white/80 font-medium font-inter">
                    Financial Year <span className="font-extrabold text-white text-sm ml-1">2025-2026</span>
                  </div>
                  <div className="text-xs text-white/80 font-medium font-inter">
                    Review Type <span className="font-extrabold text-white text-sm ml-1">Annual</span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-1">
                <div className="relative w-full md:max-w-xl">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <FaSearch className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by employee name, ID, or email..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#78161A] transition-colors shadow-2xs"
                  />
                </div>

                <div className="relative w-full md:w-auto">
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:border-[#78161A] cursor-pointer w-full md:w-[160px]"
                  >
                    <option value="All Stages">All Stages</option>
                    <option value="Thirty Days">Thirty Days</option>
                    <option value="Sixty Days">Sixty Days</option>
                    <option value="Ninety Days">Ninety Days</option>
                    <option value="Final Review">Final Review</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="fill-current h-3.5 w-3.5" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full border-collapse text-left font-inter table-fixed min-w-[950px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <th className="px-5 py-3.5 w-[220px]">EMPLOYEE</th>
                      <th className="px-4 py-3.5 w-[140px] text-center">THIRTY DAYS</th>
                      <th className="px-4 py-3.5 w-[140px] text-center">SIXTY DAYS</th>
                      <th className="px-4 py-3.5 w-[140px] text-center">NINETY DAYS</th>
                      <th className="px-4 py-3.5 w-[150px] text-center">FINAL REVIEW</th>
                      <th className="px-4 py-3.5 w-[140px] text-center">OVERALL PROGRESS</th>
                      <th className="px-4 py-3.5 w-[80px] text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-10 text-xs font-semibold text-slate-400 animate-pulse">
                          Loading annual performance records from backend...
                        </td>
                      </tr>
                    ) : filteredThirtyDays.length > 0 ? (
                      filteredThirtyDays.map((cfl, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          {/* EMPLOYEE COLUMN */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#E97A48] text-white flex items-center justify-center text-xs font-extrabold shadow-2xs">
                                {cfl.initials}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800 leading-tight">
                                  {cfl.name}
                                </span>
                                <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                                  {cfl.role || (cfl.name === 'Manpreet Kaur' || cfl.name === 'Amit Chauhan' ? 'Java Developer' : cfl.name === 'Rohit Verma' ? 'DevOps Engineer' : cfl.name === 'Sneha Reddy' ? 'QA Engineer' : 'Software Engineer')}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* THIRTY DAYS */}
                          <td className="px-4 py-4 text-center">
                            {renderStagePillBadge(cfl.thirtyDaysStatus || 'Not Started')}
                          </td>

                          {/* SIXTY DAYS */}
                          <td className="px-4 py-4 text-center">
                            {renderStagePillBadge(cfl.sixtyDaysStatus || 'Not Started')}
                          </td>

                          {/* NINETY DAYS */}
                          <td className="px-4 py-4 text-center">
                            {renderStagePillBadge(cfl.ninetyDaysStatus || 'Not Started')}
                          </td>

                          {/* FINAL REVIEW */}
                          <td className="px-4 py-4 text-center">
                            {cfl.finalReviewStatus === 'View' || cfl.overallProgress === 100 ? (
                              <button
                                onClick={() => handleOpenAnnualReview(cfl)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#78161A] text-[#78161A] hover:bg-rose-50 text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
                              >
                                <FaRegEye className="w-3 h-3 text-[#78161A]" />
                                <span>View</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenAnnualReview(cfl)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#78161A] text-[#78161A] hover:bg-rose-50 text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
                              >
                                <FaEdit className="w-3 h-3 text-[#78161A]" />
                                <span>Conduct Review</span>
                              </button>
                            )}
                          </td>

                          {/* OVERALL PROGRESS */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center flex-col">
                              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden relative">
                                <div
                                  style={{ width: `${cfl.overallProgress || 0}%` }}
                                  className={`h-full transition-all duration-300 ${
                                    (cfl.overallProgress === 100) ? 'bg-[#10B981]' : cfl.overallProgress > 0 ? 'bg-[#78161A]' : 'bg-slate-300'
                                  }`}
                                />
                              </div>
                            </div>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-4 py-4 text-center">
                            {(cfl.finalReviewStatus === 'View' || cfl.overallProgress === 100) && (
                              <button
                                onClick={() => handleOpenAnnualReview(cfl)}
                                className="w-6 h-6 rounded-full border border-slate-200 inline-flex items-center justify-center text-slate-400 hover:text-[#78161A] hover:bg-slate-50 shadow-2xs transition-all outline-none cursor-pointer"
                              >
                                <FaRegEye className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-10 text-xs font-semibold text-slate-400">
                          No CFL records found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-xs space-y-6 animate-fade-in duration-300">

              {/* Burgundy Red solid dashboard banner */}
              <div className="bg-[#78161A] text-white rounded-2xl p-6 relative overflow-hidden flex justify-between items-center shadow-xs">
                <div>
                  <h3 className="text-lg font-bold font-grotesk tracking-wide text-white">
                    {activePlan === 'thirty-days' ? 'Thirty Days Plan (Apr – Apr)' : activePlan === 'sixty-days' ? 'Sixty Days Plan (May – Jun)' : activePlan === 'ninety-days' ? 'Ninety Days Plan (Jul – Sep)' : 'Final Review Plan (Oct – Mar)'}
                  </h3>
                  <p className="text-xs text-white/70 font-semibold font-inter mt-1.5">
                    {activePlan === 'thirty-days' ? '01 Apr 2026 – 30 Apr 2026' : activePlan === 'sixty-days' ? '01 May 2026 – 30 Jun 2026' : activePlan === 'ninety-days' ? '01 Jul 2026 – 30 Sep 2026' : '01 Oct 2026 – 31 Mar 2027'}
                  </p>
                </div>

                {/* Display Block Badges on right side */}
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl px-4 py-2 text-center min-w-[70px]">
                    <div className="text-[8px] uppercase tracking-widest text-white/60 font-extrabold font-inter">YEAR</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">{selectedYear}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl px-4 py-2 text-center min-w-[95px]">
                    <div className="text-[8px] uppercase tracking-widest text-white/60 font-extrabold font-inter">REVIEW TYPE</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">Quarterly</div>
                  </div>
                </div>
              </div>

              {/* 4 Horizontal Summary Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Pending Manager Approval */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center font-bold text-sm">
                    ⚡
                  </div>
                  <span className="text-2xl font-black text-slate-800 font-grotesk leading-none">{pendingApprovalCount}</span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">PENDING YOUR APPROVAL</span>
                </div>

                {/* Card 2: Pending Final Review */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center font-bold text-sm">
                    ⚡
                  </div>
                  <span className="text-2xl font-black text-slate-800 font-grotesk leading-none">{pendingFinalReviewCount}</span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">PENDING YOUR FINAL REVIEW</span>
                </div>

                {/* Card 3: Awaiting CFL Action */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                    ⏳
                  </div>
                  <span className="text-2xl font-black text-slate-800 font-grotesk leading-none">{awaitingCflCount}</span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">AWAITING CFL ACTION</span>
                </div>

                {/* Card 4: Completed */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ☑️
                  </div>
                  <span className="text-2xl font-black text-slate-800 font-grotesk leading-none">{completedCount}</span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">COMPLETED</span>
                </div>
              </div>

              {/* Search bar & Stage Filter */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-2">
                <div className="relative w-full md:max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <FaSearch className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by CFL name, ID, or email..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:bg-white focus:border-[#78161A] transition-colors shadow-2xs"
                  />
                </div>

                <div className="relative w-full md:w-auto">
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:border-[#78161A] cursor-pointer w-full md:w-[160px]"
                  >
                    <option value="All Stages">All Stages</option>
                    <option value="Goal Creation">Goal Creation</option>
                    <option value="Manager Approval">Manager Approval</option>
                    <option value="Self Review">Self Review</option>
                    <option value="Manager Review">Manager Review</option>
                    <option value="Self Acceptance">Self Acceptance</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Legend Row */}
              <div className="flex items-center gap-6 pt-1 text-xs font-semibold text-slate-500 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-rose-700">
                  <span>⚡ Action Needed</span>
                  <span className="text-[11px] font-normal text-slate-400">requires you</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Awaiting CFL</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Completed</span>
                </div>
              </div>

              {/* CFL Team Performance Review Progress Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left font-inter table-fixed min-w-[950px]">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <th className="px-5 py-3.5 w-[200px]">CFL</th>
                      <th className="px-4 py-3.5 w-[110px] text-center">PROGRESS</th>
                      <th className="px-4 py-3.5 w-[140px] text-center">GOAL CREATION</th>
                      <th className="px-4 py-3.5 w-[160px] text-center">MANAGER APPROVAL</th>
                      <th className="px-4 py-3.5 w-[130px] text-center">SELF REVIEW</th>
                      <th className="px-4 py-3.5 w-[140px] text-center">MANAGER REVIEW</th>
                      <th className="px-4 py-3.5 w-[140px] text-center">SELF ACCEPTANCE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-10 text-xs font-semibold text-slate-400 animate-pulse">
                          Loading team performance records from backend...
                        </td>
                      </tr>
                    ) : filteredThirtyDays.length > 0 ? (
                      filteredThirtyDays.map((cfl, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-slate-50/50 transition-colors ${cfl.actionNeeded ? 'bg-rose-50/10' : ''
                            }`}
                        >
                          {/* CFL Name Column with left vertical red border line if Action Needed */}
                          <td className={`px-5 py-4 relative ${cfl.actionNeeded ? 'border-l-4 border-l-[#78161A]' : ''}`}>
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full ${cfl.avatarBg} text-white flex items-center justify-center text-xs font-extrabold shadow-2xs`}>
                                {cfl.initials}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800 leading-tight">
                                  {cfl.name}
                                </span>
                                {cfl.actionNeeded && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full mt-1 w-max">
                                    ⚡ Action Needed
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Progress Column */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center flex-col">
                              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden relative">
                                <div
                                  style={{ width: `${cfl.progress}%` }}
                                  className={`h-full transition-all duration-300 ${cfl.progress === 100
                                    ? 'bg-[#10B981]'
                                    : cfl.progress > 0
                                      ? 'bg-[#78161A]'
                                      : 'bg-slate-200'
                                    }`}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Goal Creation Column - Triggers Detailed Employee Goal Summary */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col items-center">
                              {renderBadge(cfl.goalCreation, () => handleViewGoalSummary(cfl))}
                              {renderEyeBtn(cfl.goalCreation, cfl, () => handleViewGoalSummary(cfl))}
                            </div>
                          </td>

                          {/* Manager Approval Column - Triggers Detailed Employee Goal Summary */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col items-center">
                              {renderBadge(cfl.managerApproval, () => handleViewGoalSummary(cfl))}
                              {renderEyeBtn(cfl.managerApproval, cfl, () => handleViewGoalSummary(cfl))}
                            </div>
                          </td>

                          {/* Self Review Column */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col items-center">
                              {renderBadge(cfl.selfReview, () => openReviewModal(cfl))}
                              {renderEyeBtn(cfl.selfReview, cfl, () => openReviewModal(cfl))}
                            </div>
                          </td>

                          {/* Manager Review Column */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col items-center">
                              {renderBadge(cfl.managerReview, () => openReviewModal(cfl))}
                              {renderEyeBtn(cfl.managerReview, cfl, () => openReviewModal(cfl))}
                            </div>
                          </td>

                          {/* Self Acceptance Column */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col items-center">
                              {renderBadge(cfl.selfAcceptance, () => openReviewModal(cfl))}
                              {renderEyeBtn(cfl.selfAcceptance, cfl, () => openReviewModal(cfl))}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-10 text-xs font-semibold text-slate-400">
                          No CFL records found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}


        </>
      )}

      {/* Goal Review Modal */}
      {reviewModalOpen && selectedCfl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden font-inter">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${selectedCfl.avatarBg || 'bg-[#78161A]'} text-white font-bold text-sm flex items-center justify-center shadow-xs`}>
                  {selectedCfl.initials}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-grotesk">{selectedCfl.name} — Goal Review</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{activePlan === 'thirty-days' ? 'Thirty Days Plan' : activePlan === 'sixty-days' ? 'Sixty Days Plan' : activePlan === 'ninety-days' ? 'Ninety Days Plan' : 'Final Review'} • SMART Goals Submitted for Approval</p>
                </div>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* CFL Self Acceptance Feedback Banner */}
              {(selectedCfl.selfAcceptanceRemarks || selectedCfl.selfAcceptanceStatus || selectedCfl.wfStatus === 'CYCLE_COMPLETED' || selectedCfl.wfStatus === 'REASSESSMENT_REQUESTED' || selectedCfl.selfAcceptance?.text?.includes('Accepted') || selectedCfl.selfAcceptance?.text?.includes('Clarification')) && (
                <div className="bg-[#FFF8E7] border border-[#F5E6BE] rounded-xl p-4 text-amber-950 shadow-xs space-y-2 font-inter">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs font-grotesk">
                      <span className="text-sm">💬</span>
                      <span>CFL Self Acceptance Feedback</span>
                    </div>
                    <span className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${selectedCfl.selfAcceptanceStatus?.includes('SATISFIED') || selectedCfl.selfAcceptanceStatus?.includes('Satisfied') || selectedCfl.selfAcceptanceStatus?.includes('NEUTRAL') || selectedCfl.selfAcceptanceStatus?.includes('Neutral') || selectedCfl.selfAcceptanceStatus?.includes('Accept') || selectedCfl.wfStatus === 'CYCLE_COMPLETED' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-200 text-amber-900 border-amber-300'}`}>
                      {formatSelfAcceptanceStatus(selectedCfl.selfAcceptanceStatus)}
                    </span>
                  </div>
                  {selectedCfl.selfAcceptanceRemarks ? (
                    <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                      <span className="text-[10px] font-bold uppercase text-amber-800 block">Remarks / Notes:</span>
                      <p className="text-xs text-amber-950 leading-relaxed font-medium mt-0.5 font-inter">
                        "{selectedCfl.selfAcceptanceRemarks}"
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
              {selectedCfl.goals && selectedCfl.goals.length > 0 ? (
                selectedCfl.goals.map((goal, gIdx) => (
                  <div key={gIdx} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#78161A] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {goal.category || 'TECHNICAL'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Target: {goal.createdOn || goal.targetCompletionDate || goal.targetDate || '08 Jun 2026'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 font-grotesk">{goal.title || goal.goalTitle || 'Goal Title'}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{goal.description || 'Goal Description'}</p>

                    {/* CFL Self Review Rating & Remarks */}
                    {(goal.selfRating || goal.selfRemarks || selectedCfl.selfReview?.type === 'success' || selectedCfl.wfStatus === 'SELF_REVIEW_COMPLETED') && (
                      <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 space-y-1.5 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">CFL Self Assessment</span>
                          <span className="text-xs font-bold text-blue-900 bg-white border border-blue-200 px-2 py-0.5 rounded-md">
                            Score: ⭐ {goal.selfRating || 5} / 5
                          </span>
                        </div>
                        <p className="text-xs text-blue-950 italic font-medium">
                          "{goal.selfRemarks || 'Completed task on schedule with high quality.'}"
                        </p>
                      </div>
                    )}

                    {/* Manager Review Input */}
                    {(selectedCfl.managerReview?.type === 'actionNeeded' || selectedCfl.selfReview?.type === 'success' || selectedCfl.wfStatus === 'SELF_REVIEW_COMPLETED') && (
                      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 space-y-2 mt-2">
                        <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Manager Assessment</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Manager Rating (1 - 5)</label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={managerRatings[goal.id] !== undefined ? managerRatings[goal.id] : (goal.managerRating || 5)}
                              onChange={(e) => setManagerRatings({ ...managerRatings, [goal.id]: e.target.value })}
                              className="mt-1 w-full px-3 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Manager Remarks</label>
                            <input
                              type="text"
                              placeholder="Enter manager remarks..."
                              value={managerComments[goal.id] !== undefined ? managerComments[goal.id] : (goal.managerRemarks || '')}
                              onChange={(e) => setManagerComments({ ...managerComments, [goal.id]: e.target.value })}
                              className="mt-1 w-full px-3 py-1 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  No SMART goals have been submitted for approval yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Close
              </button>
              {selectedCfl.managerApproval.type === 'actionNeeded' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenRequestChanges(selectedCfl)}
                    className="px-4 py-2 bg-white border border-[#78161A] text-[#78161A] hover:bg-rose-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Request Changes
                  </button>
                  <button
                    onClick={() => handleApproveGoals(selectedCfl.cflEmpCode)}
                    className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FaCheck className="w-3.5 h-3.5" />
                    <span>Approve Goals</span>
                  </button>
                </div>
              ) : selectedCfl.managerReview?.type === 'actionNeeded' || selectedCfl.selfReview?.type === 'success' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveManagerReview(selectedCfl.cflEmpCode)}
                    className="px-5 py-2 bg-[#78161A] hover:bg-[#631013] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FaCheck className="w-3.5 h-3.5" />
                    <span>Complete Manager Final Review</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Request Changes / Revert Remarks Modal */}
      {requestChangesModalOpen && requestChangesTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden font-inter">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#78161A] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  ↪
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-grotesk">Request Changes — {requestChangesTarget.name || requestChangesTarget.cflName}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Revert goals back to CFL with feedback remarks</p>
                </div>
              </div>
              <button
                onClick={() => setRequestChangesModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 font-grotesk mb-1">
                  Manager Remarks / Feedback <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Specify clear feedback or instructions on what changes the employee needs to make in their SMART goals.
                </p>
                <textarea
                  value={managerRemarksInput}
                  onChange={(e) => setManagerRemarksInput(e.target.value)}
                  rows={4}
                  placeholder="E.g., Please refine the target metrics for Goal 2 and re-adjust goal weightages to match project priorities..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#78161A]/20 focus:border-[#78161A] outline-none transition-all resize-none font-inter text-slate-800"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                onClick={() => setRequestChangesModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequestChanges}
                className="px-5 py-2 bg-[#78161A] hover:bg-[#631013] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Submit Request & Revert Goals</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POSH Certificate Document Viewer Modal */}
      {showPoshDocModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in font-inter select-none">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#78161A] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                  📜
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-grotesk tracking-wide">
                    {poshDocDetails.fileName}
                  </h3>
                  <p className="text-[11px] text-white/80 font-medium font-inter">
                    POSH Compliance Certificate • {poshDocDetails.cflName} (Code: {poshDocDetails.empCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPoshDocModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Document Preview */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 flex flex-col items-center justify-center min-h-[400px]">
              {poshDocDetails.fileData ? (
                <iframe
                  src={poshDocDetails.fileData}
                  title="POSH Certificate Document"
                  className="w-full h-[500px] rounded-xl border border-slate-200 shadow-sm"
                />
              ) : (
                /* High-Fidelity POSH Certificate Template Preview */
                <div className="w-full max-w-2xl bg-white rounded-2xl border-4 border-double border-[#78161A]/30 p-8 shadow-md text-center space-y-6 relative overflow-hidden">
                  {/* Corner Watermark */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-[#78161A]/5 flex items-center justify-center text-7xl select-none pointer-events-none">
                    ⚖️
                  </div>

                  {/* Header Badge */}
                  <div className="inline-block bg-[#78161A]/10 text-[#78161A] font-extrabold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#78161A]/20">
                    ORGANIZATIONAL COMPLIANCE & SAFETY
                  </div>

                  {/* Certificate Title */}
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 font-grotesk tracking-wider uppercase">
                      CERTIFICATE OF COMPLETION
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Prevention of Sexual Harassment (POSH) at Workplace Training
                    </p>
                  </div>

                  <div className="w-16 h-0.5 bg-[#78161A] mx-auto rounded-full" />

                  {/* Recipient Info */}
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">This is to certify that</p>
                    <h3 className="text-xl font-bold text-[#78161A] font-grotesk">
                      {poshDocDetails.cflName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600">
                      Employee Code: <span className="font-mono text-slate-900">{poshDocDetails.empCode}</span>
                    </p>
                  </div>

                  {/* Verification Text */}
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
                    Has successfully completed the mandatory annual POSH awareness module, compliance assessment, and safety guidelines for FY 2025-2026.
                  </p>

                  {/* Footer Signatures & Seal */}
                  <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 items-center">
                    <div className="text-left space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DOCUMENT NAME</span>
                      <span className="text-xs font-bold text-slate-800 font-mono block">{poshDocDetails.fileName}</span>
                      <span className="text-[10px] text-slate-400 block">Status: Verified & Signed</span>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                        <span>✓</span> Verified Compliant
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Document: <span className="font-bold text-slate-700">{poshDocDetails.fileName}</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPoshDocModal(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                {poshDocDetails.fileData && (
                  <a
                    href={poshDocDetails.fileData}
                    download={poshDocDetails.fileName}
                    className="px-5 py-2 bg-[#78161A] hover:bg-[#601115] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📥</span> Download
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9-Box Grid Reference Guide Modal */}
      {showGridGuideModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in font-inter select-none">
          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#78161A] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-base">
                  📈
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-grotesk tracking-wide">
                    9-Box Grid Reference Guide
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGridGuideModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                The 9-Box Grid automatically determines the employee's category, rating, and rating description based on the combination of Achievement Level, Potential, and Performance.
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                <table className="w-full border-collapse text-left text-xs font-inter">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <th className="px-4 py-3">ACHIEVEMENT LEVEL</th>
                      <th className="px-4 py-3">POTENTIAL</th>
                      <th className="px-4 py-3">PERFORMANCE</th>
                      <th className="px-4 py-3">CATEGORY (TALENT STATUS)</th>
                      <th className="px-4 py-3 text-center">RATING</th>
                      <th className="px-4 py-3">RATING DESCRIPTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">Exceptional</td>
                      <td className="px-4 py-3">High</td>
                      <td className="px-4 py-3">High</td>
                      <td className="px-4 py-3 font-bold text-slate-900">Key Talent</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200">A+</span>
                      </td>
                      <td className="px-4 py-3">Outstanding Contributor</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">Excellent</td>
                      <td className="px-4 py-3">High</td>
                      <td className="px-4 py-3">Medium</td>
                      <td className="px-4 py-3 font-bold text-slate-900">Emerging Talent</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200">A</span>
                      </td>
                      <td className="px-4 py-3">Exceeds Expectations</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">Performer</td>
                      <td className="px-4 py-3">High</td>
                      <td className="px-4 py-3">Low</td>
                      <td className="px-4 py-3 font-bold text-slate-900">Mis-Fit</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200">A</span>
                      </td>
                      <td className="px-4 py-3">Exceeds Expectations</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">Performer</td>
                      <td className="px-4 py-3">Medium</td>
                      <td className="px-4 py-3">High</td>
                      <td className="px-4 py-3 font-bold text-slate-900">Talent</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200">B+</span>
                      </td>
                      <td className="px-4 py-3">Meets Expectations</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">Need Improvement</td>
                      <td className="px-4 py-3">Medium</td>
                      <td className="px-4 py-3">Medium</td>
                      <td className="px-4 py-3 font-bold text-slate-900">Critical Resource</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200">B</span>
                      </td>
                      <td className="px-4 py-3">Partially Meets Expectations</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">Need Improvement</td>
                      <td className="px-4 py-3">Medium</td>
                      <td className="px-4 py-3">Low</td>
                      <td className="px-4 py-3 font-bold text-slate-900">Watch List</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200">B</span>
                      </td>
                      <td className="px-4 py-3">Partially Meets Expectations</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">Need Improvement</td>
                      <td className="px-4 py-3">Low</td>
                      <td className="px-4 py-3">High</td>
                      <td className="px-4 py-3 font-bold text-slate-900">Expert</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200">B</span>
                      </td>
                      <td className="px-4 py-3">Partially Meets Expectations</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">Unsatisfactory</td>
                      <td className="px-4 py-3">Low</td>
                      <td className="px-4 py-3">Medium</td>
                      <td className="px-4 py-3 font-bold text-slate-900">Stable</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200">B</span>
                      </td>
                      <td className="px-4 py-3">Partially Meets Expectations</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">Unsatisfactory</td>
                      <td className="px-4 py-3">Low</td>
                      <td className="px-4 py-3">Low</td>
                      <td className="px-4 py-3 font-bold text-slate-900">Risk</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200">C</span>
                      </td>
                      <td className="px-4 py-3">Does Not Meet Expectations</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => setShowGridGuideModal(false)}
                className="w-full py-2.5 border border-[#78161A] text-[#78161A] hover:bg-rose-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Performance;
