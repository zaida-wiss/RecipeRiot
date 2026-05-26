import { useEffect, useState, useMemo } from 'react';
import { Search, Clock, Tag } from 'lucide-react';
import RecipeModal from '../recipeModal/RecipeModal';
import type { Recipe } from '../../types'; // Se till att typen finns tillgänglig
import { getAllRecipes, toUiRecipe } from '../../api/recipesApi';
import './ExplorePage.css';

const DIFFICULTIES = ['Alla', 'Lätt', 'Medel', 'Svår'] as const;

type DifficultyFilter = typeof DIFFICULTIES[number];

type SearchBoxProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

const SearchBox = ({ searchTerm, onSearchChange }: SearchBoxProps) => (
  <div className="search-wrapper">
    <Search className="search-icon-svg" size={20} color="#817878" />
    <input
      type="text"
      placeholder="Sök på recepttitel..."
      className="search-input"
      value={searchTerm}
      onChange={(event) => onSearchChange(event.target.value)}
    />
  </div>
);

type FilterButtonsProps<T extends string> = {
  options: readonly T[];
  activeValue: T;
  onChange: (value: T) => void;
};

const FilterButtons = <T extends string>({
  options,
  activeValue,
  onChange,
}: FilterButtonsProps<T>) => (
  <div className="filter-group">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(option)}
        className={`filter-btn ${activeValue === option ? 'active' : ''}`}
      >
        {option}
      </button>
    ))}
  </div>
);

type RecipeCardProps = {
  recipe: Recipe;
  onClick: () => void;
};

const RecipeCard = ({ recipe, onClick }: RecipeCardProps) => (
  <article className="recipe-card" onClick={onClick}>
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
);

type RecipeResultsProps = {
  loading: boolean;
  error: string | null;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
};

const RecipeResults = ({
  loading,
  error,
  recipes,
  onSelectRecipe,
}: RecipeResultsProps) => {
  if (loading) {
    return (
      <div className="loading-message">
        <p>Laddar recept...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.length > 0 ? (
        recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => onSelectRecipe(recipe)}
          />
        ))
      ) : (
        <div className="no-results">
          <p>Inga recept matchar din sökning. Prova något annat!</p>
        </div>
      )}
    </div>
  );
};

const useExploreRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('Alla');
  const [activeDifficulty, setActiveDifficulty] =
    useState<DifficultyFilter>('Alla');

  const allTags = useMemo(() => {
    const tags = recipes.flatMap((recipe) => recipe.tags);
    return ['Alla', ...Array.from(new Set(tags))];
  }, [recipes]);

  const filteredRecipes = useMemo(() => recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = activeTag === 'Alla' || recipe.tags.includes(activeTag);
    const matchesDifficulty = activeDifficulty === 'Alla' || recipe.difficulty === activeDifficulty;
    return matchesSearch && matchesTag && matchesDifficulty;
  }), [activeDifficulty, activeTag, recipes, searchTerm]);

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

  return {
    activeDifficulty,
    activeTag,
    allTags,
    error,
    filteredRecipes,
    loading,
    searchTerm,
    setActiveDifficulty,
    setActiveTag,
    setSearchTerm,
  };
};

const ExplorePage = () => {
  const {
    activeDifficulty,
    activeTag,
    allTags,
    error,
    filteredRecipes,
    loading,
    searchTerm,
    setActiveDifficulty,
    setActiveTag,
    setSearchTerm,
  } = useExploreRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  return (
    <div className="explore-page-wrapper">
      <div className="explore-container">
        <header className="explore-header">
          <h1>Utforska recept</h1>
          <p>Hitta inspiration bland hundratals recept från vår gemenskap</p>
        </header>

        <SearchBox
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <div className="filter-section">
          <FilterButtons
            options={allTags}
            activeValue={activeTag}
            onChange={setActiveTag}
          />

          <FilterButtons<DifficultyFilter>
            options={DIFFICULTIES}
            activeValue={activeDifficulty}
            onChange={setActiveDifficulty}
          />
        </div>

        <RecipeResults
          loading={loading}
          error={error}
          recipes={filteredRecipes}
          onSelectRecipe={setSelectedRecipe}
        />
      </div>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
};

export default ExplorePage;
