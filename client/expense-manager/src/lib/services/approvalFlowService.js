import apiReq from "../apireq";

export const approvalFlowService = {
  async listFlows() {
    const res = await apiReq.get("/approval-flows");
    return res.data;
  },

  async getFlow(flowId) {
    const res = await apiReq.get(`/approval-flows/${flowId}`);
    return res.data;
  },

  async createFlow(data) {
    const res = await apiReq.post("/approval-flows", data);
    return res.data;
  },

  async updateFlow(flowId, data) {
    const res = await apiReq.patch(`/approval-flows/${flowId}`, data);
    return res.data;
  },

  async deleteFlow(flowId) {
    const res = await apiReq.delete(`/approval-flows/${flowId}`);
    return res.data;
  },

  async addStep(
    flowId,
    { approverUserId = null, approverRole = null, stepOrder }
  ) {
    const res = await apiReq.post(`/approval-flows/${flowId}/steps`, {
      approverUserId,
      approverRole,
      stepOrder,
    });
    return res.data;
  },

  async updateStep(stepId, data) {
    const res = await apiReq.patch(`/approval-flows/steps/${stepId}`, data);
    return res.data;
  },

  async deleteStep(stepId) {
    const res = await apiReq.delete(`/approval-flows/steps/${stepId}`);
    return res.data;
  },
};
