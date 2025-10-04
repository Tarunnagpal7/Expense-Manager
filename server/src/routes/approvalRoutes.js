import { Router } from "express";
import {
  getPendingApprovals,
  decideApproval,
  getApprovalInstance,
} from "../controllers/approvalController.js";
import { auth } from "../middleware/auth.js";
import { fakeAuth } from "../middleware/fakeAuth.js";

const router = Router();

router.get("/pending", getPendingApprovals);
router.post("/:instanceStepId/decide", auth, decideApproval);
router.get("/instances/:expenseId", getApprovalInstance);

export default router;
