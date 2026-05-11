import { useState, useEffect } from "react";
import "./RecipeGrid.css";
import RecipeCard from "../recipeCard/RecipeCard";
import RecipeModal from "../recipeModal/RecipeModal";
import type { Recipe } from "../../types";

const USE_MOCK = true;
const API_URL = "http://localhost:8080/api/recipes";

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
          const { recipes: mockData } = await import("../data/mockRecipes");
          setRecipes(mockData);
        } else {
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
          <span className="section-label">Trendande nu</span>
          <h2>Veckans mest älskade recept</h2>
          <p>De mest forkade recepten från vår community</p>
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