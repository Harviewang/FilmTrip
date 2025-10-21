import axios from 'axios';
import API_CONFIG from '../config/api.js';

// 创建axios实例
const api = axios.create({
  baseURL: API_CONFIG.API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
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

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// API端点
export const authApi = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
  updatePassword: (passwordData) => api.put('/users/password', passwordData),
};

export const photoApi = {
  getAllPhotos: (params) => api.get('/photos', { params }),
  getPhotoById: (id) => api.get(`/photos/${id}`),
  updatePhoto: (id, data) => api.put(`/photos/${id}`, data),
  deletePhoto: (id) => api.delete(`/photos/${id}`),
  uploadPhoto: (formData) => api.post('/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const albumApi = {
  getAllAlbums: (params) => api.get('/albums', { params }),
  getAlbumById: (id) => api.get(`/albums/${id}`),
  createAlbum: (data) => api.post('/albums', data),
  updateAlbum: (id, data) => api.put(`/albums/${id}`, data),
  deleteAlbum: (id) => api.delete(`/albums/${id}`),
};

export const cameraApi = {
  getAllCameras: (params) => api.get('/cameras', { params }),
  getCameraById: (id) => api.get(`/cameras/${id}`),
  createCamera: (data) => api.post('/cameras', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCamera: (id, data) => api.put(`/cameras/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCamera: (id) => api.delete(`/cameras/${id}`),
};

export const scannerApi = {
  getAll: (params) => api.get('/scanners', { params }),
  getById: (id) => api.get(`/scanners/${id}`),
  create: (data) => api.post('/scanners', data),
  update: (id, data) => api.put(`/scanners/${id}`, data),
  delete: (id) => api.delete(`/scanners/${id}`),
};

export const statsApi = {
  getDashboard: () => api.get('/stats/dashboard'),
  getTrends: (params) => api.get('/stats/trends', { params }),
  getStorage: () => api.get('/stats/storage'),
};

export default api;
