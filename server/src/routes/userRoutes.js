import express from 'express';
import { UserController } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin, requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Only admin can manage users
router.get('/', requireAdmin, UserController.getUsers);
router.post('/', requireAdmin, UserController.createUser);
router.put('/:id', requireAdmin, UserController.updateUser);
router.delete('/:id', requireAdmin, UserController.deleteUser);

// Managers and above can view managers list
router.get('/managers', requireRole(['ADMIN', 'MANAGER']), UserController.getManagers);

export default router;