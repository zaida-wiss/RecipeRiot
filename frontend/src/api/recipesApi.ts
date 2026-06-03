import type { Recipe } from '../types';
import { getAuthHeaders } from './authApi';

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
};

const API_URL = '/api/v1';

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
    allRecipes.push(...response.data as unknown as Recipe[]);
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
    throw new Error('Kunde inte skapa recept');
  }
  return response.json() as Promise<ApiRecipe>;
};
