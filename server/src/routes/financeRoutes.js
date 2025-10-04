import express from 'express';
import { auth } from '../middleware/auth.js';
import { getPayouts,markPayoutPaid,getPaidExpenses } from '../controllers/financeController.js';


const router = express.Router();

// Finance
router.get('/payouts', auth, getPayouts);
router.post('/payouts/mark-paid', auth, markPayoutPaid);
router.get('/paid', auth, getPaidExpenses);


export default router;
