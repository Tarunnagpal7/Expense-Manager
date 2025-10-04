import { Router } from "express";
import {
  getApprovalFlows,
  getApprovalFlow,
  createApprovalFlow,
  updateApprovalFlow,
  deleteApprovalFlow,
  addStepToFlow,
  updateStep,
  deleteStep,
} from "../controllers/approvalFlowController.js";

const router = Router();

// Flow CRUD
router.get("/", getApprovalFlows);
router.get("/:id", getApprovalFlow);
router.post("/", createApprovalFlow);
router.patch("/:id", updateApprovalFlow);
router.delete("/:id", deleteApprovalFlow);

// Steps CRUD
router.post("/:id/steps", addStepToFlow);
router.patch("/steps/:id", updateStep);
router.delete("/steps/:id", deleteStep);

export default router;
