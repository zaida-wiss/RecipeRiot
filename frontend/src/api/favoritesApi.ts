// src/api/favoritesApi.ts
import { getAuthHeaders } from './authApi';
import type { Recipe } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL;

const getFavoritesErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return data.message || `Fel (${response.status})`;
  } catch {
    return `Fel (${response.status})`;
  }
};

export const getFavorites = async (): Promise<Recipe[]> => {
  const res = await fetch(`${BASE_URL}/api/v1/favorites`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await getFavoritesErrorMessage(res));
  }

  const json = await res.json();
  return json.data ?? [];
};

export const addFavorite = async (recipeId: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/api/v1/favorites/${recipeId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await getFavoritesErrorMessage(res));
  }
};

export const removeFavorite = async (recipeId: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/api/v1/favorites/${recipeId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await getFavoritesErrorMessage(res));
  }
};
