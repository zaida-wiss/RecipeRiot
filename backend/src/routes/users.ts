// src/routes/users.ts
import { Router } from 'express';
import { validateRequest } from '../middleware/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  idParamSchema,
} from '../schemas/user.schemas.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/usersController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';

const router = Router();

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/users?page=&limit=&search=
router.get(
  '/', authenticate, authorizeRoles("admin"),
  validateRequest({ query: listUsersQuerySchema }),
  getAllUsers
);

// GET /api/users/:id
router.get(
  '/:id', authenticate, authorizeRoles("admin"),
  validateRequest({ params: idParamSchema }),
  getUserById
);

// POST /api/users
router.post(
  '/',  authenticate, authorizeRoles("admin"),
  validateRequest({ body: createUserSchema }),
  createUser
);

// PUT /api/users/:id  (alla fält valfria tack vare updateUserSchema)
router.put(
  '/:id', authenticate, authorizeRoles("admin"),
  validateRequest({ params: idParamSchema, body: updateUserSchema }),
  updateUser
);

// DELETE /api/users/:id
router.delete(
  '/:id', authenticate, authorizeRoles("admin"),
  validateRequest({ params: idParamSchema }),
  deleteUser
);

export default router;
