import type { Recipe } from "../../types";

export const recipes: Recipe[] = [
  {
    id: "1",
    title: "Spaghetti Carbonara",
    time: "25 min",
    difficulty: "Lätt",
    image:
      "https://images.unsplash.com/photo-1608756687911-aa1599ab3bd9?auto=format&fit=crop&w=1200&q=80",
    tags: ["Italienskt", "Pasta"]
  },

  {
    id: "2",
    title: "Rustikt surdegsbröd",
    time: "4 h",
    difficulty: "Svår",
    image:
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1200&q=80",
    tags: ["Bakning"]
  },
  {
    id: "3",
    title: "Kyckling curry",
    time: "45 min",
    difficulty: "Medel",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Indiskt", "Kyckling"]
  },
];