export interface Recipe {
  id: string;
  title: string;
  time: string;
  difficulty: "Lätt" | "Medel" | "Svår";
  image: string;
  tags: string[];
  servings: string;
  rating: number;
  reviews: number;
  description: string;
  ingredients: Array<{ name: string; amount: string }>;
  steps: string[];
}