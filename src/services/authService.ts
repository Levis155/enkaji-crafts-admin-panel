import api from '../utils/axios';
import { LoginCredentials, AdminUser } from '../types';

export const adminAuthService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/admin/auth/login', credentials);
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/admin/auth/verify');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/admin/auth/logout');
    return response.data;
  },
};