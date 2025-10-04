import express from "express";

import {
  getAuditLogs,
  getConfig,
  getAuditLogById,
} from "../controllers/auditController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = express.Router();

// Only admin can view audit logs
router.use(auth, roleCheck);

router.get("/", getAuditLogs);

export default router;
