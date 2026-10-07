import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9085/api/mentoring';
const DEFAULT_CFL_EMP_ID = 9085414;

/**
 * Service API Module for CFL Mentoring Page
 * Location: src/services/mentoringService.js
 */
export const mentoringService = {
  // 1. Fetch planned and completed mentoring sessions
  getSessions: async (cflEmpId = DEFAULT_CFL_EMP_ID) => {
    try {
      const response = await axios.get(`${BASE_URL}/cfl/${cflEmpId}/sessions`);
      return response.data;
    } catch (error) {
      console.warn('Backend API error fetching mentoring sessions, using fallback:', error);
      throw error;
    }
  },

  // 2. Fetch mentor details & statistics (total sessions, completed, planned, average rating)
  getMentorDetails: async (cflEmpId = DEFAULT_CFL_EMP_ID) => {
    try {
      const response = await axios.get(`${BASE_URL}/cfl/${cflEmpId}/mentor-details`);
      return response.data;
    } catch (error) {
      console.warn('Backend API error fetching mentor details, using fallback:', error);
      throw error;
    }
  },

  // 3. Mark a planned session as completed
  markCompleted: async (sessionId) => {
    try {
      const response = await axios.put(`${BASE_URL}/sessions/${sessionId}/complete`);
      return response.data;
    } catch (error) {
      console.warn('Backend API error marking session completed:', error);
      throw error;
    }
  },

  // 4. Submit CFL feedback for a completed session
  submitFeedback: async (sessionId, payload) => {
    try {
      const response = await axios.post(`${BASE_URL}/sessions/${sessionId}/feedback`, payload);
      return response.data;
    } catch (error) {
      console.warn('Backend API error submitting session feedback:', error);
      throw error;
    }
  }
};
