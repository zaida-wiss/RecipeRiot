import { useState, useEffect } from "react";
import { Clock, Users, ShoppingCart, ChefHat } from "lucide-react";
import "./recipes.css";
import type { Recipe } from "../../types";

const difficultyClass: Record<Recipe["difficulty"], string> = {
  Lätt:  "badge badge--easy",
  Medel: "badge badge--medium",
  Svår:  "badge badge--hard",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="star-rating" aria-label={`Betyg: ${rating} av 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={s <= Math.round(rating) ? "#E8825A" : "none"}
            stroke="#E8825A" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

const RecipeModal = ({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">("ingredients");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Hero */}
        <div className="modal__hero">
          <img className="modal__hero-image" src={recipe.image} alt={recipe.title} />
          <div className="modal__hero-gradient" aria-hidden="true" />
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Stäng modal"
          >
            ×
          </button>
          <div className="modal__hero-title-wrap">
            <h2 className="modal__hero-title" id="modal-title">{recipe.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="modal__body">
          <div className="modal__meta-row">
            <span className={difficultyClass[recipe.difficulty]}>{recipe.difficulty}</span>
            <span className="modal__meta-item">
              <Clock size={13} strokeWidth={2} aria-hidden="true" />
              {recipe.time}
            </span>
            <span className="modal__meta-item">
              <Users size={13} strokeWidth={2} aria-hidden="true" />
              {recipe.servings} portioner
            </span>
            <div className="modal__rating-wrap">
              <StarRating rating={recipe.rating} />
              <span className="modal__rating-text">{recipe.rating} ({recipe.reviews})</span>
            </div>
          </div>

          <div className="modal__tags">
            {recipe.tags.map((t) => (
              <span key={t} className="modal__tag">{t}</span>
            ))}
          </div>

          <p className="modal__description">{recipe.description}</p>

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
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className={`ingredient-item ${i % 2 === 0 ? "ingredient-item--even" : "ingredient-item--odd"}`}
                >
                  <span className="ingredient-item__name">{ing.name}</span>
                  <span className="ingredient-item__amount">{ing.amount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ol className="step-list" aria-label="Tillagningssteg">
              {recipe.steps.map((step, i) => (
                <li key={i} className="step-item">
                  <span className="step-item__number" aria-hidden="true">{i + 1}</span>
                  <p className="step-item__text">{step}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </>
  );
};

export default RecipeModal;