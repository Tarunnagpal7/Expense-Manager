// services/authService.js
import apiReq from "../apireq";

export const authService = {
  // Register new user
  async register(userData) {
    try {
      const response = await apiReq.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await apiReq.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user profile
  async getProfile() {
    try {
      const response = await apiReq.get("/auth/profile");
      console.log("response data is: ", response);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout user
  async logout() {
    try {
      const response = await apiReq.post("/auth/logout");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
