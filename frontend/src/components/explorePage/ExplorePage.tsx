import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import RecipeModal from '../recipeModal/RecipeModal';
import RecipeCard from '../recipeCard/RecipeCard';
import type { Recipe } from '../../types';
import { getAllRecipes, deleteRecipe } from '../../api/recipesApi';
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

  const difficulties = ['Alla', 'Lätt', 'Medel', 'Svår'];

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = activeTag === 'Alla' || (recipe.tags ?? []).includes(activeTag);
    const matchesDiff = activeDifficulty === 'Alla' || recipe.difficulty === activeDifficulty;
    return matchesSearch && matchesTag && matchesDiff;
  });

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
          onFork={(forkedData) => {
            setSelectedRecipe(null);
            alert(`Forka: Kopian "${forkedData.title}" skapas och förbereds för ingrediensändringar!`);
            // TODO: Här skickar du 'forkedData' vidare till ert receptformulär
          }}
          onEdit={(recipeToEdit) => {
            setSelectedRecipe(null);
            alert(`Redigera: Öppnar formulär för att ändra originalet "${recipeToEdit.title}"`);
            // TODO: Här sätter du igång er redigeringsvy
          }}
          onDelete={async (recipeId) => {
            if (!window.confirm(`Är du säker på att du vill radera "${selectedRecipe.title}"?`)) return;

            try {
              // 1. Anropa API:et
              await deleteRecipe(recipeId);
              
              // 2. Uppdatera listan i state så receptet försvinner direkt
              setRecipes((prevRecipes) => prevRecipes.filter(r => r._id !== recipeId));
              
              // 3. Stäng modalen
              setSelectedRecipe(null);
              
            } catch (err) {
              console.error("Kunde inte radera recept", err);
              alert("Det gick inte att radera receptet. Kontrollera din inloggning.");
            }
          }}
        />
      )}
    </div>
  );
};

export default ExplorePage;