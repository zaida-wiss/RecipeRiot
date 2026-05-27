import { useState, useEffect } from "react";
import "./RecipeGrid.css";
import RecipeCard from "../recipeCard/RecipeCard";
import RecipeModal from "../recipeModal/RecipeModal";
import type { Recipe } from "../../types";
import { getAllRecipes } from "../../api/recipesApi";

const RecipeGrid = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getAllRecipes();
        setRecipes(data);
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
              key={r._id}
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