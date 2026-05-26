import { useEffect, useState, useMemo } from 'react';
import { Search, Clock, Tag } from 'lucide-react';
import RecipeModal from '../recipeModal/RecipeModal';
import type { Recipe } from '../../types'; // Se till att typen finns tillgänglig
import { getAllRecipes, toUiRecipe } from '../../api/recipesApi';
import './ExplorePage.css';

const ExplorePage = () => {
const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('Alla');
  const [activeDifficulty, setActiveDifficulty] = useState('Alla');
  // State för att hantera modalen
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);


  const allTags = useMemo(() => {
    const tags = recipes.flatMap((r) => r.tags);
    return ['Alla', ...Array.from(new Set(tags))];
  }, [recipes]);

  const difficulties = ['Alla', 'Lätt', 'Medel', 'Svår'];

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = activeTag === 'Alla' || recipe.tags.includes(activeTag);
    const matchesDiff = activeDifficulty === 'Alla' || recipe.difficulty === activeDifficulty;
    return matchesSearch && matchesTag && matchesDiff;
  });

  useEffect(() => {
  const loadRecipes = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const apiRecipes = await getAllRecipes();
      const uiRecipes = apiRecipes.map((recipe, index) =>
        toUiRecipe(recipe, index)
      );

      setRecipes(uiRecipes);
    } catch (error) {
      console.error(error);
      setError('Kunde inte hämta recept från servern.');
    } finally {
      setLoading(false);
    }
  };

  void loadRecipes();
}, []);

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
{loading && (
  <div className="loading-message">
    <p>Laddar recept...</p>
  </div>
)}

{error && (
  <div className="error-message">
    <p>{error}</p>
  </div>
)}

{!loading && !error && (
  <div className="recipe-grid">
    {filteredRecipes.length > 0 ? (
      filteredRecipes.map((recipe) => (
        <article
        key={recipe.id}
        className="recipe-card"
        onClick={() => setSelectedRecipe(recipe)}
        >
          <div className="image-container">
            <img src={recipe.image} alt={recipe.title} className="recipe-image" />
          </div>

          <div className="recipe-content">
            <div className="recipe-meta">
              <span className="difficulty-badge">{recipe.difficulty}</span>
              <span className="time-info">
                <Clock size={14} /> {recipe.time}
              </span>
            </div>

            <h2 className="recipe-title">{recipe.title}</h2>

            <div className="recipe-tags">
              {recipe.tags.map((tag) => (
                <span key={tag} className="tag">
                  <Tag size={10} style={{ marginRight: '4px' }} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))
    ) : (
      <div className="no-results">
        <p>Inga recept matchar din sökning. Prova något annat!</p>
      </div>
    )}
  </div>
)}

      {/* Renderar modalen endast om ett recept är valt */}
      {selectedRecipe && (
        <RecipeModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  </div>
  );
};

export default ExplorePage;