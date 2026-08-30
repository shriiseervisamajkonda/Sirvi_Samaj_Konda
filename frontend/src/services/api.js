import api from '../api/axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
  getPublicStats: () => api.get('/dashboard/public'),
};

export const familyAPI = {
  getAll: (params) => api.get('/families', { params }),
  getOne: (id) => api.get(`/families/${id}`),
  getByFamilyId: (familyId) => api.get(`/families/family-id/${familyId}`),
  create: (data) => api.post('/families', data),
  update: (id, data) => api.put(`/families/${id}`, data),
  delete: (id) => api.delete(`/families/${id}`),
  getStats: () => api.get('/families/stats'),
};

export const memberAPI = {
  getAll: (params) => api.get('/members', { params }),
  getOne: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
};

export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getOne: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

export const businessAPI = {
  getAll: (params) => api.get('/businesses', { params }),
  getOne: (id) => api.get(`/businesses/${id}`),
  create: (data) => api.post('/businesses', data),
  update: (id, data) => api.put(`/businesses/${id}`, data),
  delete: (id) => api.delete(`/businesses/${id}`),
};

export const bloodDonorAPI = {
  getAll: (params) => api.get('/blood-donors', { params }),
  getOne: (id) => api.get(`/blood-donors/${id}`),
  create: (data) => api.post('/blood-donors', data),
  update: (id, data) => api.put(`/blood-donors/${id}`, data),
  delete: (id) => api.delete(`/blood-donors/${id}`),
};

export const marriageAPI = {
  getAll: (params) => api.get('/marriage-profiles', { params }),
  getOne: (id) => api.get(`/marriage-profiles/${id}`),
  create: (data) => api.post('/marriage-profiles', data),
  update: (id, data) => api.put(`/marriage-profiles/${id}`, data),
  approve: (id, status) => api.put(`/marriage-profiles/${id}/approve`, { status }),
  delete: (id) => api.delete(`/marriage-profiles/${id}`),
};

export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  register: (id, data) => api.post(`/events/${id}/register`, data),
};

export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getOne: (id) => api.get(`/news/${id}`),
  create: (data) => api.post('/news', data),
  update: (id, data) => api.put(`/news/${id}`, data),
  delete: (id) => api.delete(`/news/${id}`),
};

export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  getAlbums: () => api.get('/gallery/albums'),
  getOne: (id) => api.get(`/gallery/${id}`),
  create: (data) => api.post('/gallery', data),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
};

export const documentAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getOne: (id) => api.get(`/documents/${id}`),
  download: (id) => api.get(`/documents/${id}/download`),
  create: (data) => api.post('/documents', data),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const committeeAPI = {
  getAll: (params) => api.get('/committees', { params }),
  getOne: (id) => api.get(`/committees/${id}`),
  create: (data) => api.post('/committees', data),
  update: (id, data) => api.put(`/committees/${id}`, data),
  delete: (id) => api.delete(`/committees/${id}`),
};

export const lekhaJokhaAPI = {
  getAll: (params) => api.get('/lekha-jokha', { params }),
  getPublic: (params) => api.get('/lekha-jokha/public', { params }),
  getStats: () => api.get('/lekha-jokha/stats'),
  create: (data) => api.post('/lekha-jokha', data),
  update: (id, data) => api.put(`/lekha-jokha/${id}`, data),
  delete: (id) => api.delete(`/lekha-jokha/${id}`),
};

export const panchSettlementAPI = {
  getAll: (params) => api.get('/panch-settlements', { params }),
  getPublic: (params) => api.get('/panch-settlements/public', { params }),
  create: (data) => api.post('/panch-settlements', data),
  update: (id, data) => api.put(`/panch-settlements/${id}`, data),
  delete: (id) => api.delete(`/panch-settlements/${id}`),
};

export const socialInfoAPI = {
  getAll: (params) => api.get('/social-info', { params }),
  getPublic: (params) => api.get('/social-info/public', { params }),
  create: (data) => api.post('/social-info', data),
  update: (id, data) => api.put(`/social-info/${id}`, data),
  delete: (id) => api.delete(`/social-info/${id}`),
};

export const villageAPI = {
  getAll: () => api.get('/village'),
  getOne: (id) => api.get(`/village/${id}`),
  update: (id, data) => api.put(`/village/${id}`, data),
};

export const contactAPI = {
  submit: (data) => api.post('/contacts', data),
  getAll: (params) => api.get('/contacts', { params }),
  getOne: (id) => api.get(`/contacts/${id}`),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const searchAPI = {
  global: (q) => api.get('/search', { params: { q } }),
  bloodDonors: (params) => api.get('/search/blood-donors', { params }),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
};

export const activityLogAPI = {
  getAll: (params) => api.get('/activity-logs', { params }),
};

export const gramUnitAPI = {
  getPublicDetails: () => api.get('/gram-units/public/details'),
  getAll: (params) => api.get('/gram-units', { params }),
  getOne: (id) => api.get(`/gram-units/${id}`),
  create: (data) => api.post('/gram-units', data),
  update: (id, data) => api.put(`/gram-units/${id}`, data),
  delete: (id) => api.delete(`/gram-units/${id}`),
};

export const gramUnitMemberAPI = {
  getAll: (params) => api.get('/gram-unit-members', { params }),
  getOne: (id) => api.get(`/gram-unit-members/${id}`),
  create: (data) => api.post('/gram-unit-members', data),
  update: (id, data) => api.put(`/gram-unit-members/${id}`, data),
  delete: (id) => api.delete(`/gram-unit-members/${id}`),
};

export const formationEventAPI = {
  getAll: (params) => api.get('/formation-events', { params }),
  getOne: (id) => api.get(`/formation-events/${id}`),
  create: (data) => api.post('/formation-events', data),
  update: (id, data) => api.put(`/formation-events/${id}`, data),
  delete: (id) => api.delete(`/formation-events/${id}`),
};

export const uploadAPI = {
  upload: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

