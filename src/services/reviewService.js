import API from './api.js';

export const reviewService = {
  // Create review
  createReview: async (reviewData) => {
    const response = await API.post('/reviews', reviewData);
    return response.data;
  },

  // Get reviews for farmer
  getFarmerReviews: async (farmerId) => {
    const response = await API.get(`/reviews/farmer/${farmerId}`);
    return response.data;
  },

  // Get reviews for product
  getProductReviews: async (productId) => {
    const response = await API.get(`/reviews/product/${productId}`);
    return response.data;
  },

  // Farmer reply to review
  replyToReview: async (reviewId, comment) => {
    const response = await API.post(`/reviews/${reviewId}/reply`, { comment });
    return response.data;
  },

  // Admin get all reviews
  getAllReviewsAdmin: async () => {
    const response = await API.get('/reviews/admin');
    return response.data;
  },

  // Admin moderate review
  moderateReview: async (reviewId, isApproved) => {
    const response = await API.patch(`/reviews/${reviewId}/moderate`, { isApproved });
    return response.data;
  },

  // Admin delete review
  deleteReview: async (reviewId) => {
    const response = await API.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

export default reviewService;
