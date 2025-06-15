import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import apiUrl from '../utils/apiUrl';
import { useAuthStore } from '../stores/authStore';
import { LoginCredentials } from '../types';
import "../styles/LoginPage.css";

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    emailAddress: '',
    password: '',
  });
  
  const { setAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async() => {
      const response = await axios.post(`${apiUrl}/admin/auth/login`, credentials, {withCredentials:true});
      return response.data;
    },
    onSuccess: (data) => {
      if (data.user && data.user.isAdmin && data.token) {
        setAuth(data.user, data.token);
        toast.success('Welcome to Enkaji Admin Panel!');
      } else {
        toast.error('Access denied. Admin privileges required.');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Enkaji Crafts</h1>
          <h2>Admin Panel</h2>
          <p>Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="emailAddress" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="emailAddress"
              name="emailAddress"
              value={credentials.emailAddress}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Admin access only</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;