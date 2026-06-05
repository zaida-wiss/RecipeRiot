import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthData, getAuthHeaders } from "../../api/authApi";

const AdminPage = () => {
  const navigate = useNavigate();
  const auth = getAuthData();

  // Skydda sidan — bara admin får vara här
  if (!auth || auth.user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [steps, setSteps] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const parsedIngredients = ingredients
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(',');
          return {
            name: parts[0]?.trim() || '',
            quantity: Number(parts[1]?.trim()) || 1,
            unit: parts[2]?.trim() || 'st',
          };
        });

      const parsedSteps = steps
        .split('\n')
        .filter(line => line.trim());

      const res = await fetch('/api/v1/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          title,
          imageUrl,
          ingredients: parsedIngredients,
          steps: parsedSteps,
        }),
      });

      if (!res.ok) throw new Error('Kunde inte skapa recept');

      setSuccess('Receptet skapades! 🎉');
      setTitle('');
      setImageUrl('');
      setSteps('');
      setIngredients('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Admin — Lägg till recept</h1>

      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Titel</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Bild-URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Ingredienser (en per rad: namn, mängd, enhet)</label>
          <textarea
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            placeholder="mjöl, 3, dl&#10;ägg, 2, st&#10;mjölk, 6, dl"
            rows={5}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Steg (ett per rad)</label>
          <textarea
            value={steps}
            onChange={e => setSteps(e.target.value)}
            placeholder="Blanda ihop mjöl och ägg&#10;Tillsätt mjölk&#10;Stek i smör"
            rows={5}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.75rem 2rem', backgroundColor: '#e07b4f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          {loading ? 'Sparar...' : 'Lägg till recept'}
        </button>
      </form>
    </div>
  );
};

export default AdminPage;