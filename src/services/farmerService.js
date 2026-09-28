import API from './api.js';

export const farmerService = {
  getFarmers: async (params = {}) => {
    const response = await API.get('/farmers', { params });
    return response.data;
  },
  getFarmer: async (id) => {
    const response = await API.get(`/farmers/${id}`);
    return response.data;
  },
  getMyFarmerProfile: async () => {
    const response = await API.get('/farmers/me');
    return response.data;
  },
  getMyProfile: async () => {
    const response = await API.get('/farmers/me');
    return response.data;
  },
  createOrUpdateProfile: async (formData) => {
    const isForm = formData instanceof FormData;
    const response = await API.post('/farmers/profile', formData, {
      headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },
  updateWeeklyStock: async (items) => {
    const response = await API.put('/farmers/weekly-stock', { items });
    return response.data;
  },
  updatePickupSlots: async (data) => {
    const response = await API.put('/farmers/pickup-slots', data);
    return response.data;
  },
  // Admin farmer management
  getAdminFarmers: async () => {
    const response = await API.get('/farmers/admin/all');
    return response.data;
  },
  updateFarmerStatus: async (id, statusData) => {
    const response = await API.patch(`/farmers/${id}/status`, statusData);
    return response.data;
  },
  deleteProfile: async (id) => {
    const response = await API.delete(`/farmers/${id}`);
    return response.data;
  },
};

export default farmerService;
