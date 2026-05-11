// src/schemas/recipe.schemas.ts
import { z } from 'zod';

// ─── Hjälpschema: ingrediens (inbäddad i receptet) ───────────────────────────
const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingrediensnamn är obligatoriskt').max(100).trim(),
  quantity: z.number().positive('Mängd måste vara ett positivt tal'),
  unit: z.string().min(1, 'Enhet är obligatorisk').max(50).trim(),
});

// ─── Hjälpschema: steg (inbäddad i receptet) ─────────────────────────────────
const recipeStepSchema = z.object({
  stepNumber: z.number().int().positive('Stegnummer måste vara ett positivt heltal'),
  instruction: z
    .string()
    .min(1, 'Instruktion är obligatorisk')
    .max(1000)
    .trim(),
});

// ─── POST /recipes ────────────────────────────────────────────────────────────
export const createRecipeSchema = z.object({
  title: z
    .string()
    .min(2, 'Titel måste ha minst 2 tecken')
    .max(200, 'Titel får inte överstiga 200 tecken')
    .trim(),
  createdBy: z
    .string()
    .min(1, 'createdBy är obligatoriskt')
    .trim(),
  ingredients: z.array(ingredientSchema).optional().default([]),
  steps: z.array(recipeStepSchema).optional().default([]),
  // originalRef sätts av fork-logiken, inte av klienten vid vanlig skapelse
});

// ─── PATCH /recipes/:id ───────────────────────────────────────────────────────
// .partial() gör alla fält valfria
export const updateRecipeSchema = createRecipeSchema.partial();

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

// ─── :id param (GET/:id, PATCH/:id, DELETE/:id, POST/:id/fork) ───────────────
export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Ogiltigt MongoDB ObjectId-format'),
});