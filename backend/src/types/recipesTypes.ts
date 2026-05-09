

export interface RecipeResponse {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
