import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartsure_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smartsure_token');
      localStorage.removeItem('smartsure_refresh');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH SERVICE =====
export const authService = {
  sendOtp: (data) => api.post('/auth/send-otp', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  register: (data) => api.post('/auth/register', data),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
  updateProfile: (username, data) =>
    api.put('/auth/update-profile', data, { headers: { 'X-Username': username } }),
  changePassword: (username, data) =>
    api.put('/auth/change-password', data, { headers: { 'X-Username': username } }),
  getUser: (username) => api.get(`/auth/user/${username}`),
  logout: (username) =>
    api.post('/auth/logout', null, { headers: { 'X-Username': username } }),
  // Admin endpoints via auth-service
  getAllUsers: () => api.get('/auth/all-users'),
  deleteUser: (id) => api.delete(`/auth/delete/${id}`),
  blockUser: (id) => api.put(`/auth/users/${id}/block`),
  activateUser: (id) => api.put(`/auth/users/${id}/activate`),
  getNotifications: (username) => 
    api.get('/auth/notifications', { headers: { 'X-Username': username } }),
  markNotificationRead: (id) => api.put(`/auth/notifications/${id}/read`),
};

// ===== POLICY SERVICE =====
export const policyService = {
  getAll: () => api.get('/policies'),
  getById: (id) => api.get(`/policies/${id}`),
  getActive: () => api.get('/policies/active'),
  getExpired: () => api.get('/policies/expired'),
  getByType: (type) => api.get(`/policies/type/${type}`),
  search: (query) => api.get('/policies/search', { params: { query } }),
  getUserPolicies: (username) =>
    api.get('/policies/user', { headers: { 'X-Username': username } }),
  calculatePremium: (id) => api.get(`/policies/premium/calculate/${id}`),
  create: (data) => api.post('/policies', data),
  update: (id, data) => api.put(`/policies/${id}`, data),
  delete: (id) => api.delete(`/policies/${id}`),
  purchase: (id, username) =>
    api.post(`/policies/${id}/purchase`, null, { headers: { 'X-Username': username } }),
  cancel: (id, username) =>
    api.post(`/policies/${id}/cancel`, null, { headers: { 'X-Username': username } }),
  payPremium: (id, username) =>
    api.post(`/policies/${id}/pay-premium`, null, { headers: { 'X-Username': username } }),
  getPaymentStatus: (id, username) =>
    api.get(`/policies/${id}/payment-status`, { headers: { 'X-Username': username } }),
};

// ===== CLAIMS SERVICE =====
export const claimsService = {
  getAll: () => api.get('/claims'),
  getPending: () => api.get('/claims/pending'),
  getUserClaims: (username) =>
    api.get('/claims/user', { headers: { 'X-Username': username } }),
  getById: (id) => api.get(`/claims/${id}`),
  getDocuments: (id) => api.get(`/claims/${id}/documents`),
  getByStatus: (status) => api.get(`/claims/status/${status}`),
  initiate: (data, username) =>
    api.post('/claims/initiate-claim', data, { headers: { 'X-Username': username } }),
  submit: (id, username) =>
    api.put(`/claims/${id}/submit`, null, { headers: { 'X-Username': username } }),
  cancel: (id, username) =>
    api.put(`/claims/${id}/cancel`, null, { headers: { 'X-Username': username } }),
  addDocument: (id, file, username) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/claims/${id}/add-document`, formData, {
      headers: { 'X-Username': username, 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteDocument: (claimId, docId, username) =>
    api.delete(`/claims/${claimId}/documents/${docId}`, { headers: { 'X-Username': username } }),
  downloadDocument: (claimId, docId) => 
    api.get(`/claims/${claimId}/documents/${docId}/download`, { responseType: 'blob' }),
};

// ===== ADMIN SERVICE =====
export const adminService = {
  getAllClaims: () => api.get('/admin/claims'),
  getPendingClaims: () => api.get('/admin/claims/pending'),
  getClaimById: (id) => api.get(`/admin/claims/${id}`),
  reviewClaim: (id, data) => api.post(`/admin/claims/${id}/review`, data),
  startReview: (id) => api.put(`/admin/claims/${id}/start-review`),
  approveClaim: (id) => api.post(`/admin/claims/${id}/approve`),
  rejectClaim: (id) => api.post(`/admin/claims/${id}/reject`),
  getAllUsers: () => api.get('/admin/users'),
  blockUser: (id) => api.put(`/admin/users/${id}/block`),
  activateUser: (id) => api.put(`/admin/users/${id}/activate`),
  getGeneralReport: () => api.get('/admin/reports'),
  getClaimsReport: () => api.get('/admin/reports/claims'),
  getPoliciesReport: () => api.get('/admin/reports/policies'),
};

export default api;
