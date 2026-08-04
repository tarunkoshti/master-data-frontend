import api from './api';

export const successStoryApi = {
  getAll: (params) => api.get('/success-story', { params }),
  getById: (id) => api.get(`/success-story/${id}`),
  updateStatus: (id, status) => api.patch(`/success-story/status/${id}`, { status }),
  export: (params) => api.get('/success-story/export', { params, responseType: 'blob' }),
};
