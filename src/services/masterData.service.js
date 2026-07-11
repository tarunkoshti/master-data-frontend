import apiClient from './api';

export const masterDataApi = {
  // Get all master data (with optional query filters like is_active)
  getAll: (params = {}) => {
    return apiClient.get('/master-data', { params });
  },

  // Get by category
  getByCategory: (category, params = {}) => {
    return apiClient.get(`/master-data/${category}`, { params });
  },
  
  // Get by parent ID
  getByParentId: (parentId, params = {}) => {
    return apiClient.get(`/master-data/parent/${parentId}`, { params });
  },

  // Create new master data
  create: (data) => {
    return apiClient.post('/master-data', data);
  },

  // Update existing master data
  update: (id, data) => {
    return apiClient.put(`/master-data/${id}`, data);
  },

  // Update status (enable/disable)
  updateStatus: (id, is_active) => {
    return apiClient.patch(`/master-data/${id}/status`, { is_active });
  },

  // Delete master data
  delete: (id) => {
    return apiClient.delete(`/master-data/${id}`);
  },

  // Reorder master data
  reorder: (type, ids) => {
    return apiClient.patch(`/master-data/${type}/reorder`, { ids });
  },
};
