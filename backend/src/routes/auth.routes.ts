import { Router } from 'express';
import { authController } from '../controllers';
import { authenticate, authLimiter, strictLimiter, validate } from '../middlewares';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyMfaSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validators';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), authController.verifyEmail);
router.post('/forgot-password', strictLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', strictLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Authenticated user routes
router.get('/me', authenticate, authController.getMe);
router.patch('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

// Session & Device Management
router.get('/sessions', authenticate, authController.getSessions);
router.delete('/sessions/other', authenticate, authController.revokeOtherSessions);
router.delete('/sessions/:id', authenticate, authController.revokeSession);

// MFA routes
router.post('/mfa/enable', authenticate, authController.enableMfa);
router.post('/mfa/verify', authenticate, validate(verifyMfaSchema), authController.verifyMfa);
router.post('/mfa/disable', authenticate, validate(verifyMfaSchema), authController.disableMfa);

export default router;
