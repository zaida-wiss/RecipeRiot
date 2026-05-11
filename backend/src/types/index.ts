// src/types/index.ts

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Step {
  order: number;
  instruction: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Recipe {
  id: number;
  title: string;

  ingredients: Ingredient[];

  steps: Step[];

  createdBy: string;

  createdAt: string;
  updatedAt: string;
}