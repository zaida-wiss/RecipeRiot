import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import RecipeModal from '../recipeModal/RecipeModal';
import RecipeCard from '../recipeCard/RecipeCard';
import type { Recipe } from '../../types';
import { getAllRecipes, deleteRecipe, createRecipe } from '../../api/recipesApi';
import './ExplorePage.css';

const ExplorePage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('Alla');
  const [activeDifficulty, setActiveDifficulty] = useState('Alla');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getAllRecipes();
        setRecipes(data);
      } catch (err) {
        console.error('Kunde inte hämta recept', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const allTags = useMemo(() => {
    const tags = recipes.flatMap((r) => r.tags ?? []);
    return ['Alla', ...Array.from(new Set(tags))];
  }, [recipes]);

  const difficulties = ['Alla', 'Lätt', 'Medel', 'Svår', 'Ej angiven'];

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = activeTag === 'Alla' || (recipe.tags ?? []).includes(activeTag);
    const recipeDifficulty = recipe.difficulty?.trim() || 'Ej angiven';
    const matchesDiff = activeDifficulty === 'Alla' || recipeDifficulty === activeDifficulty;
    return matchesSearch && matchesTag && matchesDiff;
  });

  const handleFork = async (forkedRecipe: Partial<Recipe>) => {
    try {
      // Tvätta datan för att undvika 400 Bad Request
      const cleanedIngredients = (forkedRecipe.ingredients || []).map(ing => ({
        ...ing,
        quantity: typeof ing.quantity === 'string' ? parseFloat(ing.quantity) : Number(ing.quantity)
      }));

      const recipeToSave = {
        title: forkedRecipe.title || "Nytt recept",
        ingredients: cleanedIngredients,
        steps: forkedRecipe.steps || [],
        ...(forkedRecipe.imageUrl?.trim()
          ? { imageUrl: forkedRecipe.imageUrl.trim() }
          : {}),
        tags: forkedRecipe.tags || [],
        difficulty: forkedRecipe.difficulty || "Medel",
        ...(forkedRecipe.time?.trim() ? { time: forkedRecipe.time.trim() } : {}),
      };

      await createRecipe(recipeToSave);
      
      // Stäng modalen men stanna på sidan
      setSelectedRecipe(null);
      alert("Receptet har lagts till i dina recept!");
      
    } catch (err) {
      console.error("Det gick inte att forka receptet:", err);
      alert("Kunde inte kopiera receptet. Kontrollera att du är inloggad.");
    }
  };

  if (loading) return <p>Laddar recept...</p>;

  return (
    <div className="explore-page-wrapper">
      <div className="explore-container">
        <header className="explore-header">
          <h1>Utforska recept</h1>
          <p>Hitta inspiration bland hundratals recept från vår gemenskap</p>
        </header>

        <div className="search-wrapper">
          <Search className="search-icon-svg" size={20} color="#817878" />
          <input
            type="text"
            placeholder="Sök på recepttitel..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-section">
          <div className="filter-group">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`filter-btn ${activeTag === tag ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="filter-group">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setActiveDifficulty(diff)}
                className={`filter-btn ${activeDifficulty === diff ? 'active' : ''}`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div className="recipe-grid">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
              />
            ))
          ) : (
            <div className="no-results">
              <p>Inga recept matchar din sökning. Prova något annat!</p>
            </div>
          )}
        </div>
      </div>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onFork={handleFork}
          onEdit={() => {
            setSelectedRecipe(null);
          }}
          onDelete={async (recipeId) => {
            if (!window.confirm(`Är du säker på att du vill radera "${selectedRecipe.title}"?`)) return;
            try {
              await deleteRecipe(recipeId);
              setRecipes((prevRecipes) => prevRecipes.filter(r => r._id !== recipeId));
              setSelectedRecipe(null);
            } catch (err) {
              console.error("Kunde inte radera recept", err);
            }
          }}
        />
      )}
    </div>
  );
};

export default ExplorePage;
