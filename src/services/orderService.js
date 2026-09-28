import API from './api.js';

export const orderService = {
  placeOrder: async (orderData) => {
    const response = await API.post('/orders', orderData);
    return response.data;
  },
  getMyOrders: async () => {
    const response = await API.get('/orders/my-orders');
    return response.data;
  },
  getOrder: async (id) => {
    const response = await API.get(`/orders/${id}`);
    return response.data;
  },
  cancelOrder: async (id, reason = '') => {
    const response = await API.patch(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
  reorderOrder: async (id) => {
    const response = await API.post(`/orders/${id}/reorder`);
    return response.data;
  },
  // Farmer endpoints
  getFarmerOrders: async (params = {}) => {
    const response = await API.get('/orders/farmer-orders', { params });
    return response.data;
  },
  getFarmerStats: async () => {
    const response = await API.get('/orders/farmer-stats');
    return response.data;
  },
  updateOrderStatus: async (id, status, cancelReason = '') => {
    const response = await API.patch(`/orders/${id}/status`, { status, cancelReason });
    return response.data;
  },
  // Admin endpoints
  getAllOrders: async (params = {}) => {
    const response = await API.get('/orders', { params });
    return response.data;
  },
  getOrderStats: async () => {
    const response = await API.get('/orders/stats');
    return response.data;
  },
};

export default orderService;
