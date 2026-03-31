import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: async (email, username, password) => {
    const response = await api.post('/auth/register', { email, username, password });
    return response.data;
  },
  
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// File APIs
export const fileAPI = {
  uploadFile: async (file, onProgress, forceUpload=false) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try{
      const response = await api.post(`/files/upload?force=${forceUpload}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    console.log('API Response:', response.data); // DEBUG
    return response.data;
    }
    catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  listFiles: async () => {
    const response = await api.get('/files/');
    return response.data;
  },
  
  getFileInfo: async (fileId) => {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  },
  
  downloadFile: async (fileId, originalFilename) => {
    try {
      // Step 1: get file URL from backend
      const res = await api.get(`/files/${fileId}/download`);
      const fileUrl = res.data.url;

      // Step 2: fetch file as blob (THIS IS KEY)
      const fileResponse = await fetch(fileUrl);
      const blob = await fileResponse.blob();

      // Step 3: force download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed");
    }
  },
  
  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  }
};

export default api;