import type { Recipe } from "../../types";

export const recipes: Recipe[] = [
  {
    id: "1",
    title: "Spaghetti Carbonara",
    time: "25 min",
    difficulty: "Lätt",
    image:
      "https://images.unsplash.com/photo-1608756687911-aa1599ab3bd9?auto=format&fit=crop&w=1200&q=80",
    tags: ["Italienskt", "Pasta"],
    servings: 4,
    rating: 4.5,
    reviews: 128,
    description: "En klassisk italiensk pastarätt med bacon, ägg och parmesan.",
    ingredients: [
      { name: "Spagetti", amount: "400g" },
      { name: "Guanciale eller bacon", amount: "200g" },
      { name: "Ägg", amount: "4" },
      { name: "Pecorino Romano", amount: "100g" },
      { name: "Salt och svartpeppar", amount: "efter smak" }
    ],
    steps: ["Koka pastan enligt anvisning", "Steka bacon tills det är sprött", "Blanda ägg med ost", "Blanda allt tillsammans och servera omedelbar"]
  },

  {
    id: "2",
    title: "Rustikt surdegsbröd",
    time: "4 h",
    difficulty: "Svår",
    image:
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1200&q=80",
    tags: ["Bakning"],
    servings: 8,
    rating: 4.8,
    reviews: 95,
    description: "Ett autentiskt surdegsbröd med lång jäsning och perfekt skorpa.",
    ingredients: [
      { name: "Mjöl", amount: "500g" },
      { name: "Vatten", amount: "350ml" },
      { name: "Surdegsfrämjäsning", amount: "100g" },
      { name: "Salt", amount: "10g" }
    ],
    steps: ["Blanda ingredienser", "Låt jäsa 4 timmar", "Form och andra jäsning", "Baka i 220°C i 30 minuter"]
  },
  {
    id: "3",
    title: "Kyckling curry",
    time: "45 min",
    difficulty: "Medel",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Indiskt", "Kyckling"],
    servings: 4,
    rating: 4.3,
    reviews: 156,
    description: "Krämig och välkryddad indisk curry med zart kyckling.",
    ingredients: [
      { name: "Kyckling", amount: "800g" },
      { name: "Lökar", amount: "2" },
      { name: "Kokosmjölk", amount: "400ml" },
      { name: "Currypasta", amount: "3 msk" },
      { name: "Salt och peppar", amount: "efter smak" }
    ],
    steps: ["Schnitzel kycklingen", "Sautera ingredienser", "Tillsätt kokosmjölk", "Låt sjuda 30 minuter"]
  },
];