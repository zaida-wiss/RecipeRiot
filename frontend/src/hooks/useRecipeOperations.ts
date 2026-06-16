import { deleteRecipe, createRecipe } from '../api/recipesApi';
import type { Recipe } from '../types';

const normalizeForkedRecipe = (forkedRecipe: Partial<Recipe>) => {
  const cleanedIngredients = (forkedRecipe.ingredients ?? []).map((ingredient) => ({
    ...ingredient,
    quantity:
      typeof ingredient.quantity === 'string'
        ? Number(ingredient.quantity)
        : (ingredient.quantity as number),
  }));

  return {
    title: forkedRecipe.title || 'Nytt recept',
    ingredients: cleanedIngredients,
    steps: forkedRecipe.steps || [],
    ...(forkedRecipe.imageUrl?.trim()
      ? { imageUrl: forkedRecipe.imageUrl.trim() }
      : {}),
    tags: forkedRecipe.tags || [],
    difficulty: forkedRecipe.difficulty || 'Medel',
    ...(forkedRecipe.time?.trim() ? { time: forkedRecipe.time.trim() } : {}),
  };
};

export const useRecipeOperations = (
  onRecipeAdded: () => void,
  onRecipeDeleted: (id: string) => void,
) => {
  const forkRecipe = async (recipeId: string, forkedRecipe: Partial<Recipe>) => {
    try {
      await createRecipe({
        ...normalizeForkedRecipe(forkedRecipe),
        originalRef: recipeId,
      });
      onRecipeAdded();
      alert('Receptet har kopierats till dina recept!');
    } catch (err) {
      console.error('Det gick inte att forka receptet:', err);
      alert('Kunde inte skapa receptet. Kontrollera konsolen för detaljer.');
    }
  };

  const removeRecipe = async (id: string) => {
    try {
      await deleteRecipe(id);
      onRecipeDeleted(id);
    } catch (err) {
      console.error('Det gick inte att radera receptet:', err);
    }
  };

  return {
    forkRecipe,
    removeRecipe,
  };
};
