import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.get('/products/moderation', adminController.getModerationProducts);
router.put('/products/:id/moderate', adminController.moderateProduct);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
