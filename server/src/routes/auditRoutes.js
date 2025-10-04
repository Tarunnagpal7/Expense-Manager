import express from 'express';

import { getAuditLogs } from '../controllers/auditController.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';

const router = express.Router();

// Only admin can view audit logs
router.use(auth, requireAdmin);

router.get('/', getAuditLogs);

export default router;