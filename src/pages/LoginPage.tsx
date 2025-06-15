import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Alert, CircularProgress } from "@mui/material";
import apiUrl from "../utils/apiUrl";
import useUserStore from "../stores/userStore";
import { LoginCredentials } from "../types";
import "../styles/LoginPage.css";

const LoginPage: React.FC = () => {
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const user = useUserStore((state) => state.user);
  const [formError, setFormError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    emailAddress: "",
    password: "",
  });
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${apiUrl}/admin/auth/login`, credentials, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setUserInfo(data);
      toast.success("Logged in successfully.");
      navigate("/");
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data.message;
        setFormError(serverMessage);
      } else {
        setFormError(`Something went wrong.${err}`);
      }
    },
  });

  useEffect(() => {
    console.log("User updated:", user);
  }, [user]);

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
          {formError && (
            <Alert severity="error" sx={{ mb: "1rem", fontSize: "0.8rem" }}>
              {formError}
            </Alert>
          )}
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
            {loginMutation.isPending ? (
              <CircularProgress size="1.3rem" sx={{ color: "white" }} />
            ) : (
              "Sign In"
            )}
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
