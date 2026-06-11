import { useState } from 'react';
import { createRecipe, updateRecipe } from '../../api/recipesApi';
import type { Recipe } from '../../types';
import BulkUpload from './BulkUpload';
import './AddRecipeForm.css';

type Ingredient = { name: string; quantity: number; unit: string };
type View = 'single' | 'bulk';

type AddRecipeFormProps = {
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  recipe?: Recipe;
};

const AddRecipeForm = ({ onClose, onSuccess, recipe }: AddRecipeFormProps) => {
  const isEditing = !!recipe;
  const [view, setView] = useState<View>('single');

  const [title, setTitle] = useState(recipe?.title ?? '');
  const [imageUrl, setImageUrl] = useState(recipe?.imageUrl ?? '');
  const [time, setTime] = useState(recipe?.time ?? '');
  const [difficulty, setDifficulty] = useState(recipe?.difficulty || 'Medel');
  const [steps, setSteps] = useState(recipe?.steps?.length ? recipe.steps : ['']);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients?.length
      ? recipe.ingredients.map(({ name, quantity, unit }) => ({ name, quantity, unit }))
      : [{ name: '', quantity: 0, unit: '' }]
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: 0, unit: '' }]);

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => setSteps([...steps, '']);

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cleanedIngredients = ingredients
        .filter((ingredient) => ingredient.name.trim())
        .map((ingredient) => ({
          ...ingredient,
          name: ingredient.name.trim(),
          unit: ingredient.unit.trim(),
        }));
      const cleanedSteps = steps
        .map((step) => step.trim())
        .filter(Boolean);
      const recipeData = {
        title,
        ingredients: cleanedIngredients,
        steps: cleanedSteps,
        difficulty,
        time: time.trim(),
        ...(isEditing
          ? { imageUrl: imageUrl.trim() }
          : imageUrl.trim()
            ? { imageUrl: imageUrl.trim() }
            : {}),
      };

      if (recipe) {
        await updateRecipe(recipe._id, recipeData);
      } else {
        await createRecipe(recipeData);
      }

      await onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-recipe-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="add-recipe-modal">
        <button className="add-recipe-close" type="button" onClick={onClose}>×</button>
        <h2>{isEditing ? 'Redigera recept' : 'Lägg till recept'}</h2>

        {!isEditing && (
          <div className="bulk-tabs">
            <button
              type="button"
              className={`bulk-tab-btn ${view === 'single' ? 'active' : ''}`}
              onClick={() => setView('single')}
            >
              Enskilt recept
            </button>
            <button
              type="button"
              className={`bulk-tab-btn ${view === 'bulk' ? 'active' : ''}`}
              onClick={() => setView('bulk')}
            >
              Massuppladdning
            </button>
          </div>
        )}

        {view === 'single' && (
          <>
            {error && <div className="add-recipe-error">{error}</div>}
            <form onSubmit={handleSubmit} className="add-recipe-form">
              <label>Titel</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Receptets namn" />

              <label>Bild-URL</label>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />

              <div className="recipe-details-row">
                <div>
                  <label>Tillagningstid</label>
                  <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="30 min" />
                </div>
                <div>
                  <label>Svårighetsgrad</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="Lätt">Lätt</option>
                    <option value="Medel">Medel</option>
                    <option value="Svår">Svår</option>
                  </select>
                </div>
              </div>

              <label>Ingredienser</label>
              {ingredients.map((ing, i) => (
                <div key={i} className="ingredient-row">
                  <input placeholder="Namn" value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} />
                  <input placeholder="Mängd" type="number" value={ing.quantity || ''} onChange={(e) => updateIngredient(i, 'quantity', Number(e.target.value))} />
                  <input placeholder="Enhet (g, dl...)" value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)} />
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addIngredient}>+ Ingrediens</button>

              <label>Steg</label>
              {steps.map((step, i) => (
                <textarea key={i} placeholder={`Steg ${i + 1}`} value={step} onChange={(e) => updateStep(i, e.target.value)} />
              ))}
              <button type="button" className="add-btn" onClick={addStep}>+ Steg</button>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sparar...' : isEditing ? 'Spara ändringar' : 'Spara recept'}
              </button>
            </form>
          </>
        )}

        {!isEditing && view === 'bulk' && <BulkUpload onSuccess={onSuccess} />}
      </div>
    </div>
  );
};

export default AddRecipeForm;
