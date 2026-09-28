import API from './api.js';

export const authService = {
  // Step 1: Register User (Sends OTP to email)
  register: async (userData) => {
    // userData can be FormData or regular JS object
    const isFormData = userData instanceof FormData;
    const response = await API.post('/auth/register', userData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Step 2: Verify OTP
  verifyOtp: async (email, otp) => {
    const response = await API.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email) => {
    const response = await API.post('/auth/resend-otp', { email });
    return response.data;
  },

  // Login User (Step 1 — triggers 2FA OTP)
  login: async (email, password, role) => {
    const response = await API.post('/auth/login', { email, password, role });
    return response.data;
  },

  // Verify 2FA OTP (Step 2 — returns JWT token)
  verify2FA: async (email, otp) => {
    const response = await API.post('/auth/verify-2fa', { email, otp });
    return response.data;
  },

  // Get Current Profile (Protected)
  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data;
  },

  // Update Profile Image (Protected)
  updateProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await API.put('/auth/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Forgot Password (Sends OTP to email)
  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset Password using OTP
  resetPassword: async (email, otp, newPassword) => {
    const response = await API.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },

  // Google OAuth Login/Register
  googleLogin: async (accessToken, role) => {
    const response = await API.post('/auth/google', { token: accessToken, role });
    return response.data;
  },

  // Save user location coordinates (Protected)
  saveLocation: async (lat, lng) => {
    const response = await API.put('/auth/location', { lat, lng });
    return response.data;
  },
};

export default authService;
