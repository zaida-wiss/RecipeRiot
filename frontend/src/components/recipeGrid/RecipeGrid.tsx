import { useState, useEffect } from "react";
import "./RecipeGrid.css";
import RecipeCard from "../recipeCard/RecipeCard";
import RecipeModal from "../recipeModal/RecipeModal";
import AddRecipeForm from "../addRecipe/AddRecipeForm";
import type { Recipe } from "../../types";
import { forkRecipe, getAllRecipes } from "../../api/recipesApi";
import { getAuthData } from "../../api/authApi";
import { Plus } from "lucide-react";

const RecipeGrid = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  // Denna state hjälper oss att ladda om listan utan regelbrott
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isLoggedIn = getAuthData() !== null;

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
  }, [refreshTrigger]); // Laddar om varje gång trigger-numret ändras

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
        <RecipeModal 
          recipe={selected} 
          onClose={() => setSelected(null)} 
          onFork={async (recipeId, forkedData) => {
            try {
              await forkRecipe(recipeId, {
                title: forkedData.title || "Nytt recept",
                ingredients: (forkedData.ingredients ?? []).map(({ name, quantity, unit }) => ({
                  name,
                  quantity: Number(quantity),
                  unit,
                })),
                steps: forkedData.steps ?? [],
                tags: forkedData.tags ?? [],
                difficulty: forkedData.difficulty || "Medel",
                ...(forkedData.imageUrl?.trim() ? { imageUrl: forkedData.imageUrl.trim() } : {}),
                ...(forkedData.time?.trim() ? { time: forkedData.time.trim() } : {}),
              });
              setSelected(null);
              setLoading(true);
              setRefreshTrigger(prev => prev + 1);
              alert("Receptet har kopierats till dina recept!");
            } catch (error) {
              console.error("Det gick inte att forka receptet:", error);
              alert(error instanceof Error ? error.message : "Kunde inte kopiera receptet.");
            }
          }}
          onEdit={(recipeToEdit) => {
            setSelected(null);
            setRecipeToEdit(recipeToEdit);
          }}
          onOpenRecipe={setSelected}
          onDelete={async () => {
            if (!window.confirm(`Är du säker på att du vill radera "${selected.title}"?`)) return;
            alert("Receptet raderat!");
            setSelected(null);
          }}
        />
      )}

      {showAddForm && (
        <AddRecipeForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setLoading(true);
            // Ökar numret med 1, vilket får useEffect att köra hämta-logiken på nytt!
            setRefreshTrigger(prev => prev + 1);
            setShowAddForm(false);
          }}
        />
      )}

      {recipeToEdit && (
        <AddRecipeForm
          recipeToEdit={recipeToEdit}
          onClose={() => setRecipeToEdit(null)}
          onSuccess={() => {
            setLoading(true);
            setRefreshTrigger(prev => prev + 1);
            setRecipeToEdit(null);
          }}
        />
      )}
    </section>
  );
};

export default RecipeGrid;
