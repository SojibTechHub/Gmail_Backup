import { Router } from 'express';
import { adminController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import { UserRole } from '../types';

const router = Router();

// Only admin and super_admin
router.use(authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/statistics', adminController.getStatistics);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/role', adminController.updateUserRole);
router.get('/accounts', adminController.getAccounts);
router.get('/audit-logs', adminController.getAuditLogs);
router.patch('/providers/:provider', adminController.updateProvider);

export default router;
