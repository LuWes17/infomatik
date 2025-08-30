// frontend/src/services/policyService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/policies`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const policyService = {
  // Get all policies (with optional filters)
  getAllPolicies: async (params = {}) => {
    try {
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw error;
    }
  },

  // Get single policy by ID
  getPolicyById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching policy:', error);
      throw error;
    }
  },

  // Create new policy (admin only)
  createPolicy: async (policyData) => {
    try {
      // Use FormData for file upload
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await api.post('/', policyData, config);
      return response.data;
    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  },

  // Update policy (admin only)
  updatePolicy: async (id, updateData) => {
    try {
      // Use FormData if file is being updated
      const config = updateData instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      } : {};
      
      const response = await api.put(`/${id}`, updateData, config);
      return response.data;
    } catch (error) {
      console.error('Error updating policy:', error);
      throw error;
    }
  },

  // Delete policy (admin only)
  deletePolicy: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw error;
    }
  },

  // Download policy document
  downloadPolicyDocument: async (id) => {
    try {
      const response = await api.get(`/${id}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `policy-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    } catch (error) {
      console.error('Error downloading policy document:', error);
      throw error;
    }
  },

  // Get policies by type
  getPoliciesByType: async (type) => {
    try {
      const response = await api.get('/', {
        params: { type }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching policies by type:', error);
      throw error;
    }
  },

  // Get policies by category
  getPoliciesByCategory: async (category) => {
    try {
      const response = await api.get('/', {
        params: { category }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching policies by category:', error);
      throw error;
    }
  },

  // Search policies
  searchPolicies: async (searchTerm) => {
    try {
      const response = await api.get('/search', {
        params: { q: searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching policies:', error);
      throw error;
    }
  },

  // Toggle policy publication status
  togglePolicyPublication: async (id) => {
    try {
      const response = await api.patch(`/${id}/toggle-publish`);
      return response.data;
    } catch (error) {
      console.error('Error toggling policy publication:', error);
      throw error;
    }
  },

  // Get policy statistics (admin only)
  getPolicyStatistics: async () => {
    try {
      const response = await api.get('/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching policy statistics:', error);
      throw error;
    }
  }
};

export default policyService;