import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { adminAuthService } from '../services/authService';

export const useAdminAuth = () => {
  const { user, token, isAuthenticated, setAuth, clearAuth, initAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      // First, try to initialize from localStorage
      initAuth();
      
      // If we have a token, verify it with the server
      const storedToken = localStorage.getItem('adminToken');
      if (storedToken) {
        try {
          const response = await adminAuthService.verifyToken();
          if (response.user && response.user.isAdmin) {
            setAuth(response.user, storedToken);
          } else {
            clearAuth();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          clearAuth();
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [initAuth, setAuth, clearAuth]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    setAuth,
    clearAuth,
  };
};