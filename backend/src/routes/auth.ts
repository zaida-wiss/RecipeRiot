import { Router } from 'express';
import { validateRequest } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { registerSchema, loginSchema } from '../schemas/auth.schemas';
import { register, login, getMe } from '../controllers/authController';

const router = Router();

// POST /api/v1/auth/register
// Validera body först, kör controller sedan.
router.post('/register', validateRequest({ body: registerSchema }), register);

// POST /api/v1/auth/login
router.post('/login', validateRequest({ body: loginSchema }), login);

// GET /api/v1/auth/me
// authenticate måste ligga före getMe.
router.get('/me', authenticate, getMe);

export default router;