import "./RecipeCard.css";
import type { Recipe } from "../../types";

// Denna komponent mappar ut alla recept och skapar den beiga boxen
export const RecipeList = ({ recipes }: { recipes: Recipe[] }) => {
  return (
    <section className="recipe-section-wrapper">
      <div className="recipe-container">
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '40px', 
          fontFamily: 'Playfair Display', 
          fontSize: '2.5rem' 
        }}>
          Utforska recept
        </h2>
        
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Din enskilda kort-komponent
const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  return (
    <div className="card">
      <img src={recipe.image} alt={recipe.title} />

      <div className="card-info">
        <div className="top">
          <span className="difficulty">{recipe.difficulty}</span>
          <span>{recipe.time}</span>
        </div>

        <h3>{recipe.title}</h3>

        <div className="tags">
          {recipe.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;