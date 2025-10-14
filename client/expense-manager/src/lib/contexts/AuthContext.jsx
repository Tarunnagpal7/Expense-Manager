import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // 🔹 Initialize user from storage or backend
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const response = await authService.getProfile();
          setUser(response.user);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(response.user));
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // 🔹 Login
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);
    setIsAuthenticated(true);
    toast.success("Login successful!");
    return response;
  };

  // 🔹 Register
  const register = async (userData) => {
    const response = await authService.register(userData);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);
    setIsAuthenticated(true);
    toast.success("Registration successful!");
    return response;
  };

  // 🔹 Logout (instant cleanup + redirect)
  const logout = async () => {
    try {
      await authService.logout(); // optional
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);

      // ✅ force re-render + redirect immediately
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
