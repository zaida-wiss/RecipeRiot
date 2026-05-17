// src/types/index.ts
// interfaces för alla datamodeller

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Recipe {
  id: number;
  title: string;
  ingredients?: string[];
  steps?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}