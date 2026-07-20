import api from './api';

export const userIntroApi = {
  getAll: (params) => api.get('/user-intro', { params }),
  updateStatus: (id, status, reason = null) => api.patch(`/user-intro/status/${id}`, { status, reason }),
};
