import axios from 'axios';

const BASE_URL = 'http://localhost:9085/api';

/**
 * Service API Module for Performance Goals, Workflows, Probation & Self-Acceptance
 * Location: src/services/goalService.js
 */
export const goalService = {
  // 1. Get all goal stages (G30, G60, G90, G100)
  getStages: async () => {
    const response = await axios.get(`${BASE_URL}/goals/stages`);
    return response.data;
  },

  // 2. HR initiates goal setting meeting & cycle
  initiate: async (payload) => {
    const response = await axios.post(`${BASE_URL}/goals/initiate`, payload);
    return response.data;
  },

  // 3. Get all active goal workflows (HR / Manager level)
  getWorkflows: async () => {
    const response = await axios.get(`${BASE_URL}/goals/workflows`);
    return response.data;
  },

  // 4. Mark goal initiation meeting as completed & unlock goals
  completeMeeting: async (workflowId) => {
    const response = await axios.post(`${BASE_URL}/goals/workflows/${workflowId}/complete-meeting`);
    return response.data;
  },

  // 5. Get goal workflows for a specific CFL
  getWorkflowByCfl: async (cflEmpId) => {
    const response = await axios.get(`${BASE_URL}/goals/workflow/cfl/${cflEmpId}`);
    return response.data;
  },

  // 6. Activate a specific goal stage (G30, G60, G90) for a CFL
  activateStage: async (cflEmpId, stageCode, year = 2026) => {
    const response = await axios.post(`${BASE_URL}/goals/activate-stage`, {
      cflEmpId,
      stageCode,
      year
    });
    return response.data;
  },

  // 7. Get probation evaluation list for HR dashboard
  getProbationEvaluations: async () => {
    const response = await axios.get(`${BASE_URL}/probation/evaluations`);
    return response.data;
  },

  // 8. Create or update an individual SMART goal
  createGoal: async (payload) => {
    const response = await axios.post(`${BASE_URL}/goals/create`, payload);
    return response.data;
  },

  // 9. Fetch goals created by a CFL (filtered optionally by stageCode)
  getGoalsByCfl: async (cflEmpId, stageCode = '') => {
    const response = await axios.get(`${BASE_URL}/goals/cfl/${cflEmpId}`, {
      params: stageCode ? { stageCode } : {}
    });
    return response.data;
  },

  // 10. Batch sync multiple goals for a stage
  batchSyncGoals: async (cflEmpId, stageCode, goalsList) => {
    const response = await axios.post(`${BASE_URL}/goals/batch-sync/${cflEmpId}/${stageCode}`, goalsList);
    return response.data;
  },

  // 11. Submit goals for manager review
  submitGoals: async (cflEmpId, stageCode, goalsList = []) => {
    const response = await axios.post(`${BASE_URL}/goals/submit/${cflEmpId}/${stageCode}`, goalsList);
    return response.data;
  },

  // 12. Manager approves CFL goals for a stage
  approveGoals: async (cflEmpId, stageCode, managerRemarks = '') => {
    const response = await axios.post(`${BASE_URL}/goals/approve/${cflEmpId}/${stageCode}`, {
      managerRemarks
    });
    return response.data;
  },

  // 13. Manager requests changes / revisions on submitted goals
  requestChanges: async (cflEmpId, stageCode, managerRemarks) => {
    const response = await axios.post(`${BASE_URL}/goals/request-changes`, {
      cflEmpId,
      stageCode,
      managerRemarks
    });
    return response.data;
  },

  // 14. Submit CFL self-review ratings and remarks
  submitSelfReview: async (cflEmpId, stageCode, ratingsList = []) => {
    const response = await axios.post(`${BASE_URL}/goals/self-review`, {
      cflEmpId,
      stageCode,
      ratings: ratingsList
    });
    return response.data;
  },

  // 15. Submit Manager final evaluation ratings and remarks
  submitManagerReview: async (cflEmpId, stageCode, ratingsList = [], managerRemarks = '') => {
    const response = await axios.post(`${BASE_URL}/goals/manager-review`, {
      cflEmpId,
      stageCode,
      ratings: ratingsList,
      managerRemarks
    });
    return response.data;
  },

  // 16. Submit CFL self-acceptance / feedback clarification choice
  submitSelfAcceptance: async (cflEmpId, stageCode, satisfied, remarks = '', selectionStatus = '') => {
    const response = await axios.post(`${BASE_URL}/goals/self-acceptance`, {
      cflEmpId,
      stageCode,
      satisfied,
      remarks,
      selectionStatus
    });
    return response.data;
  },

  // 17. Get HR Overview Dashboard summary metrics from DB
  getHrOverviewSummary: async () => {
    const response = await axios.get(`${BASE_URL}/goals/hr-overview-summary`);
    return response.data;
  },

  // 18. HR approves & confirms CFL probation status
  approveProbation: async (cflEmpId) => {
    const response = await axios.post(`${BASE_URL}/probation/approve/${cflEmpId}`);
    return response.data;
  },

  // 19. Manager submits/approves CFL probation recommendation
  submitManagerProbation: async (cflEmpId) => {
    const response = await axios.post(`${BASE_URL}/probation/manager-submit/${cflEmpId}`);
    return response.data;
  }
};

export default goalService;
