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
    servings: "4",
    rating: 4.5,
    reviews: 28,
    description: "En klassisk italiensk pasta med krämig carbonara-sås. Enkelt men otroligt gott!",
    ingredients: [
      { name: "Spaghetti", amount: "400g" },
      { name: "Bacon", amount: "200g" },
      { name: "Ägg", amount: "4" },
      { name: "Parmesanost", amount: "100g" },
      { name: "Svartpeppar", amount: "1 tsk" }
    ],
    steps: [
      "Koka spaghetti enligt förpackningens instruktioner.",
      "Steka bacon tills det är sprött, hacka det sedan.",
      "Vispa ihop ägg med riven parmesanost och svartpeppar.",
      "Häll äggblandningen över varmen pasta tillsammans med bacon.",
      "Blanda snabbt och servera omedelbar."
    ]
  },

  {
    id: "2",
    title: "Rustikt surdegsbröd",
    time: "4 h",
    difficulty: "Svår",
    image:
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1200&q=80",
    tags: ["Bakning"],
    servings: "1 bröd",
    rating: 5,
    reviews: 45,
    description: "Hemgjort surdegsbröd med perfekt krysta och luftig mik. Klassisk bakning för nybörjare och experter.",
    ingredients: [
      { name: "Surdegsfrälsare", amount: "200g" },
      { name: "Vatten", amount: "350ml" },
      { name: "Vete", amount: "500g" },
      { name: "Salt", amount: "10g" }
    ],
    steps: [
      "Blanda surdegsfrälsaren med vatten.",
      "Lägg till mjöl och salt, blanda väl.",
      "Låt jäsa i rumstemperatur i 4-5 timmar.",
      "Forma och lägg i en banneton.",
      "Grädda i 220°C i 45 minuter."
    ]
  },
  {
    id: "3",
    title: "Kyckling curry",
    time: "45 min",
    difficulty: "Medel",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Indiskt", "Kyckling"],
    servings: "4",
    rating: 4.8,
    reviews: 62,
    description: "En väl kryddad indisk curry med tender kyckling och aroomatisk kokosmjölk. Perfekt till ris!",
    ingredients: [
      { name: "Kycklingbröst", amount: "600g" },
      { name: "Kokosmjölk", amount: "400ml" },
      { name: "Curry paste", amount: "3 msk" },
      { name: "Lök", amount: "2" },
      { name: "Vitlök", amount: "3 klyftor" }
    ],
    steps: [
      "Tärna lök och fräs tillsammans med vitlök.",
      "Lägg till currypasta och fräs i 1 minut.",
      "Lägg i tärnad kyckling och brun den.",
      "Häll på kokosmjölk och låt koka i 20 minuter.",
      "Smaka av och servera med ris."
    ]
  },
];