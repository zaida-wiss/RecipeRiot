export interface Ingredient {
  _id?: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  _id: string;
  title: string;
  createdBy: string;
  createdByUsername?: string;
  imageUrl?: string;
  time?: string;
  difficulty?: string;
  tags?: string[];
  ingredients?: Ingredient[];
  steps?: string[];
  originalRef?: string;
  originalRecipe?: {
    _id: string;
    title: string;
    createdByUsername: string;
  };
  createdAt: string;
  updatedAt: string;
}
