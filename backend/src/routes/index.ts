import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import vaultRoutes from './vault.routes';
import recoveryRoutes from './recovery.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/vault', vaultRoutes);
router.use('/recovery', recoveryRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'MailVault API',
    timestamp: new Date().toISOString(),
  });
});

export default router;
