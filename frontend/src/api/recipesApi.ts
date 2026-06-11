import type { Recipe } from '../types';
import { clearAuthData, getAuthHeaders } from './authApi';

export type ApiIngredient = {
  name: string;
  quantity: number;
  unit: string;
};

export type ApiRecipe = {
  _id: string;
  title: string;
  createdBy: string;
  createdByUsername?: string;
  imageUrl?: string;
  time?: string;
  difficulty?: string;
  tags?: string[];
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

export type CreateRecipeInput = {
  title: string;
  ingredients?: ApiIngredient[];
  steps?: string[];
  imageUrl?: string;
  time?: string;
  difficulty?: string;
  tags?: string[];
};

export type UpdateRecipeInput = Partial<CreateRecipeInput>;

const API_URL = import.meta.env.VITE_API_URL + '/api/v1';
const SESSION_ENDED_MESSAGE = 'Din session har gått ut. Logga in igen.';

const getErrorMessage = async (
  response: Response,
  fallbackMessage: string
): Promise<string> => {
  if (response.status === 401) {
    clearAuthData(SESSION_ENDED_MESSAGE);
    return SESSION_ENDED_MESSAGE;
  }

  try {
    const errorData = await response.json();
    return errorData.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const fetchRecipesPage = async (page: number): Promise<RecipesResponse> => {
  const response = await fetch(`${API_URL}/recipes?page=${page}&limit=100`);
  if (!response.ok) {
    throw new Error('Kunde inte hämta recept från servern');
  }
  return response.json() as Promise<RecipesResponse>;
};

export const getAllRecipes = async (): Promise<Recipe[]> => {
  const allRecipes: Recipe[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetchRecipesPage(page);
    allRecipes.push(...(response.data as unknown as Recipe[]));
    totalPages = response.pagination.totalPages;
    page += 1;
  }

  return allRecipes;
};

export async function getRecipeById(id: string): Promise<Recipe> {
  const res = await fetch(`${API_URL}/recipes/${id}`);
  return res.json();
}

export const createRecipe = async (
  recipe: CreateRecipeInput
): Promise<ApiRecipe> => {
  const response = await fetch(`${API_URL}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(recipe),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Kunde inte skapa recept'));
  }
  return response.json() as Promise<ApiRecipe>;
};

export const updateRecipe = async (
  recipeId: string,
  recipe: UpdateRecipeInput
): Promise<ApiRecipe> => {
  const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(recipe),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Kunde inte uppdatera receptet'));
  }

  return response.json() as Promise<ApiRecipe>;
};

export const forkRecipe = async (
  recipeId: string,
  changes: UpdateRecipeInput
): Promise<Recipe> => {
  const response = await fetch(`${API_URL}/recipes/${recipeId}/fork`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(changes),
  });
  
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Kunde inte kopiera receptet'));
  }
  
  return response.json();
};

export const deleteRecipe = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/recipes/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Kunde inte radera receptet'));
  }
};
