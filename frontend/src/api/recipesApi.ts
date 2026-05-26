import type { Recipe } from '../types';

export type ApiIngredient = {
  name: string;
  quantity: number;
  unit: string;
};

export type ApiRecipe = {
  _id: string;
  title: string;
  createdBy: string;
  ingredients: ApiIngredient[];
  steps: string[];
  originalRef?: string;
  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type RecipesResponse = {
  data: ApiRecipe[];
  pagination: Pagination;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

const fetchRecipesPage = async (page: number): Promise<RecipesResponse> => {
  const response = await fetch(`${API_BASE_URL}/recipes?page=${page}&limit=100`);

  if (!response.ok) {
    throw new Error('Kunde inte hämta recept från servern');
  }

  return response.json() as Promise<RecipesResponse>;
};

export const getAllRecipes = async (): Promise<ApiRecipe[]> => {
  const allRecipes: ApiRecipe[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetchRecipesPage(page);

    allRecipes.push(...response.data);
    totalPages = response.pagination.totalPages;
    page += 1;
  }

  return allRecipes;
};



const fallbackImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80',
];

const getFallbackImage = (index: number): string => {
  return fallbackImages[index % fallbackImages.length];
};

export const toUiRecipe = (recipe: ApiRecipe, index: number): Recipe => {
  return {
    id: recipe._id,
    title: recipe.title,
    time: '30 min',
    difficulty: 'Lätt',
    image: getFallbackImage(index),
    tags: ['Community'],
    servings: 4,
    rating: 0,
    reviews: 0,
    description:
      recipe.steps[0] ?? 'Ett recept från RecipeRiot-communityt.',
    ingredients: recipe.ingredients.map((ingredient) => ({
      name: ingredient.name,
      amount: `${ingredient.quantity} ${ingredient.unit}`,
    })),
    steps: recipe.steps,
  };
};
