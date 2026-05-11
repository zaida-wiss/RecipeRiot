export interface Recipe {
  id: string;
  title: string;
  time: string;
  difficulty: "Lätt" | "Medel" | "Svår";
  image: string;
  tags: string[];
}