import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || '/api';
const API_URL = rawUrl.startsWith('http') && !rawUrl.endsWith('/api')
  ? rawUrl.replace(/\/+$/, '') + '/api'
  : rawUrl;

const api = axios.create({
  baseURL: API_URL,
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

    if (error.response?.status === 401 && !original._retry && !isAuthUrl) {
      original._retry = true;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // If user was on a protected page, safely redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin')) {
          window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
