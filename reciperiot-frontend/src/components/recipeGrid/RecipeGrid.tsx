import "./RecipeGrid.css";
import RecipeCard from "../recipeCard/RecipeCard";
import { recipes } from "../../data/mockRecipies";

const RecipeGrid = () => {
  return (
    <section className="recipes">
      <div className="recipes-header">
        <h2>Trendande recept</h2>
        <p>De mest älskade och forkade recepten just nu</p>
      </div>

      <div className="grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </section>
  );
};

export default RecipeGrid;