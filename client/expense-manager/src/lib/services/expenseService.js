// services/expenseService.js
import apiReq from "../apireq";

export const expenseService = {
  // Get all expenses
  async getAllExpenses() {
    try {
      const response = await apiReq.get("/expenses");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get expense by ID
  async getExpenseById(id) {
    try {
      const response = await apiReq.get(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new expense
  async createExpense(expenseData) {
    try {
      const response = await apiReq.post("/expenses", expenseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update expense
  async updateExpense(id, expenseData) {
    try {
      const response = await apiReq.patch(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Submit expense for approval
  async submitExpense(id) {
    try {
      const response = await apiReq.patch(`/expenses/${id}/submit`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete expense
  async deleteExpense(id) {
    try {
      const response = await apiReq.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user expenses
  async getUserExpenses(userId) {
    try {
      const response = await apiReq.get(`/expenses/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
