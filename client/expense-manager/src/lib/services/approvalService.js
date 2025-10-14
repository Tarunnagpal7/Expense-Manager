// services/approvalService.js
import apiReq from "../apireq";

export const approvalService = {
  // Get pending approvals
  async getPendingApprovals() {
    try {
      const response = await apiReq.get("/approval/pending");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get company-wide pending approvals count (admin-only)
  async getCompanyPendingCount() {
    try {
      const response = await apiReq.get("/approval/pending/company/count");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Make approval decision
  async decideApproval(instanceStepId, decision, comment) {
    try {
      const response = await apiReq.post(`/approval/${instanceStepId}/decide`, {
        decision,
        comment,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get approval instance
  async getApprovalInstance(expenseId) {
    try {
      const response = await apiReq.get(`/approval/instances/${expenseId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
