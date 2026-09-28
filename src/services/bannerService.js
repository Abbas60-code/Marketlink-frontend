import API from './api.js';

export const bannerService = {
  // Get all banners (Admin / Query)
  getAllBanners: async (params = {}) => {
    const response = await API.get('/banners', { params });
    return response.data;
  },

  // Get active banners for public storefront
  getActiveBanners: async (category = '') => {
    const params = category ? { category } : {};
    const response = await API.get('/banners/active', { params });
    return response.data;
  },

  // Get banner by ID
  getBannerById: async (id) => {
    const response = await API.get(`/banners/${id}`);
    return response.data;
  },

  // Create new banner (Admin)
  createBanner: async (bannerData) => {
    const isFormData = bannerData instanceof FormData;
    const response = await API.post('/banners', bannerData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Update banner (Admin)
  updateBanner: async (id, bannerData) => {
    const isFormData = bannerData instanceof FormData;
    const response = await API.put(`/banners/${id}`, bannerData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Toggle banner active status (Admin)
  toggleBannerStatus: async (id) => {
    const response = await API.patch(`/banners/${id}/status`);
    return response.data;
  },

  // Delete banner (Admin)
  deleteBanner: async (id) => {
    const response = await API.delete(`/banners/${id}`);
    return response.data;
  },
};

export default bannerService;
