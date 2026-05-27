import { useState } from 'react';
import { getAuthHeaders } from '../../api/authApi';
import './AddRecipeForm.css';

type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
};

const AddRecipeForm = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [steps, setSteps] = useState(['']);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: 0, unit: '' }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 0, unit: '' }]);
  };

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
      const res = await fetch('/api/v1/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ title, imageUrl, ingredients, steps }),
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
    <div className="add-recipe-backdrop" onClick={onClose}>
      <div className="add-recipe-modal" onClick={(e) => e.stopPropagation()}>
        <button className="add-recipe-close" onClick={onClose}>×</button>
        <h2>Lägg till recept</h2>

        {error && <div className="add-recipe-error">{error}</div>}

        <form onSubmit={handleSubmit} className="add-recipe-form">
          <label>Titel</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Receptets namn"
          />

          <label>Bild-URL</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />

          <label>Ingredienser</label>
          {ingredients.map((ing, i) => (
            <div key={i} className="ingredient-row">
              <input
                placeholder="Namn"
                value={ing.name}
                onChange={(e) => updateIngredient(i, 'name', e.target.value)}
              />
              <input
                placeholder="Mängd"
                type="number"
                value={ing.quantity || ''}
                onChange={(e) => updateIngredient(i, 'quantity', Number(e.target.value))}
              />
              <input
                placeholder="Enhet (g, dl...)"
                value={ing.unit}
                onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
              />
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addIngredient}>
            + Ingrediens
          </button>

          <label>Steg</label>
          {steps.map((step, i) => (
            <textarea
              key={i}
              placeholder={`Steg ${i + 1}`}
              value={step}
              onChange={(e) => updateStep(i, e.target.value)}
            />
          ))}
          <button type="button" className="add-btn" onClick={addStep}>
            + Steg
          </button>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sparar...' : 'Spara recept'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRecipeForm;