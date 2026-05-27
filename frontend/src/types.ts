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
  imageUrl?: string;
  time?: string;
  difficulty?: string;
  tags?: string[];
  ingredients?: Ingredient[];
  steps?: string[];
  originalRef?: string;
  createdAt: string;
  updatedAt: string;
}