import type { Recipe } from "../types";
import { getAuthHeaders } from "./authApi";

const BASE_URL = import.meta.env.VITE_API_URL;

export type AdminUser = {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  favorites?: string[];
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiStatusError = Error & {
  status?: number;
};

const createStatusError = (message: string, status: number): ApiStatusError =>
  Object.assign(new Error(message), { status });

const getResponseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return data.message || `Fel (${response.status})`;
  } catch {
    return `Fel (${response.status})`;
  }
};

const getAdminHeaders = (): HeadersInit => ({
  ...getAuthHeaders(),
});

const requestAdminJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...init,
    headers: {
      ...getAdminHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw createStatusError(
      await getResponseErrorMessage(response),
      response.status
    );
  }

  return response.json() as Promise<T>;
};

const requestAdminNoContent = async (
  url: string,
  init?: RequestInit
): Promise<void> => {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...init,
    headers: {
      ...getAdminHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw createStatusError(
      await getResponseErrorMessage(response),
      response.status
    );
  }
};

type RecipesResponse = {
  data: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const checkAdminAccess = async (): Promise<void> => {
  await requestAdminNoContent("/api/v1/auth/admin");
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  return requestAdminJson<AdminUser[]>("/api/v1/users");
};

export const getAdminRecipes = async (): Promise<Recipe[]> => {
  const allRecipes: Recipe[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await requestAdminJson<RecipesResponse>(
      `/api/v1/recipes?page=${page}&limit=100`
    );

    allRecipes.push(...response.data);
    totalPages = response.pagination.totalPages;
    page += 1;
  }

  return allRecipes;
};

export const softDeleteUserAsAdmin = async (id: string): Promise<void> => {
  await requestAdminNoContent(`/api/v1/admin/users/${id}/soft-delete`, {
    method: "PATCH",
  });
};

export const softDeleteRecipeAsAdmin = async (id: string): Promise<void> => {
  await requestAdminNoContent(`/api/v1/admin/recipes/${id}/soft-delete`, {
    method: "PATCH",
  });
};
