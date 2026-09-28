import API from './api.js';

export const marketService = {
  getMarkets: async (params = {}) => {
    const response = await API.get('/markets', { params });
    return response.data;
  },
  getMarket: async (id) => {
    const response = await API.get(`/markets/${id}`);
    return response.data;
  },
  createMarket: async (formData) => {
    const isForm = formData instanceof FormData;
    const response = await API.post('/markets', formData, {
      headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },
  updateMarket: async (id, formData) => {
    const isForm = formData instanceof FormData;
    const response = await API.put(`/markets/${id}`, formData, {
      headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },
  deleteMarket: async (id) => {
    const response = await API.delete(`/markets/${id}`);
    return response.data;
  },
};

export default marketService;
