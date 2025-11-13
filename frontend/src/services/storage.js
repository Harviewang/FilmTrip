import api from './api';

export const storageApi = {
  createPolicy: (payload) => api.post('/storage/policy', payload),
  purge: (payload) => api.post('/storage/purge', payload),
  getProtectedUrl: (params) => api.get('/storage/protected-url', { params }),
};

export default storageApi;


