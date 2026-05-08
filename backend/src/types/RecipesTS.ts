

export interface Recipe {
  id: number;
  title: string;
  ingredients?: string[];
  steps?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
