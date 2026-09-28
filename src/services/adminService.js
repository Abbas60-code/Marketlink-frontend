import API from './api.js';

export const adminService = {
  getDashboardStats: async () => {
    const response = await API.get('/admin/dashboard-stats');
    return response.data;
  },
  getCustomers: async (params = {}) => {
    const response = await API.get('/admin/customers', { params });
    return response.data;
  },
  updateCustomerStatus: async (id, isActive) => {
    const response = await API.patch(`/admin/customers/${id}/status`, { isActive });
    return response.data;
  },
  updateProductStatus: async (id, statusData) => {
    const response = await API.patch(`/admin/products/${id}/status`, statusData);
    return response.data;
  },
  getReports: async (params = {}) => {
    const response = await API.get('/admin/reports', { params });
    return response.data;
  },
};

export default adminService;
