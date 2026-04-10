import axios from 'axios';

export const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

const createObjectUrlFromBlob = (blob, mimeType) => {
  const objectBlob = new Blob([blob], {
    type: mimeType || blob.type || 'application/octet-stream'
  });
  const url = window.URL.createObjectURL(objectBlob);

  return {
    url,
    cleanup: () => window.URL.revokeObjectURL(url)
  };
};

const resolveFileAsset = async (fileId, mimeType) => {
  const response = await api.get(`/files/${fileId}/download`, {
    responseType: 'blob'
  });

  const contentType = response.headers['content-type'] || response.data.type || '';

  if (contentType.includes('application/json')) {
    const payload = JSON.parse(await response.data.text());
    return {
      url: payload.url,
      cleanup: null
    };
  }

  return createObjectUrlFromBlob(response.data, mimeType);
};

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

  resolveFileAsset,
  
  downloadFile: async (fileId, originalFilename, mimeType) => {
    try {
      const { url, cleanup } = await resolveFileAsset(fileId, mimeType);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      if (cleanup) {
        setTimeout(cleanup, 1000);
      }
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
