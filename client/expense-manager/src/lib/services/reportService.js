// services/reportService.js
import apiReq from "../apireq";

export const reportService = {
  // Get overview report
  async getOverviewReport(currency = null) {
    try {
      const url = currency
        ? `/reports/overview?currency=${currency}`
        : "/reports/overview";
      const response = await apiReq.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get spend by category report
  async getSpendByCategoryReport(currency = null) {
    try {
      const url = currency
        ? `/reports/spend-by-category?currency=${currency}`
        : "/reports/spend-by-category";
      const response = await apiReq.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get spend by user report
  async getSpendByUserReport(currency = null) {
    try {
      const url = currency
        ? `/reports/spend-by-user?currency=${currency}`
        : "/reports/spend-by-user";
      const response = await apiReq.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get monthly report
  async getMonthlyReport(currency = null) {
    try {
      const url = currency
        ? `/reports/monthly?currency=${currency}`
        : "/reports/monthly";
      const response = await apiReq.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
