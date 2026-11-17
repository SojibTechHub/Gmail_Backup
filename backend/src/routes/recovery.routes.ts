import { Router } from 'express';
import { recoveryController } from '../controllers';
import { authenticate, validate } from '../middlewares';
import { createSessionSchema, updateSessionSchema } from '../validators';

const router = Router();

// Public provider details
router.get('/providers', recoveryController.getProviders);
router.get('/providers/:provider', recoveryController.getProviderDetails);

// Authenticated recovery actions
router.use(authenticate);

router.post('/sessions', validate(createSessionSchema), recoveryController.createSession);
router.get('/sessions', recoveryController.getSessions);
router.get('/sessions/:id', recoveryController.getSessionById);
router.patch('/sessions/:id', validate(updateSessionSchema), recoveryController.updateSession);
router.get('/readiness/:accountId', recoveryController.getReadiness);

export default router;
