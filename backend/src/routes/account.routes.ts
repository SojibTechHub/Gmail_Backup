import { Router } from 'express';
import { accountController } from '../controllers';
import { authenticate, validate } from '../middlewares';
import { createAccountSchema, updateAccountSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/stats', accountController.getDashboardStats);
router.get('/', accountController.getAccounts);
router.post('/', validate(createAccountSchema), accountController.createAccount);
router.get('/:id', accountController.getAccountById);
router.patch('/:id', validate(updateAccountSchema), accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

export default router;
