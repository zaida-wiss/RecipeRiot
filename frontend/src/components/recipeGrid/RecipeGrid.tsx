import { useState, useEffect } from "react";
import "./RecipeGrid.css";
import RecipeCard from "../recipeCard/RecipeCard";
import RecipeModal from "../recipeModal/RecipeModal";
import AddRecipeForm from "../addRecipe/AddRecipeForm";
import type { Recipe } from "../../types";
import { getAllRecipes } from "../../api/recipesApi";
import { getAuthData } from "../../api/authApi";
import { Plus } from "lucide-react";

const RecipeGrid = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const authData = getAuthData();
  const isLoggedIn = authData !== null;

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

  useEffect(() => {
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
          <span className="section-label">Trendande</span>
          <h2>Recept att börja med</h2>
          <p>Recept utvalda av teamet bakom RecipeRiot</p>

          {isLoggedIn && (
            <button
              className="add-recipe-btn"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={16} />
              Lägg till recept
            </button>
          )}
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

      {showAddForm && (
        <AddRecipeForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setLoading(true);
            fetchRecipes();
          }}
        />
      )}
    </section>
  );
};

export default RecipeGrid;