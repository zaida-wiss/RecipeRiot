import { Clock } from "lucide-react";
import "./RecipeCard.css";
import type { Recipe } from "../../types";

const RecipeCard = ({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) => {
  return (
    <div className="card" onClick={onClick}>
      <img src={recipe.imageUrl || '/placeholder.jpg'} alt={recipe.title} />
      <div className="card-info">
        <div className="top">
          <span className="difficulty">{recipe.difficulty}</span>
          <span className="card-time">
            <Clock size={12} strokeWidth={2} />
            {recipe.time}
          </span>
        </div>
        <h3>{recipe.title}</h3>
        <div className="tags">
          {(recipe.tags ?? []).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <p className="card-author">Av {recipe.createdBy}</p>
      </div>
    </div>
  );
};

export default RecipeCard;