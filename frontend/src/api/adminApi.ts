import { getAuthHeaders } from "./authApi";

export const softDeleteUserAsAdmin = async (id: string): Promise<void> => {
  const response = await fetch(`/api/v1/admin/users/${id}/soft-delete`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Kunde inte radera användaren");
  }
};

export const softDeleteRecipeAsAdmin = async (id: string): Promise<void> => {
  const response = await fetch(`/api/v1/admin/recipes/${id}/soft-delete`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Kunde inte radera receptet");
  }
};