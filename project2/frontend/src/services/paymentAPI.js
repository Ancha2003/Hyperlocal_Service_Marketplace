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

// Payment API
export const paymentAPI = {
  createPaymentIntent: (bookingId) => api.post('/payment/create-payment-intent', { bookingId }),
  confirmPayment: (paymentData) => api.post('/payment/confirm-payment', paymentData),
  getPaymentStatus: (bookingId) => api.get(`/payment/payment-status/${bookingId}`),
  processRefund: (bookingId, reason) => api.post('/payment/refund', { bookingId, reason }),
  getPaymentMethods: () => api.get('/payment/payment-methods')
};

export default paymentAPI;

