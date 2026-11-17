import { Router } from 'express';
import { notificationController } from '../controllers';
import { authenticate } from '../middlewares';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
