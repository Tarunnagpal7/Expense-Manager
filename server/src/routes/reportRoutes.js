import express from 'express';
import { auth } from '../middleware/auth.js';
import { overviewReport,spendByCategory,spendByUser,monthlyReport } from '../controllers/reportController.js';

const router = express.Router();


// Reports
router.get('/reports/overview', auth, overviewReport);
router.get('/reports/spend-by-category', auth, spendByCategory);
router.get('/reports/spend-by-user', auth, spendByUser);
router.get('/reports/monthly', auth, monthlyReport);

export default router;