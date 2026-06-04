import { useState, useEffect } from "react";
import { Clock, Users, ShoppingCart, ChefHat, Trash2, Edit3, GitFork } from "lucide-react";
import "./recipes.css";
import type { Recipe } from "../../types";
import { getAuthData } from "../../api/authApi";

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onFork: (forkedRecipe: Partial<Recipe>) => void;
  onDelete?: (recipeId: string) => void;
  onEdit?: (recipe: Recipe) => void;
}

const RecipeModal = ({ recipe, onClose, onFork, onDelete, onEdit }: RecipeModalProps) => {
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">("ingredients");

  // 1. Hämta inloggad användardata (kollar både id och _id för säkerhets skull)
  const auth = getAuthData();
  const isLoggedIn = !!auth;
  const currentUserId = auth?.user?.id;

  // 2. Extrahera skaparens ID (stödjer både sträng, objekt med id, eller objekt med _id)
 let recipeCreatorId = "";
  if (recipe.createdBy) {
    if (typeof recipe.createdBy === "object" && recipe.createdBy !== null) {
      const creatorObj = recipe.createdBy as { _id?: string; id?: string };
      recipeCreatorId = creatorObj._id || creatorObj.id || "";
    } else {
      recipeCreatorId = String(recipe.createdBy);
    }
  }

// 3. Kontrollera ägarskap (Super-strikt kontroll för att förhindra falska matchningar)
  const isOwner = 
    isLoggedIn && 
    !!currentUserId && 
    !!recipeCreatorId && 
    String(currentUserId).trim().length > 5 && // Säkerställ att det är ett riktigt ID
    String(recipeCreatorId).trim().length > 5 && 
    String(currentUserId).trim() === String(recipeCreatorId).trim();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleForkClick = () => {
    const username = auth?.user?.username || "min";
    
    const forkedData: Partial<Recipe> = {
      ...recipe,
      _id: undefined, 
      title: `${recipe.title} (${username} kopia)`,
      createdBy: currentUserId,
      createdByUsername: auth?.user?.username
    };

    onFork(forkedData);
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Hero */}
        <div className="modal__hero">
          <img
            className="modal__hero-image"
            src={recipe.imageUrl || '/placeholder.jpg'}
            alt={recipe.title}
          />
          <div className="modal__hero-gradient" aria-hidden="true" />
          <button className="modal__close" onClick={onClose} aria-label="Stäng modal">
            ×
          </button>
          <div className="modal__hero-title-wrap">
            <h2 className="modal__hero-title" id="modal-title">{recipe.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="modal__body">
          
          {/* Action-knappar */}
          {isLoggedIn && (
            <div className="modal__actions">
              {isOwner ? (
                <>
                  <button onClick={() => onEdit?.(recipe)} className="modal__btn modal__btn--edit">
                    <Edit3 size={16} /> Redigera recept
                  </button>
                  <button onClick={() => onDelete?.(recipe._id)} className="modal__btn modal__btn--delete">
                    <Trash2 size={16} /> Radera recept
                  </button>
                </>
              ) : (
                <button onClick={handleForkClick} className="modal__btn modal__btn--fork">
                  <GitFork size={16} /> Forka recept (Skapa kopia)
                </button>
              )}
            </div>
          )}

          <div className="modal__meta-row">
            {recipe.difficulty && (
              <span className="badge">{recipe.difficulty}</span>
            )}
            {recipe.time && (
              <span className="modal__meta-item">
                <Clock size={13} strokeWidth={2} aria-hidden="true" />
                {recipe.time}
              </span>
            )}
            <span className="modal__meta-item">
              <Users size={13} strokeWidth={2} aria-hidden="true" />
              Av {recipe.createdByUsername ?? (typeof recipe.createdBy === 'object' && recipe.createdBy !== null ? (recipe.createdBy as { username?: string }).username : recipe.createdBy)}
            </span>
          </div>

          {(recipe.tags ?? []).length > 0 && (
            <div className="modal__tags">
              {recipe.tags!.map((t) => (
                <span key={t} className="modal__tag">{t}</span>
              ))}
            </div>
          )}

          <div className="modal__divider" aria-hidden="true" />

          {/* Tabs */}
          <div className="tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === "ingredients"}
              className={`tabs__btn${activeTab === "ingredients" ? " tabs__btn--active" : ""}`}
              onClick={() => setActiveTab("ingredients")}
            >
              <ShoppingCart size={14} strokeWidth={2} aria-hidden="true" />
              Ingredienser
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "steps"}
              className={`tabs__btn${activeTab === "steps" ? " tabs__btn--active" : ""}`}
              onClick={() => setActiveTab("steps")}
            >
              <ChefHat size={14} strokeWidth={2} aria-hidden="true" />
              Tillagning
            </button>
          </div>

          {activeTab === "ingredients" ? (
            <ul className="ingredient-list" aria-label="Ingredienser">
              {(recipe.ingredients ?? []).length > 0 ? (
                recipe.ingredients!.map((ing, i) => (
                  <li
                    key={i}
                    className={`ingredient-item ${i % 2 === 0 ? "ingredient-item--even" : "ingredient-item--odd"}`}
                  >
                    <span className="ingredient-item__name">{ing.name}</span>
                    <span className="ingredient-item__amount">{ing.quantity} {ing.unit}</span>
                  </li>
                ))
              ) : (
                <li className="ingredient-item">Inga ingredienser angivna</li>
              )}
            </ul>
          ) : (
            <ol className="step-list" aria-label="Tillagningssteg">
              {(recipe.steps ?? []).length > 0 ? (
                recipe.steps!.map((step, i) => (
                  <li key={i} className="step-item">
                    <span className="step-item__number" aria-hidden="true">{i + 1}</span>
                    <p className="step-item__text">{step}</p>
                  </li>
                ))
              ) : (
                <li className="step-item">Inga steg angivna</li>
              )}
            </ol>
          )}
        </div>
      </div>
    </>
  );
};

export default RecipeModal;