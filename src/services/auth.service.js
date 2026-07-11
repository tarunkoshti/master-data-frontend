import apiClient from './api';

export const authService = {
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },
  
  logout: () => {
    return apiClient.post('/auth/logout');
  },
  
  getMe: () => {
    // Some backends use /auth/me or /users/me to validate session
    // We'll assume /auth/me for this example. Adjust as needed.
    return apiClient.get('/auth/me');
  }
};
