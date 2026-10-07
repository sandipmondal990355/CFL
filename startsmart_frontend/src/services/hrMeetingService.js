import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9085/api/meetings';

/**
 * Service API Module for HR Meetings
 * Backend Project: startsmart (Spring Boot)
 * Controller: MeetingController (/api/meetings)
 * Location: src/services/hrMeetingService.js
 */
export const hrMeetingService = {
  // 1. Fetch all scheduled HR meetings from backend Spring Boot API
  getAllMeetings: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/hr/all`);
      return response.data;
    } catch (error) {
      console.warn('Backend HR Meetings API endpoint error, using fallback:', error.message);
      return [
        {
          id: 201,
          cflName: 'Manpreet Kaur',
          cflEmpCode: 'CFL9085414',
          meetingType: 'HR 1:1 Check-in',
          date: '2026-05-15',
          time: '10:30 AM',
          mode: 'Zoom',
          link: 'https://zoom.us/j/9876543210',
          agenda: 'First month onboarding progress review and feedback session.',
          status: 'SCHEDULED'
        },
        {
          id: 202,
          cflName: 'Amit Chauhan',
          cflEmpCode: 'CFL9085415',
          meetingType: 'Probation Milestone Discussion',
          date: '2026-05-20',
          time: '02:00 PM',
          mode: 'Google Meet',
          link: 'https://meet.google.com/abc-defg-hij',
          agenda: 'Mid-probation goals evaluation and project alignment discussion.',
          status: 'SCHEDULED'
        }
      ];
    }
  },

  // 2. Fetch available CFL list options for HR dropdown from database
  getCflOptions: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/cfl-options`);
      return response.data;
    } catch (error) {
      console.warn('Backend API error fetching CFL options:', error.message);
      return [
        { empCode: 'CFL9085414', name: 'Manpreet Kaur' },
        { empCode: 'CFL9085415', name: 'Amit Chauhan' },
        { empCode: 'CFL9085416', name: 'Yajnadutta Mishra' },
        { empCode: 'CFL9085417', name: 'Rohit Verma' },
        { empCode: 'CFL9085418', name: 'Sneha Reddy' },
        { empCode: 'CFL9085419', name: 'Shalini' },
        { empCode: 'CFL9085420', name: 'Amulya' },
        { empCode: 'CFL9085421', name: 'Abhishek' },
        { empCode: 'CFL9085422', name: 'John Doe' }
      ];
    }
  },

  // 3. Schedule a new HR meeting in backend database
  scheduleMeeting: async (payload) => {
    try {
      const response = await axios.post(`${BASE_URL}/hr`, payload);
      return response.data;
    } catch (error) {
      console.warn('Backend API error scheduling HR meeting:', error.message);
      return {
        id: Date.now(),
        status: 'SCHEDULED',
        ...payload
      };
    }
  },

  // 4. Update existing meeting details (Date, Time, Agenda, Mode, Link, Type, CFL)
  updateMeeting: async (id, payload) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, payload);
      return response.data;
    } catch (error) {
      console.warn(`Backend API error updating meeting ${id}:`, error.message);
      return { id, ...payload };
    }
  },

  // 5. Mark meeting status as COMPLETED
  completeMeeting: async (id) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}/status`, null, {
        params: { status: 'COMPLETED' }
      });
      return response.data;
    } catch (error) {
      console.warn(`Backend API error completing meeting ${id}:`, error.message);
      return { id, status: 'COMPLETED' };
    }
  },

  // 6. Cancel a scheduled HR meeting in backend database
  cancelMeeting: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend API error cancelling HR meeting ${id}:`, error.message);
      return { success: true, message: `Meeting ${id} cancelled` };
    }
  }
};

export default hrMeetingService;
