import express from 'express';
import { auth } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { getAuditLogs, getAuditLogById, getConfig } from '../controllers/auditController.js';

const router = express.Router();

router.get('/audit-logs', roleCheck(['ADMIN', 'MANAGER']), getAuditLogs);
router.get('/audit-logs/:id', auth, roleCheck(['ADMIN', 'MANAGER']), getAuditLogById);
router.get('/config', auth, getConfig);

export default router;
