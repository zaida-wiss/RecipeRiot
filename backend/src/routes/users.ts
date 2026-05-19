// src/routes/users.ts
import { Router } from 'express';
import { validateRequest } from '../middleware/validate';
import { z } from 'zod'; // Importera z för att göra ett snabbt login-schema
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  idParamSchema,
} from '../schemas/user.schemas';

import * as usersController from '../controllers/usersController';

const router = Router();

// Ett enkelt valideringsschema för login (kräver email och lösenord)
const loginSchema = z.object({
  email: z.string().email('Ogiltig e-postadress'),
  password: z.string().min(1, 'Lösenord krävs'),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/users/login
router.post(
  '/login',
  validateRequest({ body: loginSchema }),
  usersController.loginUser
);

// GET /api/users?page=&limit=&search=
router.get(
  '/',
  validateRequest({ query: listUsersQuerySchema }),
  getAllUsers
);

// GET /api/users/:id
router.get(
  '/:id',
  validateRequest({ params: idParamSchema }),
  getUserById
);

// POST /api/users (Registrering)
router.post(
  '/',
  validateRequest({ body: createUserSchema }),
  createUser
);

// PUT /api/users/:id  (alla fält valfria tack vare updateUserSchema)
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateUserSchema }),
  updateUser
);

// DELETE /api/users/:id
router.delete(
  '/:id',
  validateRequest({ params: idParamSchema }),
  deleteUser
);

export default router;
