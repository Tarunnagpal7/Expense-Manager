import { Router } from "express";
import {
  getPendingApprovals,
  decideApproval,
  getApprovalInstance,
} from "../controllers/approvalController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(auth);

router.get("/pending", getPendingApprovals);
router.post("/:instanceStepId/decide", decideApproval);
router.get("/instances/:expenseId", getApprovalInstance);

export default router;
