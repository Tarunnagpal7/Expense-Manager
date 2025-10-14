import { Router } from "express";
import {
  getPendingApprovals,
  decideApproval,
  getApprovalInstance,
  getCompanyPendingApprovalsCount,
} from "../controllers/approvalController.js";
import { auth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/roleCheck.js";

const router = Router();

// All routes require authentication
router.use(auth);

router.get("/pending", getPendingApprovals);
router.post("/:instanceStepId/decide", decideApproval);
router.get("/instances/:expenseId", getApprovalInstance);
router.get(
  "/pending/company/count",
  requireAdmin,
  getCompanyPendingApprovalsCount
);

export default router;
