import { Router } from 'express';
import { vaultController } from '../controllers';
import { authenticate, validate, strictLimiter } from '../middlewares';
import { updateVaultSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/:accountId', vaultController.getVault);
router.put('/:accountId', strictLimiter, validate(updateVaultSchema), vaultController.updateVault);
router.delete('/:accountId', strictLimiter, vaultController.deleteVault);

export default router;
