import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || '/api';
const API_URL = rawUrl.startsWith('http') && !rawUrl.endsWith('/api')
  ? rawUrl.replace(/\/+$/, '') + '/api'
  : rawUrl;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthUrl = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/google-login');

    // Handle Network / Timeout errors gracefully
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.friendlyMessage = 'सर्वर से संपर्क करने में समय समाप्त हो गया (Request timed out). कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।';
    } else if (error.message === 'Network Error' || !error.response) {
      error.friendlyMessage = 'सर्वर या इंटरनेट से संपर्क टूट गया (Network Error). कृपया कनेक्शन जांचें।';
    }

    if (error.response?.status === 401 && !original._retry && !isAuthUrl) {
      original._retry = true;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));

        // If user was on a protected page, safely redirect to login
        const currentPath = window.location.pathname;
        if (
          !currentPath.startsWith('/login') &&
          !currentPath.startsWith('/register') &&
          (currentPath.startsWith('/admin') || currentPath.startsWith('/profile'))
        ) {
          window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
