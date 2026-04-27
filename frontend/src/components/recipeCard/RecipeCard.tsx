import "./RecipeCard.css";
import type { Recipe } from "../../types";

// Enskild kort-komponent – tar nu emot onClick för att öppna modal
const RecipeCard = ({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) => {
  return (
    <div className="card" onClick={onClick}>
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
