import axios from 'axios';

const BASE_URL = 'http://localhost:9085/api/cfl-assignments';

/**
 * Service API Module for CFL Assignments and Onboarding
 * Location: src/services/cflAssignmentService.js
 */
export const cflAssignmentService = {
  // 1. Get filtered & paginated CFL list
  getAll: async (params) => {
    const response = await axios.get(BASE_URL, { params });
    return response.data;
  },

  // 2. Onboard new CFL to PostgreSQL database
  onboard: async (payload) => {
    const response = await axios.post(`${BASE_URL}/onboard`, payload);
    return response.data;
  },

  // 3. Get all registered managers
  getManagers: async () => {
    const response = await axios.get(`${BASE_URL}/managers`);
    return response.data;
  },

  // 4. Get all registered mentors
  getMentors: async () => {
    const response = await axios.get(`${BASE_URL}/mentors`);
    return response.data;
  },

  // 5. Get CFLs assigned to a specific manager
  getByManager: async (managerEmpCode, params) => {
    const response = await axios.get(`${BASE_URL}/manager/${managerEmpCode}`, { params });
    return response.data;
  },

  // 6. Get CFLs assigned to a specific mentor
  getByMentor: async (mentorEmpCode, params) => {
    const response = await axios.get(`${BASE_URL}/mentor/${mentorEmpCode}`, { params });
    return response.data;
  },

  // 7. Get detailed CFL assignment profile by employee code
  getByCfl: async (cflEmpCode) => {
    const response = await axios.get(`${BASE_URL}/cfl/${cflEmpCode}`);
    return response.data;
  },

  // 8. Update existing CFL profile details & skills
  updateProfile: async (cflEmpCode, payload) => {
    const response = await axios.put(`${BASE_URL}/cfl/${cflEmpCode}/profile`, payload);
    return response.data;
  }
};

export default cflAssignmentService;
