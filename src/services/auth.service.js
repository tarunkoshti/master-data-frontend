import apiClient from './api';

export const authService = {
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  logout: () => {
    return apiClient.post('/auth/logout');
  },

  getMe: () => {
    return apiClient.get('/auth/me');
  }
};
