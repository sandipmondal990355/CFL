import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaCheckCircle, FaPaperPlane, FaBullseye, FaTrash, FaSave, FaArrowLeft, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
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
  const CFL_EMP_ID = 1125;
  const [activeTab, setActiveTab] = useState('thirty-days');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [goals, setGoals] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic SMART Goal cards list for inline goal creation
  const [smartGoalCards, setSmartGoalCards] = useState([
    {
      id: 1,
      title: '',
      target: '',
      weightage: 100
    }
  ]);

  const [savingGoal, setSavingGoal] = useState(false);
  const [submittingGoals, setSubmittingGoals] = useState(false);
  const [showSelfReviewModal, setShowSelfReviewModal] = useState(false);
  const [isSelfReviewCompleted, setIsSelfReviewCompleted] = useState(false);
  const [submittingSelfReview, setSubmittingSelfReview] = useState(false);
  const [selfReviewRatings, setSelfReviewRatings] = useState({});
  const [selfReviewComments, setSelfReviewComments] = useState({});

  // Self Acceptance State
  const [showSelfAcceptanceModal, setShowSelfAcceptanceModal] = useState(false);
  const [isSatisfiedWithManager, setIsSatisfiedWithManager] = useState(true);
  const [selectedSatisfactionEmoji, setSelectedSatisfactionEmoji] = useState('😊');
  const [selfAcceptanceRemarksInput, setSelfAcceptanceRemarksInput] = useState('');
  const [submittingSelfAcceptance, setSubmittingSelfAcceptance] = useState(false);

  // Weightage Exceeded Alert Modal State
  const [weightageAlertModal, setWeightageAlertModal] = useState({ show: false, type: 'EXCEEDS', totalW: 0 });

  // CFL Annual Performance Review Screen State
  const [showCflAnnualReviewForm, setShowCflAnnualReviewForm] = useState(false);
  const [cflKeyAccomplishments, setCflKeyAccomplishments] = useState('');
  const [cflPoshFile, setCflPoshFile] = useState(null);
  const [poshDocRecord, setPoshDocRecord] = useState(null);
  const [uploadingPosh, setUploadingPosh] = useState(false);
  const [showPoshViewerModal, setShowPoshViewerModal] = useState(false);
  const [cflCertificationsNotApplicable, setCflCertificationsNotApplicable] = useState(false);
  const [cflCertificationsList, setCflCertificationsList] = useState([]);


  const getStageCode = (tabKey) => {
    switch (tabKey) {
      case 'thirty-days': return 'G30';
      case 'sixty-days': return 'G60';
      case 'ninety-days': return 'G90';
      case 'final-review': return 'G100';
      default: return 'G30';
    }
  };

  const getCurrentWorkflow = () => {
    const code = getStageCode(activeTab);
    return workflows.find(w => {
      const sCode = w.stageCode || '';
      const sName = w.stageName || '';
      const sId = w.stageId || w.stage_id;
      return sCode === code ||
        (code === 'G30' && (sCode === 'G30' || sId === 1 || sName.includes('30') || (!sCode && !sId))) ||
        (code === 'G60' && (sCode === 'G60' || sId === 2 || sName.includes('60'))) ||
        (code === 'G90' && (sCode === 'G90' || sId === 3 || sName.includes('90'))) ||
        (code === 'G100' && (sCode === 'G100' || sId === 4 || sName.includes('Final')));
    });
  };

  const currentWf = getCurrentWorkflow();

  const effectiveWfStatus = (currentWf?.status === 'CYCLE_COMPLETED' || currentWf?.status === 'REASSESSMENT_REQUESTED' || currentWf?.selfAcceptanceStatus || currentWf?.selfAcceptanceRemarks)
    ? (currentWf?.status === 'REASSESSMENT_REQUESTED' || (currentWf?.selfAcceptanceStatus && currentWf.selfAcceptanceStatus.includes('DISSATISFIED')) ? 'REASSESSMENT_REQUESTED' : 'CYCLE_COMPLETED')
    : (currentWf?.status || (goals.length > 0 ? (goals.some(g => g.managerRating) ? 'COMPLETED' : goals.some(g => g.selfRating) ? 'SELF_REVIEW_COMPLETED' : goals.some(g => g.status === 'APPROVED') ? 'APPROVED' : 'GOALS_SUBMITTED') : ''));

  const isApproved = effectiveWfStatus === 'APPROVED' || effectiveWfStatus === 'GOALS_APPROVED' || effectiveWfStatus === 'SELF_REVIEW_COMPLETED' || effectiveWfStatus === 'COMPLETED' || effectiveWfStatus === 'CYCLE_COMPLETED' || effectiveWfStatus === 'REASSESSMENT_REQUESTED' || (goals.length > 0 && goals.some(g => g.status === 'APPROVED' || g.managerRating || g.selfRating));
  const isRevisionRequested = (effectiveWfStatus === 'REVISION_REQUESTED' || effectiveWfStatus === 'CHANGES_REQUESTED' || (goals.length > 0 && goals.some(g => g.status === 'REVISION_REQUESTED'))) && !isApproved;
  const isSubmitted = (effectiveWfStatus === 'GOALS_SUBMITTED' || goals.length > 0) && !isRevisionRequested;
  const isSelfReviewCompletedState = isSelfReviewCompleted || effectiveWfStatus === 'SELF_REVIEW_COMPLETED' || effectiveWfStatus === 'COMPLETED' || effectiveWfStatus === 'CYCLE_COMPLETED' || effectiveWfStatus === 'REASSESSMENT_REQUESTED' || (goals.length > 0 && goals.some(g => g.selfRating));


  // Fetch workflows, profile details, and POSH certificate document on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [workflowsData, profileRes, poshDocs] = await Promise.all([
          goalService.getWorkflowByCfl(CFL_EMP_ID),
          cflAssignmentService.getByCfl(CFL_EMP_ID),
          documentService.getByCflAndType(CFL_EMP_ID, 'POSH_CERTIFICATE').catch(() => [])
        ]);
        setWorkflows(workflowsData || []);
        setProfileData(profileRes || null);
        if (poshDocs && poshDocs.length > 0) {
          setPoshDocRecord(poshDocs[0]);
        }
      } catch (err) {
        console.warn('Error fetching performance details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [CFL_EMP_ID]);


  // Helper to check if a plan is activated by HR
  const isPlanActivated = (tabKey) => {
    return workflows.some(w => {
      const sCode = w.stageCode || '';
      const sName = w.stageName || '';
      const sId = w.stageId || w.stage_id;
      const isEnabledStatus = w.status && w.status !== 'NOT_STARTED' && w.status !== 'DISABLED';
      if (!isEnabledStatus) return false;

      if (tabKey === 'thirty-days') {
        return sCode === 'G30' || sId === 1 || sName.includes('30');
      }
      if (tabKey === 'sixty-days') {
        return sCode === 'G60' || sId === 2 || sName.includes('60');
      }
      if (tabKey === 'ninety-days') {
        return sCode === 'G90' || sId === 3 || sName.includes('90');
      }
      if (tabKey === 'final-review') {
        return sCode === 'G100' || sId === 4 || sName.includes('Final');
      }
      return false;
    });
  };

  // Helper handler for tab changes to ensure form view is reset
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setShowGoalForm(false);
  };

  // Fetch goals for active stage whenever activeTab or CFL_EMP_ID changes
  useEffect(() => {
    setShowGoalForm(false);
    const fetchStageGoals = async () => {
      if (isPlanActivated(activeTab)) {
        try {
          const code = getStageCode(activeTab);
          const data = await goalService.getGoalsByCfl(CFL_EMP_ID, code);
          if (data && data.length > 0) {
            setGoals(data);
            setSmartGoalCards(data.map((g, idx) => ({
              id: g.id || (idx + 100),
              dbId: g.id,
              title: g.title || '',
              target: g.description || 'Complete certification / training',
              weightage: g.weightage || 25,
              selfRating: g.selfRating,
              selfRemarks: g.selfRemarks,
              managerRating: g.managerRating,
              managerRemarks: g.managerRemarks
            })));
          } else {
            setGoals([]);
            setSmartGoalCards([
              {
                id: 1,
                title: '',
                target: '',
                weightage: 100
              }
            ]);
          }
        } catch (err) {
          console.warn('Error loading stage goals:', err.message);
          setGoals([]);
        }
      }
    };
    fetchStageGoals();
  }, [activeTab, workflows, CFL_EMP_ID]);

  const handleGoalCardChange = (id, field, value) => {
    setSmartGoalCards(prev =>
      prev.map(card => card.id === id ? { ...card, [field]: value } : card)
    );
  };

  const handleAddGoalCard = () => {
    setSmartGoalCards(prev => [
      ...prev,
      {
        id: Date.now(),
        title: '',
        target: 'Complete certification / training',
        weightage: 20
      }
    ]);
  };

  const handleRemoveGoalCard = (id) => {
    if (smartGoalCards.length <= 1) {
      alert('You must keep at least 1 SMART goal.');
      return;
    }
    setSmartGoalCards(prev => prev.filter(c => c.id !== id));
  };

  const calculateTotalWeightage = () => {
    return smartGoalCards.reduce((sum, c) => sum + (Number(c.weightage) || 0), 0);
  };

  const handleSaveDraft = async () => {
    try {
      setSavingGoal(true);
      const code = getStageCode(activeTab);
      const goalRequests = smartGoalCards
        .filter(card => card.title && card.title.trim())
        .map(card => ({
          id: card.dbId || (card.id && typeof card.id === 'number' && card.id > 100 ? card.id : null),
          cflEmpId: CFL_EMP_ID,
          stageCode: code,
          title: card.title,
          description: card.target,
          targetDate: '2026-07-31',
          weightage: Number(card.weightage) || 25
        }));

      await goalService.batchSyncGoals(CFL_EMP_ID, code, goalRequests);
      alert(`SMART goals for ${getPlanTitle(activeTab)} saved as draft successfully!`);
      const updatedWorkflows = await goalService.getWorkflowByCfl(CFL_EMP_ID);
      setWorkflows(updatedWorkflows || []);
      const updatedGoals = await goalService.getGoalsByCfl(CFL_EMP_ID, code);
      setGoals(updatedGoals || []);
      setShowGoalForm(false);
    } catch (err) {
      alert('Failed to save draft goals: ' + err.message);
    } finally {
      setSavingGoal(false);
    }
  };

  const handleSubmitForApproval = async () => {
    const totalW = calculateTotalWeightage();
    if (totalW > 100) {
      setWeightageAlertModal({ show: true, type: 'EXCEEDS', totalW });
      return;
    }
    if (totalW < 100) {
      setWeightageAlertModal({ show: true, type: 'INCOMPLETE', totalW });
      return;
    }

    try {
      setSubmittingGoals(true);
      const code = getStageCode(activeTab);
      const goalRequests = smartGoalCards
        .filter(card => card.title && card.title.trim())
        .map(card => ({
          id: card.dbId || (card.id && typeof card.id === 'number' && card.id > 100 ? card.id : null),
          cflEmpId: CFL_EMP_ID,
          stageCode: code,
          title: card.title,
          description: card.target,
          targetDate: '2026-07-31',
          weightage: Number(card.weightage) || 25
        }));

      // Submit goals using batch sync payload
      await goalService.submitGoals(CFL_EMP_ID, code, goalRequests);
      alert(`Goals for ${getPlanTitle(activeTab)} submitted successfully for Manager Approval!`);
      const updatedWorkflows = await goalService.getWorkflowByCfl(CFL_EMP_ID);
      setWorkflows(updatedWorkflows || []);
      const updatedGoals = await goalService.getGoalsByCfl(CFL_EMP_ID, code);
      setGoals(updatedGoals || []);
      setShowGoalForm(false);
    } catch (err) {
      alert('Failed to submit goals for approval: ' + err.message);
    } finally {
      setSubmittingGoals(false);
    }
  };

  const userData = {
    name: profileData?.cflName || `CFL ${CFL_EMP_ID}`,
    role: profileData?.role || 'Jr Developer – Java Full Stack',
    empId: String(profileData?.cflEmpCode || CFL_EMP_ID),
    location: (profileData?.location && profileData.location.includes('Bengaluru'))
      ? 'RO (Bengaluru)'
      : (profileData?.location || 'RO (Bengaluru)'),
    department: profileData?.businessUnit || profileData?.department || 'SSD',
    reportingTo: profileData?.managerName || 'Amit Chauhan'
  };

  // Annual Review (G100) status helpers
  const empCodeForAnnualReview = userData?.empId || CFL_EMP_ID;
  const storedAnnualReviewRaw = localStorage.getItem(`annual_review_G100_${empCodeForAnnualReview}`);
  let storedAnnualReview = null;
  if (storedAnnualReviewRaw) {
    try { storedAnnualReview = JSON.parse(storedAnnualReviewRaw); } catch (e) { }
  }
  const isAnnualReviewSubmitted = storedAnnualReview?.status === 'SUBMITTED' || storedAnnualReview?.status === 'SUBMITTED_TO_EMPLOYEE' || storedAnnualReview?.status === 'SUBMITTED_TO_HR' || storedAnnualReview?.status === 'COMPLETED_SUBMITTED_HR' || workflows.some(w => w.stageCode === 'G100' && w.submissionStatus === 'SUBMITTED');
  const isManagerSubmitted = storedAnnualReview?.status === 'SUBMITTED_TO_EMPLOYEE' || storedAnnualReview?.status === 'SUBMITTED_TO_HR' || storedAnnualReview?.status === 'COMPLETED_SUBMITTED_HR' || Boolean(storedAnnualReview?.managerRemarks) || currentWf?.status === 'COMPLETED' || currentWf?.status === 'CYCLE_COMPLETED';
  const isSubmittedToHr = storedAnnualReview?.status === 'SUBMITTED_TO_HR' || storedAnnualReview?.status === 'COMPLETED_SUBMITTED_HR' || currentWf?.status === 'CYCLE_COMPLETED' || currentWf?.status === 'SUBMITTED_TO_HR';


  const getPlanTitle = (tabKey) => {
    switch (tabKey) {
      case 'thirty-days': return 'Thirty Days Plan';
      case 'sixty-days': return 'Sixty Days Plan';
      case 'ninety-days': return 'Ninety Days Plan';
      case 'final-review': return 'Final Review';
      default: return 'Thirty Days Plan';
    }
  };

  const planDetails = {
    financialYear: activeTab === 'final-review' ? '2025-2026' : '2026-2027',
    reviewType: activeTab === 'final-review' ? 'Annual' : 'Quarterly',
    currentPlan: getPlanTitle(activeTab),
    cycleEndDate: activeTab === 'final-review' ? '31 May 2026' : '31 Jul 2026'
  };

  const handleSelfReviewSubmit = async () => {
    setSubmittingSelfReview(true);
    try {
      const code = getStageCode(activeTab);
      const ratingsPayload = smartGoalCards.map(goal => ({
        goalId: goal.id,
        selfRating: parseInt(selfReviewRatings[goal.id] || 5, 10),
        selfRemarks: selfReviewComments[goal.id] || ''
      }));
      await goalService.submitSelfReview(CFL_EMP_ID, code, ratingsPayload);
      setIsSelfReviewCompleted(true);
      setShowSelfReviewModal(false);
      const wfData = await goalService.getWorkflowByCfl(CFL_EMP_ID);
      if (wfData) {
        setWorkflows(Array.isArray(wfData) ? wfData : [wfData]);
      }
    } catch (err) {
      console.error('Error submitting self review:', err);
      setIsSelfReviewCompleted(true);
      setShowSelfReviewModal(false);
    } finally {
      setSubmittingSelfReview(false);
    }
  };

  const handleSelfAcceptanceSubmit = async () => {
    setSubmittingSelfAcceptance(true);
    try {
      const code = getStageCode(activeTab);
      let statusLabel = isSatisfiedWithManager ? 'SATISFIED' : 'DISSATISFIED';
      if (selectedSatisfactionEmoji === '😍') statusLabel = 'VERY_SATISFIED';
      else if (selectedSatisfactionEmoji === '😊') statusLabel = 'SATISFIED';
      else if (selectedSatisfactionEmoji === '😐') statusLabel = 'NEUTRAL';
      else if (selectedSatisfactionEmoji === '🙁') statusLabel = 'DISSATISFIED';
      else if (selectedSatisfactionEmoji === '😠') statusLabel = 'VERY_DISSATISFIED';

      await goalService.submitSelfAcceptance(CFL_EMP_ID, code, isSatisfiedWithManager, selfAcceptanceRemarksInput, statusLabel);
      setShowSelfAcceptanceModal(false);
      const wfData = await goalService.getWorkflowByCfl(CFL_EMP_ID);
      if (wfData) {
        setWorkflows(Array.isArray(wfData) ? wfData : [wfData]);
      }
    } catch (err) {
      console.error('Error submitting self acceptance:', err);
      setShowSelfAcceptanceModal(false);
    } finally {
      setSubmittingSelfAcceptance(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in duration-300 font-inter select-none">
      {/* Page Title Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1B1418] tracking-tight font-grotesk">
          My Performance
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium font-inter">
          Set your SMART goals and track them through to final sign-off.
        </p>
      </div>

      {/* 1. User Info Header Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-[240px]">
          <div className="w-14 h-14 rounded-full bg-[#78161A] text-white flex items-center justify-center font-bold text-xl font-grotesk shadow-sm flex-shrink-0">
            {userData.name ? userData.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight font-grotesk">
              {userData.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 font-inter">
              {userData.role}
            </p>
          </div>
        </div>

        {/* Horizontal metadata columns */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 w-full border-t md:border-t-0 md:border-l border-[#EAE3E4] pt-4 md:pt-0 md:pl-8">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">EMPLOYEE CODE</div>
            <div className="text-xs font-black text-slate-800 mt-1 font-inter">{userData.empId}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">LOCATION</div>
            <div className="text-xs font-black text-slate-800 mt-1 font-inter">{userData.location}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">DEPARTMENT</div>
            <div className="text-xs font-black text-slate-800 mt-1 font-inter">{userData.department}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">REPORTING TO</div>
            <div className="text-xs font-black text-slate-800 mt-1 font-inter">{userData.reportingTo}</div>
          </div>
        </div>
      </div>

      {/* 2. Financial Year & Plan Details Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] px-8 py-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">FINANCIAL YEAR</div>
          <div className="text-xs font-black text-slate-800 mt-1 font-inter">{planDetails.financialYear}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">REVIEW TYPE</div>
          <div className="text-xs font-bold text-[#78161A] mt-1 font-inter">{planDetails.reviewType}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">CURRENT PLAN</div>
          <div className="text-xs font-bold text-[#78161A] mt-1 font-inter">{getPlanTitle(activeTab)}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter">CYCLE END DATE</div>
          <div className="text-xs font-black text-slate-800 mt-1 font-inter">{isPlanActivated(activeTab) ? planDetails.cycleEndDate : '—'}</div>
        </div>
      </div>

      {/* 3. Horizontal Pill Tabs Selection Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => handleTabChange('thirty-days')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${activeTab === 'thirty-days'
            ? 'bg-[#78161A] text-white'
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
        >
          Thirty Days Plan {!isPlanActivated('thirty-days') && <span className="font-normal text-slate-400">(Not Created)</span>}
        </button>

        <button
          onClick={() => handleTabChange('sixty-days')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${activeTab === 'sixty-days'
            ? 'bg-[#78161A] text-white'
            : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
            }`}
        >
          Sixty Days Plan {!isPlanActivated('sixty-days') && <span className="font-normal text-slate-400">(Not Created)</span>}
        </button>

        <button
          onClick={() => handleTabChange('ninety-days')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${activeTab === 'ninety-days'
            ? 'bg-[#78161A] text-white'
            : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
            }`}
        >
          Ninety Days Plan {!isPlanActivated('ninety-days') && <span className="font-normal text-slate-400">(Not Created)</span>}
        </button>

        <button
          onClick={() => handleTabChange('final-review')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${activeTab === 'final-review'
            ? 'bg-[#78161A] text-white'
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
        >
          <span className="text-amber-500">🎖️</span> Final Review {!isPlanActivated('final-review') && <span className="font-normal text-slate-400">(Not Created)</span>}
        </button>
      </div>

      {/* 4. Plan Content or Lock Screen */}
      {!isPlanActivated(activeTab) ? (
        <div className="bg-white rounded-2xl border border-[#EAE3E4] p-16 shadow-sm text-center flex flex-col items-center justify-center space-y-4 min-h-[380px]">
          <div className="w-16 h-16 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-3xl shadow-xs">
            🔒
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-base font-bold text-slate-800 font-grotesk">
              HR has not started the {getPlanTitle(activeTab)} review yet
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed font-inter">
              Once HR configures and activates {getPlanTitle(activeTab)}, you'll be able to add and submit your SMART goals here.
            </p>
          </div>
        </div>
      ) : activeTab === 'final-review' ? (
        showCflAnnualReviewForm ? (
          <div className="space-y-6 animate-fade-in duration-300 font-inter text-left">
            {/* Back Navigation Link */}
            <button
              type="button"
              onClick={() => setShowCflAnnualReviewForm(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Back</span>
            </button>

            {/* Read-only Preview Banner if Submitted */}
            {isAnnualReviewSubmitted && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs p-3.5 rounded-xl flex items-center justify-between font-inter">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Annual Performance Review Submitted to Manager (R1) · Ineditable Preview Mode</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wider">Read-Only</span>
              </div>
            )}

            {/* Header Title & Subtitle */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight font-grotesk flex items-center gap-2">
                <span>📝</span>
                <span>Annual Performance Review</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium font-inter mt-0.5">
                Financial Year 2025-2026
              </p>
            </div>

            {/* 1. Employee Information Card */}
            <div className="rounded-2xl border border-[#EAE3E4] bg-white overflow-hidden shadow-xs">
              <div className="bg-[#78161A] text-white px-5 py-3.5 font-bold font-grotesk text-sm flex items-center gap-2">
                <span>👤</span>
                <span>Employee Information</span>
              </div>
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3.5 min-w-[200px]">
                  <div className="w-12 h-12 rounded-full bg-[#78161A] text-white flex items-center justify-center font-bold text-lg font-grotesk shadow-sm">
                    {userData.name ? userData.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-grotesk">{userData.name}</h4>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 border-t md:border-t-0 md:border-l border-[#EAE3E4] pt-4 md:pt-0 md:pl-8">
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-inter">EMPLOYEE CODE</div>
                    <div className="text-xs font-black text-slate-800 mt-1 font-inter">{userData.empId}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-inter">MANAGER NAME</div>
                    <div className="text-xs font-black text-slate-800 mt-1 font-inter">{userData.reportingTo}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-inter">FINANCIAL YEAR</div>
                    <div className="text-xs font-black text-slate-800 mt-1 font-inter">2025-2026</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Employee Section Card (Key Accomplishments for the financial year) */}
            <div className="rounded-2xl border border-[#EAE3E4] bg-white overflow-hidden shadow-xs">
              <div className="bg-[#78161A] text-white px-5 py-4 font-bold font-grotesk text-sm">
                <div className="flex items-center gap-2">
                  <span>📜</span>
                  <span>Employee Section</span>
                </div>
                <p className="text-xs font-normal text-white/80 font-inter mt-0.5">
                  Key Accomplishments for the financial year
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* KEY ACCOMPLISHMENTS * */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 font-inter">
                    KEY ACCOMPLISHMENTS <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    value={cflKeyAccomplishments}
                    disabled={isAnnualReviewSubmitted}
                    onChange={(e) => setCflKeyAccomplishments(e.target.value)}
                    placeholder="Describe your key accomplishments for the financial year in detail..."
                    className={`w-full h-36 p-4 rounded-xl border border-slate-300 text-xs font-inter text-slate-800 placeholder-slate-400 font-medium resize-none shadow-inner ${isAnnualReviewSubmitted ? 'bg-slate-100/70 text-slate-700 cursor-not-allowed border-slate-200' : 'focus:outline-none focus:ring-2 focus:ring-[#78161A]/30'
                      }`}
                  />
                  <span className="text-[11px] text-slate-400 font-medium font-inter mt-1.5 block">
                    Summarize your key achievements, completed projects, and contributions during this financial year.
                  </span>
                </div>

                {/* Compliance Check: POSH Certificate * */}
                <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-5 space-y-3 font-inter">
                  <div className="text-xs font-bold text-rose-900 font-grotesk flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Compliance Check: POSH Certificate <span className="text-rose-600">*</span></span>
                    </div>
                    {uploadingPosh && <span className="text-xs text-rose-600 font-bold animate-pulse">Uploading to server...</span>}
                  </div>
                  <p className="text-xs text-rose-800 font-medium leading-relaxed">
                    Please upload your POSH (Prevention of Sexual Harassment) compliance certificate in any format (PDF, Word .doc/.docx, PNG/JPG image, etc.). This is a mandatory requirement for annual review submission.
                  </p>

                  <input
                    type="file"
                    id="cfl-posh-upload-input"
                    className="hidden"
                    disabled={isAnnualReviewSubmitted || uploadingPosh}
                    accept="*/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        try {
                          setUploadingPosh(true);
                          const uploadedDoc = await documentService.upload(file, CFL_EMP_ID, 'POSH_CERTIFICATE');
                          setPoshDocRecord(uploadedDoc);
                          setCflPoshFile(file);

                          const empCode = userData.empId || CFL_EMP_ID;
                          const storedRaw = localStorage.getItem(`annual_review_G100_${empCode}`);
                          let parsed = {};
                          if (storedRaw) {
                            try { parsed = JSON.parse(storedRaw); } catch (err) { }
                          }
                          parsed.poshCertificateName = file.name;
                          parsed.poshDocumentId = uploadedDoc.id;
                          localStorage.setItem(`annual_review_G100_${empCode}`, JSON.stringify(parsed));
                          alert(`Successfully uploaded "${file.name}" to folder storage & DB table!`);
                        } catch (err) {
                          console.error('POSH certificate upload failed:', err);
                          alert('Failed to upload POSH Certificate to server folder: ' + (err.response?.data || err.message));
                        } finally {
                          setUploadingPosh(false);
                        }
                      }
                    }}
                  />

                  {poshDocRecord || cflPoshFile || isAnnualReviewSubmitted ? (
                    <div className="bg-white border border-emerald-300 rounded-xl p-3 flex items-center justify-between text-xs shadow-2xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <span>✓</span>
                        <span>{poshDocRecord ? poshDocRecord.fileName : (cflPoshFile ? cflPoshFile.name : (storedAnnualReview?.poshCertificateName || 'POSH Completion Certificate'))}</span>
                        {(poshDocRecord?.fileSize || cflPoshFile?.size) && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({Math.round(((poshDocRecord?.fileSize || cflPoshFile?.size) / 1024))} KB)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const docId = poshDocRecord?.id;
                            if (docId) {
                              window.open(documentService.getViewUrl(docId), '_blank');
                            } else {
                              setShowPoshViewerModal(true);
                            }
                          }}
                          className="px-3.5 py-1.5 bg-[#78161A] hover:bg-[#601115] text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>👁️</span>
                          <span>View Certificate</span>
                        </button>
                        {!isAnnualReviewSubmitted && (
                          <button
                            type="button"
                            onClick={() => {
                              document.getElementById('cfl-posh-upload-input')?.click();
                            }}
                            className="text-slate-500 hover:text-slate-800 font-bold text-xs underline cursor-pointer"
                          >
                            Re-upload
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={uploadingPosh}
                      onClick={() => document.getElementById('cfl-posh-upload-input')?.click()}
                      className="px-5 py-2.5 bg-[#78161A] hover:bg-[#601115] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>📤</span>
                      <span>{uploadingPosh ? 'Uploading...' : 'Upload POSH Certificate'}</span>
                    </button>
                  )}

                  <div className="text-[11px] text-rose-700 font-bold font-inter">
                    ⚠️ POSH certificate is mandatory. Please upload before submitting.
                  </div>
                </div>

                {/* CERTIFICATIONS * */}
                <div className="space-y-3 font-inter">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    CERTIFICATIONS <span className="text-rose-600">*</span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      disabled={isAnnualReviewSubmitted}
                      checked={cflCertificationsNotApplicable}
                      onChange={(e) => setCflCertificationsNotApplicable(e.target.checked)}
                      className="mt-0.5 rounded text-[#78161A] focus:ring-[#78161A]"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Not Applicable (N/A)</span>
                      <span className="text-[11px] text-slate-400 font-medium block">Select this if you have no certifications to add</span>
                    </div>
                  </label>

                  {!isAnnualReviewSubmitted && (
                    <button
                      type="button"
                      onClick={() => {
                        const cert = prompt("Enter Certification Name:");
                        if (cert && cert.trim()) {
                          setCflCertificationsList(prev => [...prev, cert.trim()]);
                          setCflCertificationsNotApplicable(false);
                        }
                      }}
                      className="text-xs font-bold text-[#78161A] hover:underline cursor-pointer flex items-center gap-1 mt-2"
                    >
                      <span>+ Add Certification</span>
                    </button>
                  )}

                  {cflCertificationsList.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {cflCertificationsList.map((cert, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs font-medium text-slate-800">
                          <span>🎓 {cert}</span>
                          {!isAnnualReviewSubmitted && (
                            <button
                              type="button"
                              onClick={() => setCflCertificationsList(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-600 font-bold hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!cflCertificationsNotApplicable && cflCertificationsList.length === 0 && (
                    <div className="bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium p-3.5 rounded-xl flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Please add at least one certification or select the N/A option above.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Blue Alert Info Box */}
            <div className="bg-blue-50/80 border-l-4 border-blue-500 rounded-r-xl p-4 text-xs text-blue-950 font-medium font-inter shadow-2xs flex items-start gap-3">
              <span className="text-base text-blue-600">ℹ️</span>
              <p className="leading-relaxed">
                Your annual review will be sent to your manager (R1) for assessment. Please ensure you've included all key accomplishments for the financial year before submitting. POSH certificate is mandatory. Either add at least one certification or select the N/A option above. You can re-upload certificates if needed.
              </p>
            </div>

            {/* Bottom Footer Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {isAnnualReviewSubmitted ? (
                <button
                  type="button"
                  onClick={() => setShowCflAnnualReviewForm(false)}
                  className="px-6 py-2.5 bg-[#78161A] hover:bg-[#601115] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>← Back to Dashboard</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      const empCode = userData.empId || CFL_EMP_ID;
                      const payloadData = {
                        cflEmpId: empCode,
                        stageCode: 'G100',
                        keyAccomplishments: cflKeyAccomplishments,
                        poshCertificateName: cflPoshFile ? cflPoshFile.name : 'POSH Completion Certificate',
                        certifications: cflCertificationsList,
                        notApplicableCertifications: cflCertificationsNotApplicable,
                        status: 'DRAFT',
                        savedAt: new Date().toISOString()
                      };
                      localStorage.setItem(`annual_review_G100_${empCode}`, JSON.stringify(payloadData));

                      try {
                        await goalService.batchSyncGoals(empCode, 'G100', [
                          {
                            cflEmpId: empCode,
                            stageCode: 'G100',
                            title: 'Annual Review Accomplishments',
                            description: cflKeyAccomplishments || 'Key Accomplishments Draft',
                            targetDate: '2026-05-31',
                            weightage: 100
                          }
                        ]);
                      } catch (e) {
                        console.warn('Backend sync warning:', e.message);
                      }
                      alert("Annual Performance Review draft saved successfully!");
                    }}
                    className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>💾</span>
                    <span>Save Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!cflKeyAccomplishments || !cflKeyAccomplishments.trim()) {
                        alert("Please provide your Key Accomplishments before submitting.");
                        return;
                      }
                      if (!cflPoshFile && !localStorage.getItem(`annual_review_G100_${userData.empId}`)) {
                        alert("POSH Certificate is mandatory. Please upload before submitting.");
                        return;
                      }
                      if (!cflCertificationsNotApplicable && cflCertificationsList.length === 0) {
                        alert("Please add at least one certification or select N/A.");
                        return;
                      }

                      const empCode = userData.empId || CFL_EMP_ID;
                      const payloadData = {
                        cflEmpId: empCode,
                        stageCode: 'G100',
                        keyAccomplishments: cflKeyAccomplishments,
                        poshCertificateName: cflPoshFile ? cflPoshFile.name : 'POSH Completion Certificate',
                        certifications: cflCertificationsList,
                        notApplicableCertifications: cflCertificationsNotApplicable,
                        status: 'SUBMITTED',
                        submittedAt: new Date().toISOString()
                      };
                      localStorage.setItem(`annual_review_G100_${empCode}`, JSON.stringify(payloadData));

                      try {
                        await goalService.submitGoals(empCode, 'G100', [
                          {
                            cflEmpId: empCode,
                            stageCode: 'G100',
                            title: 'Annual Review Accomplishments',
                            description: cflKeyAccomplishments,
                            targetDate: '2026-05-31',
                            weightage: 100
                          }
                        ]);
                        alert("Annual Performance Review submitted successfully to R1 Manager!");
                        setShowCflAnnualReviewForm(false);
                        const updatedWorkflows = await goalService.getWorkflowByCfl(empCode);
                        setWorkflows(updatedWorkflows || []);
                      } catch (err) {
                        console.warn('Backend submission warning:', err.message);
                        alert("Annual Performance Review submitted to R1 Manager!");
                        setShowCflAnnualReviewForm(false);
                      }
                    }}
                    className="px-6 py-2.5 bg-[#78161A] hover:bg-[#601115] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>🚩</span>
                    <span>Submit to R1</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in duration-300 font-inter text-left">
            {/* Annual Review Status Card */}
            <div className="rounded-2xl border border-[#EAE3E4] bg-white overflow-hidden shadow-xs">
              {/* Burgundy Red Header Banner */}
              <div className="bg-[#78161A] text-white p-5 font-bold font-grotesk flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Annual Review Status
                  </h3>
                  <p className="text-xs font-normal text-white/80 mt-0.5 font-inter">
                    Final review process for FY 2025-2026
                  </p>
                </div>
                <div className="text-right font-inter">
                  <span className="text-[10px] uppercase font-extrabold text-white/70 tracking-wider block">CYCLE END DATE</span>
                  <span className="text-xs font-bold text-white">31 May 2026</span>
                </div>
              </div>

              {/* Card Body Grid (3 Cards) */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Submitted to R1 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-rose-100/70 text-[#78161A] flex items-center justify-center text-lg mb-3">
                      📑
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 font-grotesk">Submitted to R1</h4>
                    <div className="mt-4">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">STATUS</span>
                      <div className="mt-1.5">
                        {isAnnualReviewSubmitted ? (
                          <span className="inline-block bg-emerald-100/80 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 rounded-md text-xs">
                            Submitted
                          </span>
                        ) : (
                          <span className="inline-block bg-rose-100/80 text-rose-800 border border-rose-200 font-bold px-3 py-1 rounded-md text-xs">
                            Pending
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 block mt-2 font-inter">
                        {isAnnualReviewSubmitted ? 'Submitted' : 'Not Submitted'}
                      </span>
                    </div>
                  </div>

                  {isAnnualReviewSubmitted ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (storedAnnualReview) {
                          setCflKeyAccomplishments(storedAnnualReview.keyAccomplishments || '');
                          setCflCertificationsList(storedAnnualReview.certifications || []);
                          setCflCertificationsNotApplicable(storedAnnualReview.notApplicableCertifications || false);
                        }
                        setShowCflAnnualReviewForm(true);
                      }}
                      className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>👁️</span>
                      <span>Preview</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCflAnnualReviewForm(true)}
                      className="w-full mt-4 py-2.5 bg-[#78161A] hover:bg-[#601115] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>💻</span>
                      <span>Submit to R1</span>
                    </button>
                  )}
                </div>

                {/* Card 2: Manager Annual Review */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-100/70 text-purple-700 flex items-center justify-center text-lg mb-3">
                      👤
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 font-grotesk">Manager Annual Review</h4>
                    <div className="mt-4">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">STATUS</span>
                      <div className="mt-1.5">
                        {isManagerSubmitted ? (
                          <span className="inline-block bg-emerald-100/80 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 rounded-md text-xs">
                            Completed
                          </span>
                        ) : isAnnualReviewSubmitted ? (
                          <span className="inline-block bg-amber-100 text-amber-800 border border-amber-200 font-semibold px-3 py-1 rounded-md text-xs">
                            In Progress (Under Review)
                          </span>
                        ) : (
                          <span className="inline-block bg-slate-100 text-slate-600 border border-slate-200 font-semibold px-3 py-1 rounded-md text-xs">
                            Waiting for Submission
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 block mt-2 font-inter">
                        {isManagerSubmitted ? 'Review Received' : isAnnualReviewSubmitted ? 'Awaiting Manager Feedback' : 'Not Reviewed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Final Submit to HR */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center text-lg mb-3">
                      ☑️
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 font-grotesk">Final Submit to HR</h4>
                    <div className="mt-4">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">STATUS</span>
                      <div className="mt-1.5">
                        {isSubmittedToHr ? (
                          <span className="inline-block bg-emerald-100/80 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 rounded-md text-xs">
                            Submitted to HR
                          </span>
                        ) : isManagerSubmitted ? (
                          <span className="inline-block bg-rose-100 text-[#78161A] border border-rose-200 font-bold px-3 py-1 rounded-md text-xs animate-pulse">
                            Action Required
                          </span>
                        ) : (
                          <span className="inline-block bg-slate-100 text-slate-600 border border-slate-200 font-semibold px-3 py-1 rounded-md text-xs">
                            Waiting for Manager Review
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 block mt-2 font-inter">
                        {isSubmittedToHr ? 'Submitted to HR' : isManagerSubmitted ? 'Ready for Final Submission' : 'Not Submitted'}
                      </span>
                    </div>
                  </div>

                  {isSubmittedToHr ? (
                    <div className="w-full mt-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] rounded-xl text-center">
                      ✓ Submitted to HR
                    </div>
                  ) : isManagerSubmitted ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const empCode = userData.empId || CFL_EMP_ID;
                        const existingRaw = localStorage.getItem(`annual_review_G100_${empCode}`);
                        let existingData = {};
                        if (existingRaw) {
                          try { existingData = JSON.parse(existingRaw); } catch (e) { }
                        }
                        const updated = {
                          ...existingData,
                          status: 'SUBMITTED_TO_HR',
                          cflSubmittedAt: new Date().toISOString()
                        };
                        localStorage.setItem(`annual_review_G100_${empCode}`, JSON.stringify(updated));

                        try {
                          await goalService.submitSelfAcceptance(empCode, 'G100', true, 'Accepted Manager Evaluation and Submitted to HR', 'SATISFIED');
                        } catch (e) {
                          console.warn('Backend submitSelfAcceptance notice:', e.message);
                        }
                        alert("Annual Performance Review submitted to HR successfully!");
                        window.location.reload();
                      }}
                      className="w-full mt-4 py-2.5 bg-[#78161A] hover:bg-[#601115] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>🚩</span>
                      <span>Accept & Submit to HR</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Manager Feedback & 9-Box Assessment Card (Displayed when Manager has submitted) */}
            {isManagerSubmitted && storedAnnualReview && (
              <div className="rounded-2xl border border-[#EAE3E4] bg-white overflow-hidden shadow-xs space-y-0">
                <div className="bg-[#78161A] text-white p-5 font-bold font-grotesk flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                      📋
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-wide">
                        Manager Assessment & 9-Box Results
                      </h3>
                      <p className="text-xs font-normal text-white/80 mt-0.5 font-inter">
                        Evaluated by Manager ({userData.reportingTo})
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    Review Received
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  {/* Manager Remarks Box */}
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-2 font-inter">
                      MANAGER'S REMARKS
                    </span>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 font-medium leading-relaxed font-inter flex items-start gap-3">
                      <span className="text-base text-[#78161A] shrink-0">💬</span>
                      <p className="whitespace-pre-wrap">
                        {storedAnnualReview.managerRemarks || "Outstanding performance and key accomplishments during this financial year."}
                      </p>
                    </div>
                  </div>

                  {/* 9-Box Grid Assessment Summary */}
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
                        <span className="text-xs font-black text-slate-800 mt-1">
                          {storedAnnualReview.talentStatus || "Key Talent"}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold text-rose-900 uppercase tracking-wider">
                          MANAGER RATING
                        </span>
                        <span className="text-xs font-black text-slate-800 mt-1">
                          {storedAnnualReview.managerRating || "A+"}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold text-rose-900 uppercase tracking-wider">
                          RATING DESCRIPTION
                        </span>
                        <span className="text-xs font-black text-slate-800 mt-1">
                          {storedAnnualReview.ratingDescription || "Outstanding Contributor"}
                        </span>
                      </div>
                    </div>

                    {/* Evaluated Inputs */}
                    <div className="grid grid-cols-3 gap-4 border-t border-rose-100/80 pt-3 mt-4 text-[11px]">
                      <div>
                        <span className="text-slate-400 font-bold block">Achievement Level</span>
                        <span className="font-bold text-slate-700">{storedAnnualReview.achievementLevel || "Exceptional"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">Potential</span>
                        <span className="font-bold text-slate-700">{storedAnnualReview.potentialSelection || "High"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">Performance</span>
                        <span className="font-bold text-slate-700">{storedAnnualReview.performanceSelection || "High"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Annual Review Process Timeline Card */}
            <div className="rounded-2xl border border-[#EAE3E4] bg-white p-6 shadow-xs space-y-6">
              <h4 className="text-xs font-bold text-slate-800 font-grotesk border-b border-slate-100 pb-3">
                Annual Review Process Timeline
              </h4>

              {/* Stepper Timeline row */}
              <div className="flex items-center justify-between max-w-3xl mx-auto px-4 py-2 font-inter">
                {/* Node 1: Submitted to R1 */}
                <div className="flex flex-col items-center text-center space-y-2">
                  {isAnnualReviewSubmitted ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-base flex items-center justify-center border-4 border-emerald-100 shadow-xs">
                      ✓
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#78161A] text-white font-bold text-sm flex items-center justify-center border-4 border-rose-100 shadow-xs">
                      1
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    Submitted to R1
                  </span>
                  {isAnnualReviewSubmitted ? (
                    <span className="text-[10px] font-extrabold text-emerald-600 tracking-wider uppercase">
                      COMPLETED
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-[#78161A] tracking-wider uppercase">
                      IN PROGRESS
                    </span>
                  )}
                </div>

                {/* Connector Line 1-2 */}
                <div className={`flex-1 h-0.5 mx-4 -mt-8 transition-all ${isAnnualReviewSubmitted ? 'bg-emerald-500' : 'bg-slate-200'}`} />

                {/* Node 2: Manager Annual Review */}
                <div className="flex flex-col items-center text-center space-y-2">
                  {isManagerSubmitted ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-base flex items-center justify-center border-4 border-emerald-100 shadow-xs">
                      ✓
                    </div>
                  ) : isAnnualReviewSubmitted ? (
                    <div className="w-10 h-10 rounded-full bg-[#78161A] text-white font-bold text-sm flex items-center justify-center border-4 border-rose-100 shadow-xs">
                      2
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-300 text-slate-400 font-bold text-sm flex items-center justify-center">
                      2
                    </div>
                  )}
                  <span className={`text-xs font-bold leading-tight ${isManagerSubmitted || isAnnualReviewSubmitted ? 'text-slate-800' : 'text-slate-600'}`}>
                    Manager Annual Review
                  </span>
                  {isManagerSubmitted ? (
                    <span className="text-[10px] font-extrabold text-emerald-600 tracking-wider uppercase">
                      COMPLETED
                    </span>
                  ) : isAnnualReviewSubmitted ? (
                    <span className="text-[10px] font-extrabold text-[#78161A] tracking-wider uppercase">
                      IN PROGRESS
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      PENDING
                    </span>
                  )}
                </div>

                {/* Connector Line 2-3 */}
                <div className={`flex-1 h-0.5 mx-4 -mt-8 transition-all ${isManagerSubmitted ? 'bg-emerald-500' : 'bg-slate-200'}`} />

                {/* Node 3: Final Submit to HR */}
                <div className="flex flex-col items-center text-center space-y-2">
                  {isSubmittedToHr ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-base flex items-center justify-center border-4 border-emerald-100 shadow-xs">
                      ✓
                    </div>
                  ) : isManagerSubmitted ? (
                    <div className="w-10 h-10 rounded-full bg-[#78161A] text-white font-bold text-sm flex items-center justify-center border-4 border-rose-100 shadow-xs">
                      3
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-300 text-slate-400 font-bold text-sm flex items-center justify-center">
                      3
                    </div>
                  )}
                  <span className={`text-xs font-bold leading-tight ${isSubmittedToHr || isManagerSubmitted ? 'text-slate-800' : 'text-slate-600'}`}>
                    Final Submit to HR
                  </span>
                  {isSubmittedToHr ? (
                    <span className="text-[10px] font-extrabold text-emerald-600 tracking-wider uppercase">
                      COMPLETED
                    </span>
                  ) : isManagerSubmitted ? (
                    <span className="text-[10px] font-extrabold text-[#78161A] tracking-wider uppercase">
                      IN PROGRESS
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      PENDING
                    </span>
                  )}
                </div>
              </div>

              {/* Legend Footer */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-600 font-inter">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Draft</span>
                </div>
              </div>
            </div>
          </div>
        )
      ) : !showGoalForm ? (
        /* STAGE CARDS OVERVIEW VIEW */
        <div className="space-y-6 text-left">
          {/* Plan Header Banner */}
          <div className="bg-[#78161A] text-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-grotesk tracking-wide text-white">
                {getPlanTitle(activeTab)}
              </h3>
              <p className="text-xs text-white/80 font-medium font-inter mt-1">
                01 Apr 2026 to 30 Apr 2026
              </p>
            </div>

            <div className="bg-black/25 border border-white/10 rounded-xl px-5 py-2 text-right">
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/70 block">CYCLE END DATE</span>
              <span className="text-xs font-black text-white font-grotesk mt-0.5 block">30 Apr 2026</span>
            </div>
          </div>

          {/* Manager Remarks / Requested Changes Alert Banner */}
          {isRevisionRequested ? (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-amber-900 shadow-xs space-y-2 font-inter">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm font-grotesk">
                  <span className="text-base">⚠️</span>
                  <span>Manager Requested Changes / Feedback</span>
                </div>
                <span className="bg-amber-200/60 text-amber-900 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-amber-200/60">
                "{currentWf?.managerRemarks || 'Your manager requested changes to your SMART goals. Please review feedback and re-submit for approval.'}"
              </p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowGoalForm(true)}
                  className="px-4 py-2 bg-[#78161A] hover:bg-[#631013] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Edit & Re-submit Goals</span>
                </button>
              </div>
            </div>
          ) : currentWf?.managerRemarks ? (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-purple-950 shadow-xs space-y-2 font-inter">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-sm font-grotesk">
                  <span className="text-base">💬</span>
                  <span>Manager Approval Feedback & Remarks</span>
                </div>
                <span className="bg-purple-100 text-purple-900 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-300">
                  Manager Remarks
                </span>
              </div>
              <p className="text-xs text-purple-900 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-purple-200/60">
                "{currentWf.managerRemarks}"
              </p>
            </div>
          ) : null}

          {/* CFL Self Acceptance Feedback Banner */}
          {(currentWf?.status === 'CYCLE_COMPLETED' || currentWf?.status === 'REASSESSMENT_REQUESTED' || (currentWf?.status === 'COMPLETED' && (currentWf?.selfAcceptanceRemarks || currentWf?.selfAcceptanceStatus))) && (currentWf?.selfAcceptanceRemarks || currentWf?.selfAcceptanceStatus) ? (
            <div className="bg-[#FFF8E7] border border-[#F5E6BE] rounded-2xl p-5 text-amber-950 shadow-xs space-y-2 font-inter">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm font-grotesk">
                  <span className="text-base">💬</span>
                  <span>Your Self Acceptance Feedback</span>
                </div>
                <span className={`font-bold text-[11px] px-3 py-1 rounded-full border ${currentWf.selfAcceptanceStatus?.includes('SATISFIED') || currentWf.selfAcceptanceStatus?.includes('Satisfied') || currentWf.selfAcceptanceStatus?.includes('NEUTRAL') || currentWf.selfAcceptanceStatus?.includes('Neutral') || currentWf.selfAcceptanceStatus?.includes('Accept') ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-200 text-amber-900 border-amber-300'}`}>
                  {formatSelfAcceptanceStatus(currentWf.selfAcceptanceStatus)}
                </span>
              </div>
              {currentWf.selfAcceptanceRemarks ? (
                <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block">Remarks / Notes:</span>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium mt-0.5">
                    "{currentWf.selfAcceptanceRemarks}"
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* 5 Stage Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Card 1: Goal Creation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-[#78161A] flex items-center justify-center text-lg mb-3">
                  🎯
                </div>
                <h4 className="text-xs font-bold text-slate-800 font-grotesk">Goal Creation</h4>
                <div className="mt-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">STATUS</span>
                  <div className="mt-1">
                    {isApproved || isSubmitted || currentWf?.status === 'CYCLE_COMPLETED' || currentWf?.status === 'COMPLETED' ? (
                      <span className="inline-block bg-[#E8F8EE] text-[#198754] border border-emerald-200 font-semibold px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Created On {currentWf?.goalSubmittedAt ? new Date(currentWf.goalSubmittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '03 Sept 2026'}
                      </span>
                    ) : isRevisionRequested ? (
                      <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Revision Requested
                      </span>
                    ) : (
                      <span className="inline-block bg-[#FFF8E7] text-[#8C6D1F] border border-[#F5E6BE] font-medium px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Draft — not yet submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isApproved || isSubmitted || currentWf?.status === 'CYCLE_COMPLETED' || currentWf?.status === 'COMPLETED' ? (
                <button
                  type="button"
                  onClick={() => setShowGoalForm(true)}
                  className="w-full mt-4 py-2 bg-white border border-[#78161A] hover:bg-rose-50 text-[#78161A] font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Preview Goals</span>
                </button>
              ) : isRevisionRequested ? (
                <button
                  type="button"
                  onClick={() => setShowGoalForm(true)}
                  className="w-full mt-4 py-2.5 bg-[#78161A] hover:bg-[#631013] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Edit & Re-submit Goals</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowGoalForm(true)}
                  className="w-full mt-4 py-2.5 bg-[#78161A] hover:bg-[#631013] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>+ Add Goal</span>
                </button>
              )}
            </div>

            {/* Card 2: Manager Approval */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg mb-3">
                  👤
                </div>
                <h4 className="text-xs font-bold text-slate-800 font-grotesk">Manager Approval</h4>
                <div className="mt-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">STATUS</span>
                  <div className="mt-1">
                    {isApproved ? (
                      <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Approved
                      </span>
                    ) : isSubmitted ? (
                      <span className="inline-block bg-[#FFF8E7] text-[#B45309] border border-[#F5E6BE] font-semibold px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Pending Manager Review
                      </span>
                    ) : isRevisionRequested ? (
                      <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Changes Requested
                      </span>
                    ) : (
                      <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200 font-medium px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        No Goals Submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Self Review */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg mb-3">
                  👤
                </div>
                <h4 className="text-xs font-bold text-slate-800 font-grotesk">Self Review</h4>
                <div className="mt-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">STATUS</span>
                  <div className="mt-1">
                    {isSelfReviewCompletedState ? (
                      <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Completed
                      </span>
                    ) : isApproved ? (
                      <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Pending Self Review
                      </span>
                    ) : (
                      <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200 font-medium px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Waiting for Approval
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isApproved && !isSelfReviewCompletedState && (
                <button
                  type="button"
                  onClick={() => setShowSelfReviewModal(true)}
                  className="w-full mt-4 py-2 bg-[#78161A] hover:bg-[#631013] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Start Self Review</span>
                </button>
              )}
            </div>

            {/* Card 4: Manager Final Review */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg mb-3">
                  ⭐
                </div>
                <h4 className="text-xs font-bold text-slate-800 font-grotesk">Manager Final Review</h4>
                <div className="mt-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">STATUS</span>
                  <div className="mt-1">
                    {effectiveWfStatus === 'COMPLETED' || effectiveWfStatus === 'CYCLE_COMPLETED' || effectiveWfStatus === 'REASSESSMENT_REQUESTED' ? (
                      <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Completed
                      </span>
                    ) : effectiveWfStatus === 'SELF_REVIEW_COMPLETED' ? (
                      <span className="inline-block bg-[#FFF8E7] text-[#B45309] border border-[#F5E6BE] font-semibold px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Pending Manager Review
                      </span>
                    ) : (
                      <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200 font-medium px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Waiting for Self Review
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: Self Acceptance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg mb-3">
                  ☑️
                </div>
                <h4 className="text-xs font-bold text-slate-800 font-grotesk">Self Acceptance</h4>
                <div className="mt-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-inter">STATUS</span>
                  <div className="mt-1">
                    {(effectiveWfStatus === 'CYCLE_COMPLETED' || effectiveWfStatus === 'REASSESSMENT_REQUESTED' || effectiveWfStatus === 'COMPLETED') && (currentWf?.selfAcceptanceStatus?.includes('SATISFIED') || currentWf?.selfAcceptanceStatus?.includes('NEUTRAL') || currentWf?.selfAcceptanceStatus?.includes('Satisfied') || currentWf?.selfAcceptanceStatus?.includes('Neutral') || currentWf?.selfAcceptanceStatus?.includes('Accept') || effectiveWfStatus === 'CYCLE_COMPLETED' || currentWf?.selfAcceptedAt) ? (
                      <span className="inline-block bg-[#E8F8EE] text-[#198754] border border-emerald-200 font-semibold px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Accepted On {currentWf?.selfAcceptedAt ? new Date(currentWf.selfAcceptedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'}
                      </span>
                    ) : (effectiveWfStatus === 'CYCLE_COMPLETED' || effectiveWfStatus === 'REASSESSMENT_REQUESTED' || effectiveWfStatus === 'COMPLETED') && (currentWf?.selfAcceptanceStatus?.includes('DISSATISFIED') || currentWf?.selfAcceptanceStatus?.includes('Clarification') || effectiveWfStatus === 'REASSESSMENT_REQUESTED') ? (
                      <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 font-semibold px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Clarification Requested
                      </span>
                    ) : effectiveWfStatus === 'COMPLETED' ? (
                      <span className="inline-block bg-blue-50 text-blue-800 border border-blue-200 font-semibold px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Pending Self Acceptance
                      </span>
                    ) : (
                      <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200 font-medium px-3 py-1.5 rounded-xl text-[11px] text-center w-full">
                        Waiting for Manager Final Review
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {currentWf?.status === 'COMPLETED' && !currentWf?.selfAcceptanceStatus && (
                <button
                  type="button"
                  onClick={() => setShowSelfAcceptanceModal(true)}
                  className="w-full mt-4 py-2 bg-[#78161A] hover:bg-[#631013] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Start Self Acceptance</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Cycle Banner */}
          <div className="bg-[#E8F8F0] border border-[#C6EDD7] text-[#137A47] font-bold text-xs p-4 rounded-xl flex items-center gap-2.5 shadow-2xs">
            <span className="text-base">ℹ️</span>
            <span>Cycle Status: <strong className="font-extrabold uppercase">{effectiveWfStatus === 'CYCLE_COMPLETED' ? 'COMPLETED' : effectiveWfStatus === 'REASSESSMENT_REQUESTED' ? 'REASSESSMENT REQUESTED' : 'ACTIVE'}</strong></span>
          </div>

          {/* Quarterly Timeline Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h4 className="text-xs font-bold text-slate-800 font-grotesk">Quarterly Timeline</h4>

            {(() => {
              const wfStat = effectiveWfStatus;
              const isStage1Done = isSubmitted || isApproved || isSelfReviewCompletedState;
              const isStage2Done = isApproved || isSelfReviewCompletedState;
              const isStage3Done = isSelfReviewCompletedState;
              const isStage4Done = wfStat === 'COMPLETED' || wfStat === 'CYCLE_COMPLETED' || wfStat === 'REASSESSMENT_REQUESTED' || (goals.length > 0 && goals.some(g => g.managerRating));
              const isStage5Done = wfStat === 'CYCLE_COMPLETED' || wfStat === 'REASSESSMENT_REQUESTED' || (wfStat === 'COMPLETED' && (!!currentWf?.selfAcceptanceStatus || !!currentWf?.selfAcceptedAt)) || (goals.length > 0 && goals.some(g => g.managerRating) && (!!currentWf?.selfAcceptanceStatus || !!currentWf?.selfAcceptanceRemarks));

              const progressWidth = isStage5Done ? '100%' : isStage4Done ? '75%' : isStage3Done ? '50%' : isStage2Done ? '25%' : isStage1Done ? '10%' : '0%';

              return (
                <div className="flex items-start justify-between relative px-8">
                  {/* Connector Line */}
                  <div className="absolute left-[48px] right-[48px] top-[18px] -translate-y-1/2 h-[2.5px] bg-slate-200 z-0">
                    <div
                      className="h-full bg-[#10B981] transition-all duration-500"
                      style={{ width: progressWidth }}
                    />
                  </div>

                  {/* Node 1: Goal Creation */}
                  <div className="flex flex-col items-center relative z-10 space-y-2 w-28">
                    {isStage1Done ? (
                      <div className="w-9 h-9 rounded-full bg-[#10B981] text-white font-bold text-sm flex items-center justify-center shadow-xs ring-4 ring-white">
                        <FaCheck className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#78161A] text-white font-bold text-sm flex items-center justify-center shadow-xs ring-4 ring-white">
                        1
                      </div>
                    )}
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-800 block">Goal Creation</span>
                      <span className={`text-[10px] font-extrabold block mt-0.5 ${isStage1Done ? 'text-[#10B981]' : 'text-[#78161A]'}`}>
                        {isStage1Done ? 'COMPLETED' : 'DRAFT'}
                      </span>
                    </div>
                  </div>

                  {/* Node 2: Manager Approval */}
                  <div className="flex flex-col items-center relative z-10 space-y-2 w-28">
                    {isStage2Done ? (
                      <div className="w-9 h-9 rounded-full bg-[#10B981] text-white font-bold text-sm flex items-center justify-center shadow-xs ring-4 ring-white">
                        <FaCheck className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-300 text-slate-400 font-bold text-sm flex items-center justify-center ring-4 ring-white">
                        2
                      </div>
                    )}
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-800 block">Manager Approval</span>
                      <span className={`text-[10px] font-extrabold block mt-0.5 ${isStage2Done ? 'text-[#10B981]' : 'text-slate-400'}`}>
                        {isStage2Done ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Node 3: Self Review */}
                  <div className="flex flex-col items-center relative z-10 space-y-2 w-28">
                    {isStage3Done ? (
                      <div className="w-9 h-9 rounded-full bg-[#10B981] text-white font-bold text-sm flex items-center justify-center shadow-xs ring-4 ring-white">
                        <FaCheck className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-300 text-slate-400 font-bold text-sm flex items-center justify-center ring-4 ring-white">
                        3
                      </div>
                    )}
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-800 block">Self Review</span>
                      <span className={`text-[10px] font-extrabold block mt-0.5 ${isStage3Done ? 'text-[#10B981]' : 'text-slate-400'}`}>
                        {isStage3Done ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Node 4: Manager Final Review */}
                  <div className="flex flex-col items-center relative z-10 space-y-2 w-28">
                    {isStage4Done ? (
                      <div className="w-9 h-9 rounded-full bg-[#10B981] text-white font-bold text-sm flex items-center justify-center shadow-xs ring-4 ring-white">
                        <FaCheck className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-300 text-slate-400 font-bold text-sm flex items-center justify-center ring-4 ring-white">
                        4
                      </div>
                    )}
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-800 block">Manager Final Review</span>
                      <span className={`text-[10px] font-extrabold block mt-0.5 ${isStage4Done ? 'text-[#10B981]' : 'text-slate-400'}`}>
                        {isStage4Done ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Node 5: Self Acceptance */}
                  <div className="flex flex-col items-center relative z-10 space-y-2 w-28">
                    {isStage5Done ? (
                      <div className="w-9 h-9 rounded-full bg-[#10B981] text-white font-bold text-sm flex items-center justify-center shadow-xs ring-4 ring-white">
                        <FaCheck className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-300 text-slate-400 font-bold text-sm flex items-center justify-center ring-4 ring-white">
                        5
                      </div>
                    )}
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-800 block">Self Acceptance</span>
                      <span className={`text-[10px] font-extrabold block mt-0.5 ${isStage5Done ? 'text-[#10B981]' : 'text-slate-400'}`}>
                        {isStage5Done ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Stepper Legend */}
            <div className="flex items-center justify-center gap-6 pt-2 text-xs font-medium text-slate-500 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Draft</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>Pending / In Progress</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SMART GOALS FORM VIEW */
        <div className="space-y-6 text-left">
          {/* Back Button & Section Sub-Header */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-grotesk">
                  {isSubmitted || isApproved ? 'View SMART Goals' : 'Create Your Quarterly Goals'}
                </h3>
                <p className="text-xs text-slate-500 font-medium font-inter">
                  {isSubmitted || isApproved ? 'Your SMART goals for this quarter' : 'Define your SMART goals for the upcoming quarter'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGoalForm(false)}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FaArrowLeft className="w-3 h-3" />
              <span>Back to Overview</span>
            </button>
          </div>

          {/* Read-Only Notice Banner if Submitted or Completed */}
          {(isSubmitted || isApproved) && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs font-bold flex items-center gap-2.5">
              <span className="text-base">🔒</span>
              <span>Goals for {getPlanTitle(activeTab)} have been finalized/submitted for Manager Approval and cannot be modified or added to.</span>
            </div>
          )}

          {/* Manager Remarks / Requested Changes Alert Banner in SMART Goals Form View */}
          {isRevisionRequested ? (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-amber-900 shadow-xs space-y-2 font-inter">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm font-grotesk">
                  <span className="text-base">⚠️</span>
                  <span>Manager Requested Changes / Feedback</span>
                </div>
                <span className="bg-amber-200/60 text-amber-900 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-inter">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-amber-200/60">
                "{currentWf?.managerRemarks || 'Your manager requested changes to your SMART goals. Please review feedback and re-submit for approval.'}"
              </p>
            </div>
          ) : currentWf?.managerRemarks ? (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-purple-950 shadow-xs space-y-2 font-inter">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-sm font-grotesk">
                  <span className="text-base">💬</span>
                  <span>Manager Approval Feedback & Remarks</span>
                </div>
                <span className="bg-purple-100 text-purple-900 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-300 font-inter">
                  Manager Remarks
                </span>
              </div>
              <p className="text-xs text-purple-900 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-purple-200/60 font-inter">
                "{currentWf.managerRemarks}"
              </p>
            </div>
          ) : null}

          {/* CFL Self Acceptance Feedback Banner */}
          {(currentWf?.selfAcceptanceRemarks || currentWf?.selfAcceptanceStatus || currentWf?.status === 'CYCLE_COMPLETED' || currentWf?.status === 'REASSESSMENT_REQUESTED') && (
            <div className="bg-[#FFF8E7] border border-[#F5E6BE] rounded-2xl p-5 text-amber-950 shadow-xs space-y-2 font-inter text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm font-grotesk">
                  <span className="text-base">💬</span>
                  <span>Your Self Acceptance Feedback & Status</span>
                </div>
                <span className={`font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${currentWf?.selfAcceptanceStatus === 'SATISFIED' || currentWf?.status === 'CYCLE_COMPLETED'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-inter'
                  : 'bg-amber-200 text-amber-900 border-amber-300 font-inter'
                  }`}>
                  {currentWf?.selfAcceptanceStatus === 'SATISFIED' || currentWf?.status === 'CYCLE_COMPLETED' ? '✓ Accepted Evaluation' : 'Clarification Requested'}
                </span>
              </div>
              {currentWf?.selfAcceptanceRemarks && (
                <p className="text-xs text-amber-900 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-amber-200/60 font-inter">
                  "{currentWf.selfAcceptanceRemarks}"
                </p>
              )}
            </div>
          )}

          {/* Plan Header Banner */}
          <div className="bg-[#78161A] text-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-grotesk tracking-wide text-white">
                {getPlanTitle(activeTab)}
              </h3>
              <p className="text-xs text-white/80 font-medium font-inter mt-1">
                01 Apr 2026 to 30 Apr 2026
              </p>
            </div>

            <div className="bg-black/25 border border-white/10 rounded-xl px-5 py-2 text-right">
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/70 block">CYCLE END DATE</span>
              <span className="text-xs font-black text-white font-grotesk mt-0.5 block">30 Apr 2026</span>
            </div>
          </div>

          {/* SMART Goals Form Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Dark Top Bar */}
            <div className="bg-[#1C1618] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-base">📋</span>
                <div>
                  <h4 className="text-sm font-bold font-grotesk text-white">SMART Goals</h4>
                  <p className="text-[11px] text-slate-400 font-medium font-inter">
                    {isSubmitted ? 'Submitted goals list' : `Add your SMART goals for ${getPlanTitle(activeTab)}`}
                  </p>
                </div>
              </div>

              <div className="bg-[#2A2326] border border-white/10 rounded-lg px-3.5 py-1.5 flex items-center gap-2">
                <span className="text-[10.5px] font-bold text-slate-300">Total Weightage</span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded transition-all ${calculateTotalWeightage() === 100
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                  : calculateTotalWeightage() > 100
                    ? 'bg-rose-950 text-rose-300 border border-rose-800/60 shadow-xs'
                    : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                  }`}>
                  {calculateTotalWeightage()}% / 100%
                </span>
              </div>
            </div>

            {/* Goal Cards List */}
            <div className="p-6 bg-[#FAF8F9] space-y-4">
              {smartGoalCards.map((card, idx) => (
                <div key={card.id} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4 text-left relative">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-[#78161A] font-bold text-[11px] flex items-center justify-center font-grotesk">
                        {idx + 1}
                      </span>
                      <h5 className="text-xs font-bold text-slate-800 font-grotesk">
                        SMART Goal {idx + 1}
                      </h5>
                    </div>

                    {!isSubmitted && !isApproved && smartGoalCards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGoalCard(card.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md cursor-pointer"
                        title="Remove Goal"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* GOAL / OBJECTIVE */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block font-inter">
                      GOAL / OBJECTIVE {!isSubmitted && !isApproved && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitted || isApproved}
                      value={card.title}
                      onChange={(e) => handleGoalCardChange(card.id, 'title', e.target.value)}
                      placeholder="e.g. Enhance Technical Skills"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:border-[#78161A] focus:ring-1 focus:ring-[#78161A] outline-none transition-all disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>

                  {/* TARGET */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block font-inter">
                      TARGET {!isSubmitted && !isApproved && <span className="text-rose-500">*</span>}
                    </label>
                    <select
                      disabled={isSubmitted || isApproved}
                      value={card.target}
                      onChange={(e) => handleGoalCardChange(card.id, 'target', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:border-[#78161A] focus:ring-1 focus:ring-[#78161A] outline-none transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    >
                      <option value="Complete certification / training">Complete certification / training</option>
                      <option value="Lead / mentor a team activity">Lead / mentor a team activity</option>
                      <option value="Deliver project milestone on time">Deliver project milestone on time</option>
                      <option value="Improve code coverage and unit tests">Improve code coverage and unit tests</option>
                      <option value="Other / Custom Goal Objective">Other / Custom Goal Objective</option>
                    </select>
                  </div>

                  {/* WEIGHTAGE (%) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block font-inter">
                        WEIGHTAGE (%) {!isSubmitted && !isApproved && <span className="text-rose-500">*</span>}
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        (Total across all SMART goals must be 100%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        disabled={isSubmitted || isApproved}
                        value={card.weightage}
                        onChange={(e) => handleGoalCardChange(card.id, 'weightage', e.target.value)}
                        className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-[#78161A] outline-none disabled:bg-slate-50 disabled:text-slate-600"
                      />
                      <span className="text-xs text-slate-500 font-medium">out of 100</span>
                    </div>
                  </div>

                  {/* CFL Self Assessment Remarks & Rating Box */}
                  {(card.selfRemarks || card.selfRating) && (
                    <div className="mt-3 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs font-grotesk">
                          <span className="text-sm">📝</span>
                          <span>Your Self Assessment</span>
                        </div>
                        {card.selfRating && (
                          <span className="bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs px-2.5 py-0.5 rounded-full font-inter">
                            Self Rating: ⭐ {card.selfRating} / 5
                          </span>
                        )}
                      </div>
                      {card.selfRemarks && (
                        <p className="text-xs text-emerald-950 font-medium leading-relaxed bg-white/80 p-2.5 rounded-lg border border-emerald-200/60 font-inter">
                          "{card.selfRemarks}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Manager Evaluation & Remarks Box (Per Goal) */}
                  {(card.managerRemarks || card.managerRating) && (
                    <div className="mt-3 bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-900 font-bold text-xs font-grotesk">
                          <span className="text-sm">👤</span>
                          <span>Manager Goal Feedback</span>
                        </div>
                        {card.managerRating && (
                          <span className="bg-purple-100 border border-purple-300 text-purple-900 font-bold text-xs px-2.5 py-0.5 rounded-full font-inter">
                            Manager Rating: ⭐ {card.managerRating} / 5
                          </span>
                        )}
                      </div>
                      {card.managerRemarks && (
                        <p className="text-xs text-purple-950 font-medium leading-relaxed bg-white/80 p-2.5 rounded-lg border border-purple-200/60 font-inter">
                          "{card.managerRemarks}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add Another SMART Goal Dashed Button */}
              {!isSubmitted && !isApproved && (
                <button
                  type="button"
                  onClick={handleAddGoalCard}
                  className="w-full py-3 bg-white border-2 border-dashed border-rose-200 hover:border-[#78161A] hover:bg-rose-50/50 text-[#78161A] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <FaPlus className="w-3 h-3" />
                  <span>Add Another SMART Goal</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowGoalForm(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <FaArrowLeft className="w-3 h-3" />
              <span>Back to Overview</span>
            </button>

            {!isSubmitted && !isApproved ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={savingGoal}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <FaSave className="w-3.5 h-3.5 text-slate-600" />
                  <span>{savingGoal ? 'Saving...' : 'Save as Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitForApproval}
                  disabled={submittingGoals}
                  className="px-6 py-2.5 rounded-xl bg-[#78161A] hover:bg-[#631013] active:scale-98 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <FaPaperPlane className="w-3.5 h-3.5" />
                  <span>{submittingGoals ? 'Submitting...' : 'Submit for Approval'}</span>
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2">
                <FaCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Submitted for Manager Approval</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Self Review Modal */}
      {showSelfReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden font-inter flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#78161A] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  📝
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-grotesk">Thirty Days Plan — CFL Self Review</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Rate your achievement and add self-assessment remarks for each SMART goal.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSelfReviewModal(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {smartGoalCards.map((goal, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#78161A]">Goal #{idx + 1}</span>
                    <span className="text-[10px] font-bold bg-rose-50 border border-rose-200 text-[#78161A] px-2 py-0.5 rounded-full">Weightage: {goal.weightage}%</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">{goal.title}</h4>
                  <p className="text-xs text-slate-600 font-medium">{goal.target}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Self Score (1 - 5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="5"
                        value={selfReviewRatings[goal.id] || 5}
                        onChange={(e) => setSelfReviewRatings({ ...selfReviewRatings, [goal.id]: e.target.value })}
                        className="mt-1 w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Self Assessment Remarks</label>
                      <textarea
                        rows="2"
                        placeholder="Enter your self-assessment notes..."
                        value={selfReviewComments[goal.id] || ''}
                        onChange={(e) => setSelfReviewComments({ ...selfReviewComments, [goal.id]: e.target.value })}
                        className="mt-1 w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 bg-white resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSelfReviewModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSelfReviewSubmit}
                disabled={submittingSelfReview}
                className="px-5 py-2 bg-[#78161A] hover:bg-[#631013] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <FaPaperPlane className="w-3 h-3" />
                <span>{submittingSelfReview ? 'Submitting...' : 'Submit Self Review'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Self Acceptance Modal */}
      {showSelfAcceptanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden font-inter flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  ☑️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-grotesk">Thirty Days Plan — CFL Self Acceptance</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Review ratings and manager remarks, then confirm your acceptance.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSelfAcceptanceModal(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Manager Evaluation Summary</h4>
              {smartGoalCards.map((goal, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#78161A]">Goal #{idx + 1}: {goal.title}</span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Manager Rating: ⭐ {goal.managerRating || 5} / 5
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">Target: {goal.target}</p>
                  {goal.managerRemarks && (
                    <div className="bg-emerald-50/60 border border-emerald-200 p-2.5 rounded-lg text-xs text-emerald-950">
                      <span className="font-bold block text-[10px] text-emerald-800 uppercase">Manager Remarks:</span>
                      "{goal.managerRemarks}"
                    </div>
                  )}
                </div>
              ))}

              {/* Question: How satisfied are you with the rating and feedback received from manager? */}
              <div className="border-t border-slate-200 pt-4 space-y-4">
                <label className="text-xs font-bold text-slate-800 block font-grotesk">
                  How satisfied are you with the rating and feedback received from your manager?
                </label>

                {/* Interactive Emoji Selection Grid */}
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { emoji: '😍', label: 'Very Satisfied', value: 'VERY_SATISFIED', satisfied: true },
                    { emoji: '😊', label: 'Satisfied', value: 'SATISFIED', satisfied: true },
                    { emoji: '😐', label: 'Neutral', value: 'NEUTRAL', satisfied: true },
                    { emoji: '🙁', label: 'Dissatisfied', value: 'DISSATISFIED', satisfied: false },
                    { emoji: '😠', label: 'Very Dissatisfied', value: 'VERY_DISSATISFIED', satisfied: false }
                  ].map((item) => {
                    const isSelected = selectedSatisfactionEmoji === item.emoji;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setSelectedSatisfactionEmoji(item.emoji);
                          setIsSatisfiedWithManager(item.satisfied);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${isSelected
                          ? item.satisfied
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm scale-105 ring-2 ring-emerald-400/30'
                            : 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm scale-105 ring-2 ring-rose-400/30'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:border-slate-300'
                          }`}
                      >
                        <span className="text-2xl mb-1 transition-transform duration-200 hover:scale-120">{item.emoji}</span>
                        <span className="text-[10px] font-bold text-center leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Status Indicator */}
                <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${isSatisfiedWithManager
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{selectedSatisfactionEmoji}</span>
                    <span>Selection Status: <strong>{isSatisfiedWithManager ? 'Satisfied / Accept Evaluation' : 'Request Feedback Clarification'}</strong></span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-current">
                    {isSatisfiedWithManager ? 'Accept' : 'Clarify'}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remarks / Notes (Optional)</label>
                  <textarea
                    rows="2"
                    placeholder="Enter any comments regarding manager rating/feedback..."
                    value={selfAcceptanceRemarksInput}
                    onChange={(e) => setSelfAcceptanceRemarksInput(e.target.value)}
                    className="mt-1 w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 bg-white resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSelfAcceptanceModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSelfAcceptanceSubmit}
                disabled={submittingSelfAcceptance}
                className="px-5 py-2 bg-[#78161A] hover:bg-[#631013] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <FaPaperPlane className="w-3 h-3" />
                <span>{submittingSelfAcceptance ? 'Submitting...' : 'Submit Self Acceptance'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Weightage Validation Alert Modal */}
      {weightageAlertModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in duration-200 font-inter">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full overflow-hidden p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto text-2xl shadow-xs">
              <FaExclamationTriangle className="w-7 h-7 text-rose-600" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 font-grotesk tracking-tight">
                {weightageAlertModal.type === 'EXCEEDS' ? 'Weightage Limit Exceeded' : 'Weightage Incomplete'}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">
                {weightageAlertModal.type === 'EXCEEDS' ? (
                  <>
                    Total weightage across your SMART goals is currently{' '}
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {weightageAlertModal.totalW}%
                    </span>
                    , which exceeds the allowed limit of <span className="font-bold text-slate-800">100%</span> by{' '}
                    <span className="font-bold text-rose-700">{weightageAlertModal.totalW - 100}%</span>.
                  </>
                ) : (
                  <>
                    Total weightage across your SMART goals is currently{' '}
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {weightageAlertModal.totalW}%
                    </span>
                    , which is less than the required <span className="font-bold text-slate-800">100%</span> total.
                  </>
                )}
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-3 text-[11.5px] text-slate-600 font-medium leading-normal text-left">
                ⚠️ <strong>Cannot Submit Goals:</strong> Please adjust the individual weightages on your goal cards so that the total weightage equals exactly <strong>100%</strong> before submitting for manager approval.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWeightageAlertModal({ show: false, type: 'EXCEEDS', totalW: 0 })}
              className="w-full py-2.5 bg-[#78161A] hover:bg-[#631013] active:scale-98 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Adjust Goal Weightages
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
