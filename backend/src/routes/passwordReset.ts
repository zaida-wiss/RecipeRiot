import { Router } from 'express';
import { validateRequest } from '../middleware/validate.js';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schemas.js';
import {
  confirmPasswordReset,
  requestPasswordReset,
} from '../controllers/passwordResetController.js';

const router = Router();

router.post(
  '/request',
  validateRequest({ body: forgotPasswordSchema }),
  requestPasswordReset
);

router.post(
  '/confirm',
  validateRequest({ body: resetPasswordSchema }),
  confirmPasswordReset
);

export default router;
