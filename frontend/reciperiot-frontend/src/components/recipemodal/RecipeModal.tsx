import { useState, useEffect } from "react";
import "./recipes.css";
import type { Recipe } from "../../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const difficultyClass: Record<Recipe["difficulty"], string> = {
  Lätt: "badge badge--easy",
  Medel: "badge badge--medium",
  Svår: "badge badge--hard",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="16" height="16" viewBox="0 0 24 24">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={s <= Math.round(rating) ? "#E8825A" : "none"}
            stroke="#E8825A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

function DifficultyBadge({ level }: { level: Recipe["difficulty"] }) {
  return <span className={difficultyClass[level]}>{level}</span>;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const RecipeModal = ({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">("ingredients");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal">
        {/* Hero */}
        <div className="modal__hero">
          <img className="modal__hero-image" src={recipe.image} alt={recipe.title} />
          <div className="modal__hero-gradient" />
          <button className="modal__close" onClick={onClose}>×</button>
          <div className="modal__hero-title-wrap">
            <h2 className="modal__hero-title">{recipe.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="modal__body">
          <div className="modal__meta-row">
            <DifficultyBadge level={recipe.difficulty} />
            <span className="modal__meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {recipe.time}
            </span>
            <span className="modal__meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
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

          <div className="modal__divider" />

          <div className="tabs">
            {(["ingredients", "steps"] as const).map((tab) => (
              <button
                key={tab}
                className={`tabs__btn${activeTab === tab ? " tabs__btn--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "ingredients" ? "🛒 Ingredienser" : "👨‍🍳 Tillagning"}
              </button>
            ))}
          </div>

          {activeTab === "ingredients" ? (
            <ul className="ingredient-list">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className={`ingredient-item ${i % 2 === 0 ? "ingredient-item--even" : "ingredient-item--odd"}`}>
                  <span className="ingredient-item__name">{ing.name}</span>
                  <span className="ingredient-item__amount">{ing.amount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ol className="step-list">
              {recipe.steps.map((step, i) => (
                <li key={i} className="step-item">
                  <span className="step-item__number">{i + 1}</span>
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
