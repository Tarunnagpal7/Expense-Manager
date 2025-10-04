// services/userService.js
import apiReq from "../apireq";

export const userService = {
  // Get all users
  async getAllUsers() {
    try {
      const response = await apiReq.get("/users");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      const response = await apiReq.post("/users", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await apiReq.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      const response = await apiReq.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get managers
  async getManagers() {
    try {
      const response = await apiReq.get("/users/managers");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
