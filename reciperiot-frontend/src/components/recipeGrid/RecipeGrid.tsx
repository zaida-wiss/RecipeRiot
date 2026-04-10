import "./RecipeGrid.css";
import RecipeCard from "../recipeCard/RecipeCard";
import { recipes } from "../../data/mockRecipies";

const RecipeGrid = () => {
  return (
    <section className="recipes">
      <h2>Trendande recept</h2>
      <p>De mest forkade och älskade recepten just nu</p>

      <div className="grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </section>
  );
};

export default RecipeGrid;