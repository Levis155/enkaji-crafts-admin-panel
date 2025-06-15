import { create } from 'zustand';
import { AdminUser } from '../types';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AdminUser, token: string) => void;
  clearAuth: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  setAuth: (user: AdminUser, token: string) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  
  clearAuth: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  initAuth: () => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  },
}));