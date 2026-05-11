export interface Ingredient {
  name: string;
  amount: string;
}

export interface Recipe {
  id: string;
  title: string;
  time: string;
  difficulty: "Lätt" | "Medel" | "Svår";
  image: string;
  tags: string[];
  servings: number;
  rating: number;
  reviews: number;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
}