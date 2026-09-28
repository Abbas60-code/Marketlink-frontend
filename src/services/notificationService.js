import API from './api.js';

export const notificationService = {
  getMyNotifications: async () => {
    const response = await API.get('/notifications');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await API.patch(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await API.patch('/notifications/read-all');
    return response.data;
  },
  createAnnouncement: async (title, message, targetRole = '') => {
    const response = await API.post('/notifications/announcement', { title, message, targetRole });
    return response.data;
  },
};

export default notificationService;
