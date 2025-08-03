import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      throw new Error('Network error. Please check your connection.');
    }

    // Handle HTTP errors
    const { status, data } = error.response;
    
    if (status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (status === 403) {
      throw new Error('Access denied. You do not have permission to perform this action.');
    }

    if (status === 404) {
      throw new Error('The requested resource was not found.');
    }

    if (status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    // Return the error message from the server
    const errorMessage = data?.message || 'An unexpected error occurred';
    const errors = data?.errors || [];
    
    const error_obj = new Error(errorMessage);
    error_obj.errors = errors;
    throw error_obj;
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params = {}) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  reorderTasks: (taskIds) => api.put('/tasks/reorder', { taskIds }),
  
  // Subtasks
  addSubtask: (taskId, subtaskData) => api.post(`/tasks/${taskId}/subtasks`, subtaskData),
  updateSubtask: (taskId, subtaskId, subtaskData) => api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, subtaskData),
  deleteSubtask: (taskId, subtaskId) => api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  reorderCategories: (categoryIds) => api.put('/categories/reorder', { categoryIds }),
  getCategoryStats: (id) => api.get(`/categories/${id}/stats`),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getProductivity: (params = {}) => api.get('/analytics/productivity', { params }),
  getInsights: () => api.get('/analytics/insights'),
  getTimeTracking: () => api.get('/analytics/time-tracking'),
};

// Generic API utilities
export const apiUtils = {
  // Upload file (if needed for avatar, etc.)
  uploadFile: async (file, endpoint) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Download file
  downloadFile: async (url, filename) => {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  // Health check
  healthCheck: () => api.get('/health'),
};

export default api;