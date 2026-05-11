// src/routes/users.ts
import { Router } from 'express';
import { validateRequest } from '../middleware/validate';
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  idParamSchema,
} from '../schemas/user.schemas';

const usersController = require('../controllers/usersController');

const router = Router();

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/users?page=&limit=&search=
router.get(
  '/',
  validateRequest({ query: listUsersQuerySchema }),
  usersController.getAllUsers
);

// GET /api/users/:id
router.get(
  '/:id',
  validateRequest({ params: idParamSchema }),
  usersController.getUserById
);

// POST /api/users
router.post(
  '/',
  validateRequest({ body: createUserSchema }),
  usersController.createUser
);

// PUT /api/users/:id  (alla fält valfria tack vare updateUserSchema)
router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateUserSchema }),
  usersController.updateUser
);

// DELETE /api/users/:id
router.delete(
  '/:id',
  validateRequest({ params: idParamSchema }),
  usersController.deleteUser
);

module.exports = router;