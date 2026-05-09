

export interface RecipeType {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
