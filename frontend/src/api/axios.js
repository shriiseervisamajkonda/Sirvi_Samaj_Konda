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
    const isAuthUrl = original?.url?.includes('/auth/me') || original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !original._retry && !isAuthUrl) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          const newAccess = res.data?.accessToken || res.data?.data?.accessToken;
          const newRefresh = res.data?.refreshToken || res.data?.data?.refreshToken;
          if (newAccess) {
            localStorage.setItem('accessToken', newAccess);
            if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
            original.headers.Authorization = `Bearer ${newAccess}`;
            return api(original);
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
