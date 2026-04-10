import type { Recipe } from "../types";

export const recipes: Recipe[] = [
  {
    id: "1",
    title: "Krämig pasta med basilika",
    time: "25 min",
    difficulty: "Lätt",
    image: "https://source.unsplash.com/400x300/?pasta",
    tags: ["Italienskt"]
  },
  {
    id: "2",
    title: "Hawaiiansk poké bowl",
    time: "35 min",
    difficulty: "Medel",
    image: "https://source.unsplash.com/400x300/?poke",
    tags: ["Fisk"]
  },
  {
    id: "3",
    title: "Rustikt surdegsbröd",
    time: "4 h",
    difficulty: "Svår",
    image: "https://source.unsplash.com/400x300/?bread",
    tags: ["Bakning"]
  }
];