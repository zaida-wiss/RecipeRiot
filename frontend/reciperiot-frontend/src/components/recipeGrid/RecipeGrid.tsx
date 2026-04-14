import { useState, useEffect } from "react";
import "./RecipeGrid.css";
import type { Recipe } from "../../types";
import RecipeCard from "../recipeCard/RecipeCard";
import RecipeModal from "../recipemodal/RecipeModal";


// Byt ut denna när backend är klar 
const USE_MOCK = true; // sätt till false när backend finns
const API_URL = "http://localhost:8080/api/recipes"; // backend-URL

const RecipeGrid = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);

        if (USE_MOCK) {
          // Används tills backend är klar
          const { recipes: mockData } = await import("../data/mockRecipes");
          setRecipes(mockData);
        } else {
          // Aktiveras när backend är klar – byt bara USE_MOCK till false
          const res = await fetch(API_URL);
          if (!res.ok) throw new Error("Kunde inte hämta recept");
          const data: Recipe[] = await res.json();
          setRecipes(data);
        }
      } catch (err) {
        setError("Något gick fel när recepten hämtades.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <section className="recipes-section">
        <div className="recipes-content">
          <p className="recipes-status">Laddar recept...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="recipes-section">
        <div className="recipes-content">
          <p className="recipes-status recipes-status--error">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="recipes-section">
      <div className="recipes-content">
        <div className="recipes-header">
          <h2>Trendande recept</h2>
          <p>De mest älskade och forkade recepten just nu</p>
        </div>

        <div className="grid">
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              onClick={() => setSelected(r)}
            />
          ))}
        </div>
      </div>

      {selected && (
        <RecipeModal recipe={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
};

export default RecipeGrid;
