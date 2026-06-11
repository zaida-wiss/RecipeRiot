// src/schemas/recipe.schemas.ts
import { z } from 'zod';

// ─── Hjälpschema: ingrediens ──────────────────────────────────────────────────
const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingrediensnamn är obligatoriskt').max(100).trim(),
  quantity: z.number().min(0).default(0),
  unit: z.string().max(50).trim().default(''),
});

const difficultySchema = z.enum(['Lätt', 'Medel', 'Svår']);
const titleSchema = z
  .string()
  .min(2, 'Titel måste ha minst 2 tecken')
  .max(200, 'Titel får inte överstiga 200 tecken')
  .trim();
const timeSchema = z
  .string()
  .max(50, 'Tillagningstid får inte överstiga 50 tecken')
  .trim();
const tagsSchema = z.array(z.string().min(1).max(40).trim());
const ingredientsSchema = z.array(ingredientSchema);
const stepsSchema = z.array(
  z.string().min(1, "Steg får inte vara tomt").max(1000).trim()
);

// ─── POST /recipes ────────────────────────────────────────────────────────────
export const createRecipeSchema = z.object({
  title: titleSchema,
  imageUrl: z.url().optional(),
  time: timeSchema.optional(),
  difficulty: difficultySchema.optional(),
  tags: tagsSchema.optional().default([]),
  ingredients: ingredientsSchema.optional().default([]),
  steps: stepsSchema.optional().default([]),
  /// originalRef sätts av fork-logiken, inte av klienten vid vanlig skapelse
});

// ─── PATCH /recipes/:id ───────────────────────────────────────────────────────
export const updateRecipeSchema = z.object({
  title: titleSchema.optional(),
  imageUrl: z.union([z.url(), z.literal('')]).optional(),
  time: timeSchema.optional(),
  difficulty: difficultySchema.optional(),
  tags: tagsSchema.optional(),
  ingredients: ingredientsSchema.optional(),
  steps: stepsSchema.optional(),
});

// ─── GET /recipes?search=&page=&limit= ───────────────────────────────────────
export const listRecipesQuerySchema = z.object({
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
    .pipe(z.number().int().min(1).max(100, 'Max 100 recept per sida')),
  search: z.string().optional(),
});

// ─── :id param (GET/:id, PATCH/:id, DELETE/:id, POST/:id/fork)  ───────────────────────────────────────────────────────────────
export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Ogiltigt MongoDB ObjectId-format'),
});
