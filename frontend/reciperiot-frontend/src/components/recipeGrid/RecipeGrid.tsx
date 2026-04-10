import "./RecipeGrid.css";
import RecipeCard from "../recipeCard/RecipeCard";
import { recipes } from "../data/mockRecipes";

const RecipeGrid = () => {
  return (
    <section className="recipes-section">
      <div className="recipes-content">
        <div className="recipes-header">
          <h2>Trendande recept</h2>
          <p>De mest älskade och forkade recepten just nu</p>
        </div>

        <div className="grid">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecipeGrid;