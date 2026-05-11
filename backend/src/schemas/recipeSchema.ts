import { z } from 'zod';

export const recipeIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createRecipeSchema = z.object({
  title: z.string().min(3),
  createdBy: z.string().min(2),
  ingredients: z.array(z.string()).optional(),
  steps: z.array(z.string()).optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const listRecipesQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});