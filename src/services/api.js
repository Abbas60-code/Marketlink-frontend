import axios from 'axios';

// Create central Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

// Request interceptor: attach authorization bearer token if logged in
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('techwiz_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: extract structured error message
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject({ ...error, customMessage: message });
  }
);

export default API;
