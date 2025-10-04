import express from "express";

<<<<<<< HEAD
import {
  getAuditLogs,
  getConfig,
  getAuditLogById,
} from "../controllers/auditController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";
=======
import { getAuditLogs } from '../controllers/auditController.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';
>>>>>>> 3023fd8417ea886bf7feab55f53ed296dd25fe0f

const router = express.Router();

// Only admin can view audit logs
router.use(auth, roleCheck);

<<<<<<< HEAD
router.get("/", getAuditLogs);
=======
router.get('/', getAuditLogs);
>>>>>>> 3023fd8417ea886bf7feab55f53ed296dd25fe0f

export default router;
