import type { Recipe } from '../types';

const API_URL = '/api/v1/recipes';

export async function getAllRecipes(): Promise<Recipe[]> {
  const res = await fetch(API_URL);
  const json = await res.json();
  return json.data ?? json;
}

export async function getRecipeById(id: string): Promise<Recipe> {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
}