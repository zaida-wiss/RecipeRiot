import { useState, useEffect } from "react";
import { Clock, Users, ShoppingCart, ChefHat } from "lucide-react";
import "./recipes.css";
import type { Recipe } from "../../types";

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
              Av {recipe.createdBy}
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