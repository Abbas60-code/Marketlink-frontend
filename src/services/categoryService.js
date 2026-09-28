import API from './api.js';

export const categoryService = {
  // Get all categories with query filters
  getAllCategories: async (params = {}) => {
    const response = await API.get('/categories', { params });
    return response.data;
  },

  // Get active categories with populated subcategories (Storefront/Nav)
  getActiveCategories: async () => {
    const response = await API.get('/categories/active');
    return response.data;
  },

  // Get category by ID or Slug
  getCategoryByIdOrSlug: async (idOrSlug) => {
    const response = await API.get(`/categories/${idOrSlug}`);
    return response.data;
  },

  // Create new category (Admin)
  createCategory: async (categoryData) => {
    const isFormData = categoryData instanceof FormData;
    const response = await API.post('/categories', categoryData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Update category (Admin)
  updateCategory: async (id, categoryData) => {
    const isFormData = categoryData instanceof FormData;
    const response = await API.put(`/categories/${id}`, categoryData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Toggle category active status (Admin)
  toggleCategoryStatus: async (id) => {
    const response = await API.patch(`/categories/${id}/status`);
    return response.data;
  },

  // Toggle category featured flag (Admin)
  toggleFeaturedStatus: async (id) => {
    const response = await API.patch(`/categories/${id}/featured`);
    return response.data;
  },

  // Delete category (Admin)
  deleteCategory: async (id) => {
    const response = await API.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
