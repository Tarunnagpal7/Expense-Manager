import express from "express";

import { AuditController } from "../controllers/auditController.js";
import { auth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/roleCheck.js";

const router = express.Router();

// Only admin can view audit logs
router.use(auth, requireAdmin);

router.get("/", AuditController.getAuditLogs);

export default router;
