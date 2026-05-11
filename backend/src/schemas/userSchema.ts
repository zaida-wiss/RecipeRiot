import { z } from 'zod';

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createUserSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
});

export const updateUserSchema = createUserSchema.partial();