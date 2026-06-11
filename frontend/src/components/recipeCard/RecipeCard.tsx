import { useEffect, useState } from "react";
import { Clock, Heart } from "lucide-react";
import "./RecipeCard.css";
import type { Recipe } from "../../types";
import { getAuthData } from "../../api/authApi";
import { addFavorite, removeFavorite } from "../../api/favoritesApi";
import { recipeFallbackImage } from "../../constants/recipeImage";
import { optimizeImageUrl } from "../../utils/imageOptimization";

type RecipeCardProps = {
  recipe: Recipe;
  onClick: () => void;
  isFavorite?: boolean;
  onFavoriteChanged?: () => void;
};

const RecipeCard = ({
  recipe,
  onClick,
  isFavorite: initialFavorite = false,
  onFavoriteChanged,
}: RecipeCardProps) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const isLoggedIn = getAuthData() !== null;
  const difficulty = recipe.difficulty?.trim() || "Ej angiven";
  const time = recipe.time?.trim() || "Tid saknas";
  const authorName = recipe.createdByUsername?.trim() || "RecipeRiot";

  useEffect(() => {
    setIsFavorite(initialFavorite);
  }, [initialFavorite]);

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

      onFavoriteChanged?.();
    } catch (err) {
      console.error('Fel med favorit', err);
    }
  };

  return (
    <div className="card" onClick={onClick}>
      <div className="card-image-wrapper">
        <img src={optimizeImageUrl(recipe.imageUrl, 400) || recipeFallbackImage} alt={recipe.title} loading="lazy" />
        <div className="card-image-meta" aria-label="Receptinformation">
          <span className="difficulty">{difficulty}</span>
          <span className="card-time">
            <Clock size={12} strokeWidth={2} />
            {time}
          </span>
        </div>
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
        <h3>{recipe.title}</h3>
        <div className="tags">
          {(recipe.tags ?? []).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <p className="card-author">Av <span>{authorName}</span></p>
      </div>
    </div>
  );
};

export default RecipeCard;
