import { useState, useEffect } from "react";
import { Clock, Users, ShoppingCart, ChefHat, Trash2, Edit3, GitFork, Save, Plus } from "lucide-react";
import "./recipes.css";
import type { Recipe } from "../../types";
import { getAuthData } from "../../api/authApi";
import { getRecipeById } from "../../api/recipesApi";
import { recipeFallbackImage } from "../../constants/recipeImage";

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onFork: (recipeId: string, forkedRecipe: Partial<Recipe>) => void | Promise<void>;
  onDelete?: (recipeId: string) => void;
  onEdit?: (recipe: Recipe) => void;
  onOpenRecipe?: (recipe: Recipe) => void;
}

const RecipeModal = ({ recipe, onClose, onFork, onDelete, onEdit, onOpenRecipe }: RecipeModalProps) => {
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">("ingredients");
  const [isForking, setIsForking] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<Recipe | null>(null);

  const auth = getAuthData();
  const isLoggedIn = !!auth;
  const currentUserId = auth?.user?.id;
  const difficulty = recipe.difficulty?.trim() || "Ej angiven";
  const time = recipe.time?.trim() || "Tid saknas";
  const authorName = recipe.createdByUsername?.trim()
    || (typeof recipe.createdBy === "object" && recipe.createdBy !== null
      ? (recipe.createdBy as { username?: string }).username
      : undefined)
    || "RecipeRiot";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleStartFork = () => {
    setEditedRecipe({
      ...recipe,
      title: `${auth?.user?.username || "Min"}s ${recipe.title}`,
    });
    setIsForking(true);
  };

  const handleSaveFork = () => {
    if (editedRecipe) {
      void onFork(recipe._id, {
        ...editedRecipe,
        _id: undefined,
        createdBy: currentUserId,
        createdByUsername: auth?.user?.username,
      });
      setIsForking(false);
      onClose();
    }
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    if (!editedRecipe) return;
    const newIngredients = [...(editedRecipe.ingredients || [])];
    
    // Tillåt användaren att skriva vad de vill (även tomma strängar)
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    
    setEditedRecipe({ ...editedRecipe, ingredients: newIngredients });
  };

  const addIngredient = () => {
    if (!editedRecipe) return;
    setEditedRecipe({
      ...editedRecipe,
      ingredients: [...(editedRecipe.ingredients || []), { name: "", quantity: 0, unit: "" }],
    });
  };

  const recipeCreatorId = typeof recipe.createdBy === "object" && recipe.createdBy !== null 
    ? (recipe.createdBy as { _id?: string })._id 
    : recipe.createdBy;

  const isOwner = isLoggedIn && !!currentUserId && String(currentUserId).trim() === String(recipeCreatorId).trim();

  const handleOpenOriginal = async () => {
    if (!recipe.originalRecipe) return;

    try {
      const originalRecipe = await getRecipeById(recipe.originalRecipe._id);
      onOpenRecipe?.(originalRecipe);
    } catch (error) {
      console.error("Kunde inte öppna originalreceptet:", error);
      alert("Kunde inte öppna originalreceptet.");
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal__hero">
          <img className="modal__hero-image" src={recipe.imageUrl || recipeFallbackImage} alt={recipe.title} />
          <div className="modal__hero-gradient" aria-hidden="true" />
          <button className="modal__close" onClick={onClose}>×</button>
          <div className="modal__hero-title-wrap">
          {isForking ? (
            <input 
              className="modal__hero-title-input" // Uppdaterad klass
              value={editedRecipe?.title} 
              onChange={(e) => setEditedRecipe(prev => prev ? {...prev, title: e.target.value} : null)}
            />
          ) : (
            <h2 className="modal__hero-title">{recipe.title}</h2>
          )}
          </div>
        </div>

        <div className="modal__body">
          <div className="modal__actions">
            {isForking ? (
              <button onClick={handleSaveFork} className="modal__btn modal__btn--save"><Save size={16} /> Spara ny kopia</button>
            ) : isLoggedIn && (
              isOwner ? (
                <>
                  <button onClick={() => onEdit?.(recipe)} className="modal__btn modal__btn--edit"><Edit3 size={16} /> Redigera</button>
                  <button onClick={() => onDelete?.(recipe._id)} className="modal__btn modal__btn--delete"><Trash2 size={16} /> Radera</button>
                </>
              ) : (
                <button onClick={handleStartFork} className="modal__btn modal__btn--fork"><GitFork size={16} /> Forka recept</button>
              )
            )}
          </div>

          {!isForking && (
            <>
              <div className="modal__meta-row">
                <span className="badge">{difficulty}</span>
                <span className="modal__meta-item">
                  <Clock size={13} /> {time}
                </span>
                <span className="modal__meta-item modal__meta-author">
                  <Users size={13} /> Av {authorName}
                </span>
              </div>
              {recipe.originalRecipe && (
                <button
                  type="button"
                  className="modal__original-link"
                  onClick={handleOpenOriginal}
                >
                  <GitFork size={13} />
                  Original: {recipe.originalRecipe.title} av {recipe.originalRecipe.createdByUsername}
                </button>
              )}
              {(recipe.tags ?? []).length > 0 && (
                <div className="modal__tags">
                  {recipe.tags!.map((t) => <span key={t} className="modal__tag">{t}</span>)}
                </div>
              )}
              <div className="modal__divider" aria-hidden="true" />
            </>
          )}

          <div className="tabs">
            <button className={`tabs__btn ${activeTab === "ingredients" ? "tabs__btn--active" : ""}`} onClick={() => setActiveTab("ingredients")}>
              <ShoppingCart size={14} /> Ingredienser
            </button>
            <button className={`tabs__btn ${activeTab === "steps" ? "tabs__btn--active" : ""}`} onClick={() => setActiveTab("steps")}>
              <ChefHat size={14} /> Tillagning
            </button>
          </div>

          {activeTab === "ingredients" && (
            <ul className="ingredient-list">
              {(isForking ? editedRecipe?.ingredients : recipe.ingredients)?.map((ing, i) => (
                <li key={i} className="ingredient-item">
                  {isForking ? (
                    <div className="edit-row">
                      <input value={ing.name} onChange={(e) => handleIngredientChange(i, "name", e.target.value)} placeholder="Namn" />
                      <input type="number" value={ing.quantity} onChange={(e) => handleIngredientChange(i, "quantity", e.target.value)} placeholder="Mängd" />
                      <input value={ing.unit} onChange={(e) => handleIngredientChange(i, "unit", e.target.value)} placeholder="Enhet" />
                    </div>
                  ) : (
                    <>
                      <span className="ingredient-item__name">{ing.name}</span>
                      <span className="ingredient-item__amount">
                        {ing.quantity > 0 ? ing.quantity : ''}{ing.unit ? ' ' + ing.unit : ''}
                      </span>
                    </>
                  )}
                </li>
              ))}
              {isForking && <button onClick={addIngredient} className="add-btn"><Plus size={16} /> Lägg till ingrediens</button>}
            </ul>
          )}

          {activeTab === "steps" && (
          <ul className="step-list">
            {(isForking ? editedRecipe?.steps : recipe.steps)?.map((step, i) => (
              <li key={i} className="step-item">
                <div className="step-item__number">{i + 1}</div>
                {isForking ? (
                  <textarea 
                    className="step-input"
                    value={step} 
                    onChange={(e) => {
                      if (!editedRecipe) return;
                      const newSteps = [...(editedRecipe.steps || [])];
                      newSteps[i] = e.target.value;
                      setEditedRecipe({ ...editedRecipe, steps: newSteps });
                    }} 
                  />
                ) : (
                  <p className="step-item__text">{step}</p>
                )}
              </li>
            ))}
            {isForking && (
              <button 
                onClick={() => {
                  if (!editedRecipe) return;
                  setEditedRecipe({
                    ...editedRecipe,
                    steps: [...(editedRecipe.steps || []), ""],
                  });
                }} 
                className="add-btn"
              >
                <Plus size={16} /> Lägg till steg
              </button>
            )}
          </ul>
        )}
        </div>
      </div>
    </>
  );
};

export default RecipeModal;
