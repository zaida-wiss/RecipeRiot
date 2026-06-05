// src/api/favoritesApi.ts
import { getAuthHeaders } from './authApi';
import type { Recipe } from '../types';

export const getFavorites = async (): Promise<Recipe[]> => {
  const res = await fetch('/api/v1/favorites', {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  return json.data ?? [];
};

export const addFavorite = async (recipeId: string): Promise<void> => {
  await fetch(`/api/v1/favorites/${recipeId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
};

export const removeFavorite = async (recipeId: string): Promise<void> => {
  await fetch(`/api/v1/favorites/${recipeId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
};