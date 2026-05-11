// src/schemas/user.schemas.ts
import { z } from 'zod';

// ─── POST /users ──────────────────────────────────────────────────────────────
export const createUserSchema = z.object({
  username: z
    .string()
    .min(2, 'Användarnamn måste ha minst 2 tecken')
    .max(50, 'Användarnamn får inte överstiga 50 tecken')
    .trim(),
  email: z
    .string()
    .email('Ogiltig e-postadress')
    .trim(),
});

// ─── PUT /users/:id ───────────────────────────────────────────────────────────
// .partial() gör alla fält valfria passar båda PUT/PATCH
export const updateUserSchema = createUserSchema.partial();

// ─── GET /users?page=&limit=&search= ─────────────────────────────────────────
export const listUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1, 'Sida måste vara minst 1')),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100, 'Max 100 användare per sida')),
  search: z.string().optional(),
});

// ─── :id param (GET/:id, PUT/:id, DELETE/:id) ────────────────────────────────
export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Ogiltigt MongoDB ObjectId-format'),
});
