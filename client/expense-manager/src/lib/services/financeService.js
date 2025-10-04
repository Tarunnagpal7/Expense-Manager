// services/financeService.js
import apiReq from "../apireq";

export const financeService = {
  // Get payouts
  async getPayouts(currency = null) {
    try {
      const url = currency
        ? `/finance/payouts?currency=${currency}`
        : "/finance/payouts";
      const response = await apiReq.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark payouts as paid
  async markPayoutsPaid(expenseIds) {
    try {
      const response = await apiReq.post("/finance/payouts/mark-paid", {
        expenseIds,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get paid expenses
  async getPaidExpenses(currency = null) {
    try {
      const url = currency
        ? `/finance/paid?currency=${currency}`
        : "/finance/paid";
      const response = await apiReq.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
