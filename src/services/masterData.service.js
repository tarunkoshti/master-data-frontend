import apiClient from './api';

export const masterDataApi = {

  // Get by type
  getByType: (type, params = {}) => {
    return apiClient.get('/master-data', { params: { ...params, type } });
  },

  // Get by parent ID
  getByParentId: (parentId, params = {}) => {
    return apiClient.get('/master-data', { params: { ...params, parent_id: parentId } });
  },

  // Create new master data
  create: (data) => {
    return apiClient.post('/master-data', data);
  },

  // Update existing master data
  update: (id, data) => {
    return apiClient.put(`/master-data/${id}`, data);
  },

  // Delete master data
  // delete: (id, type) => {
  //   return apiClient.delete(`/master-data/${id}`, { params: { type } });
  // },
};
