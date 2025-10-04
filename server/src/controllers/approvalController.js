// controllers/approvalController.js
import {
  getPending,
  decide,
  getInstance,
} from "../services/approvalService.js";

//import approvalService from "../services/approvalService.js";

// Get all pending approvals for logged-in user
export const getPendingApprovals = async (req, res) => {
  try {
    const userId = req.user.id;
    const approvals = await getPending(userId);
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approver makes a decision
export const decideApproval = async (req, res) => {
  try {
    const { decision, comment } = req.body;
    const { instanceStepId } = req.params;
    const userId = req.user.id;

    const result = await decide(instanceStepId, userId, decision, comment);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get approval history for one expense
export const getApprovalInstance = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const history = await getInstance(expenseId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
