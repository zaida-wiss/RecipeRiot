import { useState, useEffect } from 'react';
import type { Recipe } from '../../types';
import { getAuthHeaders } from '../../api/authApi';
import BulkUpload from './BulkUpload';
import './AddRecipeForm.css';

type Ingredient = { name: string; quantity: number; unit: string };
type View = 'single' | 'bulk';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  recipeToEdit?: Recipe;
};

const AddRecipeForm = ({ onClose, onSuccess, recipeToEdit }: Props) => {
  const isEditing = !!recipeToEdit;
  const [view, setView] = useState<View>('single');

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [time, setTime] = useState('');
  const [difficulty, setDifficulty] = useState('Medel');
  const [steps, setSteps] = useState(['']);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: 0, unit: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing && recipeToEdit) {
      setTitle(recipeToEdit.title);
      setImageUrl(recipeToEdit.imageUrl || '');
      setTime(recipeToEdit.time || '');
      setDifficulty(recipeToEdit.difficulty || 'Medel');
      setSteps(recipeToEdit.steps?.length ? recipeToEdit.steps : ['']);
      setIngredients(recipeToEdit.ingredients?.length ? recipeToEdit.ingredients : [{ name: '', quantity: 0, unit: '' }]);
    }
  }, [isEditing, recipeToEdit]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const method = isEditing ? 'PATCH' : 'POST';
      const endpoint = isEditing ? `/api/v1/recipes/${recipeToEdit?._id}` : '/api/v1/recipes';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          title, ingredients, steps, difficulty,
          ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
          ...(time.trim() ? { time: time.trim() } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Något gick fel');
      }
      onSuccess();
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
                {loading ? 'Sparar...' : 'Spara recept'}
              </button>
            </form>
          </>
        )}

        {view === 'bulk' && <BulkUpload onSuccess={onSuccess} />}
      </div>
    </div>
  );
};

export default AddRecipeForm;
