import axios from 'axios';

const BASE_URL = 'http://localhost:9085/api/documents';

/**
 * Service API Module for CFL Document Management
 * Location: src/services/documentService.js
 */
export const documentService = {
  // 1. Upload new document with Multipart Form Data
  upload: async (file, cflEmpId, documentType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cflEmpId', cflEmpId);
    formData.append('documentType', documentType);

    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // 2. Get list of documents uploaded for a specific CFL
  getByCfl: async (cflEmpId) => {
    const response = await axios.get(`${BASE_URL}/cfl/${cflEmpId}`);
    return response.data;
  },

  // 2b. Get list of documents for a specific CFL and document type (e.g. POSH_CERTIFICATE)
  getByCflAndType: async (cflEmpId, documentType) => {
    const response = await axios.get(`${BASE_URL}/cfl/${cflEmpId}/type/${documentType}`);
    return response.data;
  },


  // 3. Get direct download URL for document ID
  getDownloadUrl: (id) => {
    return `${BASE_URL}/download/${id}`;
  },

  // 4. Get direct inline view URL for document ID
  getViewUrl: (id) => {
    return `${BASE_URL}/view/${id}`;
  },

  // Helper aliases
  viewUrl: (id) => {
    return `${BASE_URL}/view/${id}`;
  },

  download: (id, fileName) => {
    const downloadUrl = `${BASE_URL}/download/${id}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName || 'document');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

export default documentService;
