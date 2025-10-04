import { Router } from "express";
import {
  getPendingApprovals,
  decideApproval,
} from "../controllers/approvalController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/pending", auth, getPendingApprovals);
router.post("/:instanceStepId/decide", auth, decideApproval);

export default router;
