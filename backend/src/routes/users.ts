import { Router } from 'express';

import { getAllUsers, getUserById, createUser, updateUser, deleteUser, } from '../controllers/usersController';

import { validateRequest } from '../middleware/validate';

import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
} from '../schemas/userSchema';

const router = Router();

router.get('/', getAllUsers);

router.get(
  '/:id',
  validateRequest({ params: userIdSchema }),
  getUserById
);

router.post(
  '/',
  validateRequest({ body: createUserSchema }),
  createUser
);

router.put(
  '/:id',
  validateRequest({
    params: userIdSchema,
    body: updateUserSchema,
  }),
  updateUser
);

router.delete(
  '/:id',
  validateRequest({ params: userIdSchema }),
  deleteUser
);

export default router;