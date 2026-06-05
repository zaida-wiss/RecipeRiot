import { useState } from "react";
import { Clock, Heart } from "lucide-react";
import "./RecipeCard.css";
import type { Recipe } from "../../types";
import { getAuthData } from "../../api/authApi";
import { addFavorite, removeFavorite } from "../../api/favoritesApi";

type RecipeCardProps = {
  recipe: Recipe;
  onClick: () => void;
  isFavorite?: boolean;
};

const RecipeCard = ({ recipe, onClick, isFavorite: initialFavorite = false }: RecipeCardProps) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const isLoggedIn = getAuthData() !== null;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) return;

    try {
      if (isFavorite) {
        await removeFavorite(recipe._id);
        setIsFavorite(false);
      } else {
        await addFavorite(recipe._id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Fel med favorit', err);
    }
  };

  return (
    <div className="card" onClick={onClick}>
      <div className="card-image-wrapper">
        <img src={recipe.imageUrl || '/placeholder.jpg'} alt={recipe.title} />
        {isLoggedIn && (
          <button
            className={`favorite-btn ${isFavorite ? 'favorite-btn--active' : ''}`}
            onClick={handleFavorite}
            aria-label={isFavorite ? 'Ta bort från favoriter' : 'Lägg till i favoriter'}
          >
            <Heart size={16} fill={isFavorite ? '#c56a2d' : 'none'} />
          </button>
        )}
      </div>
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
        <p className="card-author">Av {recipe.createdByUsername ?? recipe.createdBy}</p>
      </div>
    </div>
  );
};

export default RecipeCard;