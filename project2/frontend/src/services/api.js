import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Services API
export const servicesAPI = {
  getAll: (params = {}) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (serviceData) => api.post('/services', serviceData),
  update: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  delete: (id) => api.delete(`/services/${id}`),
  getByProvider: (providerId) => api.get(`/services/provider/${providerId}`)
};

// Bookings API
export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  getProviderBookings: () => api.get('/bookings/provider-bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  addRating: (id, rating) => api.post(`/bookings/${id}/rating`, rating),
  cancel: (id) => api.put(`/bookings/${id}/cancel`)
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getServices: (params = {}) => api.get('/admin/services', { params }),
  getBookings: (params = {}) => api.get('/admin/bookings', { params }),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, status),
  updateServiceStatus: (id, status) => api.put(`/admin/services/${id}/status`, status),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deleteService: (id) => api.delete(`/admin/services/${id}`)
};

export default api;

