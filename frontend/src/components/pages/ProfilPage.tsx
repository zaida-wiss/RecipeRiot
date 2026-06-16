import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { ArrowUpDown, ChevronDown, Search } from 'lucide-react';
import { getAuthData, clearAuthData, deleteMyAccount, exportMyData } from '../../api/authApi';
>>>>>>> 4251ff5 (Byt adminbehörigheter mot GDPR-dataexport i inställningar)
import { getAllRecipes, deleteRecipe, createRecipe } from '../../api/recipesApi';
import { getFavorites } from '../../api/favoritesApi';
import RecipeCard from '../recipeCard/RecipeCard';
import RecipeModal from '../recipeModal/RecipeModal';
import AddRecipeForm from '../addRecipe/AddRecipeForm';
import type { Recipe } from '../../types';
import './ProfilePage.css';

type Tab = 'mina-recept' | 'favoriter' | 'installningar';
type TimeFilter = 'Snabb' | 'Medel' | 'Lång';
type FavoriteSort = 'newest' | 'title' | 'time';
type OpenFavoriteFilter = 'type' | 'difficulty' | 'time' | null;

const profileTabs: Array<{ value: Tab; label: string }> = [
  { value: 'mina-recept', label: 'Mina recept' },
  { value: 'favoriter', label: 'Favoriter' },
  { value: 'installningar', label: 'Inställningar' },
];

const filterRecipesByUser = (recipes: Recipe[], userId?: string) =>
  recipes.filter((recipe) => String(recipe.createdBy) === String(userId));

const favoriteTimeOptions: Array<{ value: TimeFilter; label: string }> = [
  { value: 'Snabb', label: 'Högst 30 min' },
  { value: 'Medel', label: '31-60 min' },
  { value: 'Lång', label: 'Mer än 60 min' },
];

const getRecipeTimeInMinutes = (time?: string): number | null => {
  if (!time?.trim()) return null;

  const normalizedTime = time.toLowerCase().replace(',', '.');
  const hoursMatch = normalizedTime.match(/(\d+(?:\.\d+)?)\s*(?:h|tim)/);
  const minutesMatch = normalizedTime.match(/(\d+)\s*(?:min|m)\b/);

  if (hoursMatch || minutesMatch) {
    const hours = hoursMatch ? Number(hoursMatch[1]) * 60 : 0;
    const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
    return hours + minutes;
  }

  const numberMatch = normalizedTime.match(/\d+(?:\.\d+)?/);
  return numberMatch ? Number(numberMatch[0]) : null;
};

const normalizeForkedRecipe = (forkedRecipe: Partial<Recipe>) => {
  const cleanedIngredients = (forkedRecipe.ingredients ?? []).map((ingredient) => ({
    ...ingredient,
    quantity:
      typeof ingredient.quantity === 'string'
        ? Number(ingredient.quantity)
        : (ingredient.quantity as number),
  }));

  return {
    title: forkedRecipe.title || 'Nytt recept',
    ingredients: cleanedIngredients,
    steps: forkedRecipe.steps || [],
    ...(forkedRecipe.imageUrl?.trim()
      ? { imageUrl: forkedRecipe.imageUrl.trim() }
      : {}),
    tags: forkedRecipe.tags || [],
    difficulty: forkedRecipe.difficulty || 'Medel',
    ...(forkedRecipe.time?.trim() ? { time: forkedRecipe.time.trim() } : {}),
  };
};

type ProfileTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const ProfileTabs = ({ activeTab, onTabChange }: ProfileTabsProps) => (
  <div className="profile-tabs">
    {profileTabs.map((tab) => (
      <button
        key={tab.value}
        className={`profile-tab ${activeTab === tab.value ? 'active' : ''}`}
        onClick={() => onTabChange(tab.value)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

type RecipeSectionProps = {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  favoriteIds: Set<string>;
  onFavoriteChanged: () => void;
};

type MyRecipesSectionProps = RecipeSectionProps & {
  onAddRecipe: () => void;
};

const MyRecipesSection = ({
  recipes,
  onAddRecipe,
  onSelectRecipe,
  favoriteIds,
  onFavoriteChanged,
}: MyRecipesSectionProps) => (
  <div>
    <button className="profile-add-btn" onClick={onAddRecipe}>
      + Lägg till nytt recept
    </button>

    {recipes.length > 0 ? (
      <div className="profile-grid">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe._id}
            recipe={recipe}
            isFavorite={favoriteIds.has(recipe._id)}
            onClick={() => onSelectRecipe(recipe)}
            onFavoriteChanged={onFavoriteChanged}
          />
        ))}
      </div>
    ) : (
      <div className="profile-cta">
        <div className="profile-cta-icon">🍳</div>
        <h3>Du har inga recept än</h3>
        <p>Dela ditt första recept med communityn!</p>
        <button className="profile-add-btn" onClick={onAddRecipe}>
          + Lägg till ditt första recept
        </button>
      </div>
    )}
  </div>
);

const FavoritesSection = ({
  recipes,
  onSelectRecipe,
  favoriteIds,
  onFavoriteChanged,
}: RecipeSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeDifficulties, setActiveDifficulties] = useState<string[]>([]);
  const [activeTimes, setActiveTimes] = useState<TimeFilter[]>([]);
  const [sortBy, setSortBy] = useState<FavoriteSort>('newest');
  const [openFilter, setOpenFilter] = useState<OpenFavoriteFilter>(null);
  const filterSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!openFilter) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterSectionRef.current
        && !filterSectionRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(null);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenFilter(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openFilter]);

  const allTags = useMemo(
    () => Array.from(new Set(recipes.flatMap((recipe) => recipe.tags ?? []))).sort(),
    [recipes],
  );

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('sv');

    return recipes
      .filter((recipe) => {
        const recipeDifficulty = recipe.difficulty?.trim() || 'Ej angiven';
        const timeInMinutes = getRecipeTimeInMinutes(recipe.time);
        const matchesSearch =
          !normalizedQuery
          || recipe.title.toLocaleLowerCase('sv').includes(normalizedQuery);
        const matchesTag =
          activeTags.length === 0
          || activeTags.some((tag) => (recipe.tags ?? []).includes(tag));
        const matchesDifficulty =
          activeDifficulties.length === 0
          || activeDifficulties.includes(recipeDifficulty);
        const matchesTime =
          activeTimes.length === 0
          || activeTimes.some((timeFilter) =>
            (timeFilter === 'Snabb' && timeInMinutes !== null && timeInMinutes <= 30)
            || (timeFilter === 'Medel'
              && timeInMinutes !== null
              && timeInMinutes > 30
              && timeInMinutes <= 60)
            || (timeFilter === 'Lång' && timeInMinutes !== null && timeInMinutes > 60)
          );

        return matchesSearch && matchesTag && matchesDifficulty && matchesTime;
      })
      .sort((firstRecipe, secondRecipe) => {
        if (sortBy === 'title') {
          return firstRecipe.title.localeCompare(secondRecipe.title, 'sv');
        }
        if (sortBy === 'time') {
          return (
            (getRecipeTimeInMinutes(firstRecipe.time) ?? Number.POSITIVE_INFINITY)
            - (getRecipeTimeInMinutes(secondRecipe.time) ?? Number.POSITIVE_INFINITY)
          );
        }
        return (
          new Date(secondRecipe.createdAt).getTime()
          - new Date(firstRecipe.createdAt).getTime()
        );
      });
  }, [recipes, searchQuery, activeTags, activeDifficulties, activeTimes, sortBy]);

  const hasActiveFilters =
    searchQuery.trim().length > 0
    || activeTags.length > 0
    || activeDifficulties.length > 0
    || activeTimes.length > 0;

  const toggleArrayValue = <T,>(values: T[], value: T): T[] =>
    values.includes(value)
      ? values.filter((currentValue) => currentValue !== value)
      : [...values, value];

  const clearFilters = () => {
    setSearchQuery('');
    setActiveTags([]);
    setActiveDifficulties([]);
    setActiveTimes([]);
  };

  if (recipes.length === 0) {
    return (
      <div className="profile-empty">
        <p>Du har inga favoriter än.</p>
      </div>
    );
  }

  return (
    <div>
      <section
        ref={filterSectionRef}
        className="favorite-filter-section"
        aria-label="Filtrera favoritrecept"
      >
        <div className="favorite-controls-row">
          <div className="favorite-search">
            <span className="favorite-search-icon" aria-hidden="true">
              <Search size={17} />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Sök favoriter..."
              aria-label="Sök bland favoritrecept"
            />
          </div>

          <label className="favorite-sort">
            <span className="favorite-sort-icon" aria-hidden="true">
              <ArrowUpDown size={15} />
            </span>
            <span className="favorite-sort-text">
              <span>Sortera</span>
              <strong>
                {sortBy === 'newest'
                  ? 'Nyast först'
                  : sortBy === 'title'
                    ? 'Namn A-Ö'
                    : 'Kortast tid'}
              </strong>
            </span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as FavoriteSort)}
              aria-label="Sortera favoritrecept"
            >
              <option value="newest">Nyast först</option>
              <option value="title">Namn A-Ö</option>
              <option value="time">Kortast tid</option>
            </select>
          </label>

          <div className="favorite-filter-group">
            <button
              type="button"
              className={`favorite-filter-trigger ${activeTags.length > 0 ? 'active' : ''}`}
              aria-expanded={openFilter === 'type'}
              onClick={() => setOpenFilter(openFilter === 'type' ? null : 'type')}
            >
              Typ av rätt
              <ChevronDown size={17} className={openFilter === 'type' ? 'open' : ''} />
            </button>
            {openFilter === 'type' && (
              <div className="favorite-filter-menu">
                <button
                  type="button"
                  className={activeTags.length === 0 ? 'selected' : ''}
                  onClick={() => setActiveTags([])}
                >
                  Alla typer
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={activeTags.includes(tag) ? 'selected' : ''}
                    onClick={() => setActiveTags((current) => toggleArrayValue(current, tag))}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="favorite-filter-group">
            <button
              type="button"
              className={`favorite-filter-trigger ${activeDifficulties.length > 0 ? 'active' : ''}`}
              aria-expanded={openFilter === 'difficulty'}
              onClick={() => setOpenFilter(openFilter === 'difficulty' ? null : 'difficulty')}
            >
              Svårighetsgrad
              <ChevronDown size={17} className={openFilter === 'difficulty' ? 'open' : ''} />
            </button>
            {openFilter === 'difficulty' && (
              <div className="favorite-filter-menu">
                {['Alla', 'Lätt', 'Medel', 'Svår', 'Ej angiven'].map((difficulty) => (
                  <button
                    key={difficulty}
                    type="button"
                    className={
                      difficulty === 'Alla'
                        ? activeDifficulties.length === 0 ? 'selected' : ''
                        : activeDifficulties.includes(difficulty) ? 'selected' : ''
                    }
                    onClick={() => setActiveDifficulties((current) =>
                      difficulty === 'Alla' ? [] : toggleArrayValue(current, difficulty)
                    )}
                  >
                    {difficulty === 'Alla' ? 'Alla nivåer' : difficulty}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="favorite-filter-group">
            <button
              type="button"
              className={`favorite-filter-trigger ${activeTimes.length > 0 ? 'active' : ''}`}
              aria-expanded={openFilter === 'time'}
              onClick={() => setOpenFilter(openFilter === 'time' ? null : 'time')}
            >
              Tid
              <ChevronDown size={17} className={openFilter === 'time' ? 'open' : ''} />
            </button>
            {openFilter === 'time' && (
              <div className="favorite-filter-menu">
                <button
                  type="button"
                  className={activeTimes.length === 0 ? 'selected' : ''}
                  onClick={() => setActiveTimes([])}
                >
                  Alla tider
                </button>
                {favoriteTimeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={activeTimes.includes(option.value) ? 'selected' : ''}
                    onClick={() => setActiveTimes((current) =>
                      toggleArrayValue(current, option.value)
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="favorite-filter-footer">
          <p aria-live="polite">
            {filteredRecipes.length} av {recipes.length} favoriter
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters}>
              Rensa filter
            </button>
          )}
        </div>
      </section>

      {filteredRecipes.length > 0 ? (
        <div className="profile-grid">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              isFavorite={favoriteIds.has(recipe._id)}
              onClick={() => onSelectRecipe(recipe)}
              onFavoriteChanged={onFavoriteChanged}
            />
          ))}
        </div>
      ) : (
        <div className="profile-empty">
          <p>Inga favoriter matchar dina filter.</p>
          <button type="button" className="favorite-clear-empty" onClick={clearFilters}>
            Rensa filter
          </button>
        </div>
      )}
    </div>
  );
};

type SettingsSectionProps = {
  onExportData: () => void;
  onDeleteAccount: () => void;
};

const SettingsSection = ({ onExportData, onDeleteAccount }: SettingsSectionProps) => (
  <div className="profile-settings">
    <div className="settings-card">
      <h3>Byt lösenord</h3>
      <form className="settings-form">
        <label>Nuvarande lösenord</label>
        <input type="password" placeholder="••••••••" />
        <label>Nytt lösenord</label>
        <input type="password" placeholder="••••••••" />
        <label>Bekräfta nytt lösenord</label>
        <input type="password" placeholder="••••••••" />
        <button type="submit" className="settings-btn">
          Spara lösenord
        </button>
      </form>
    </div>

    <div className="settings-card">
      <h3>Exportera din data</h3>
      <p>Ladda ned en kopia av ditt konto och dina recept i JSON-format enligt GDPR.</p>
      <button type="button" className="settings-btn" onClick={onExportData}>
        Exportera data
      </button>
    </div>

    <div className="settings-card settings-danger">
      <h3>Radera konto</h3>
      <p>Permanent borttagning av ditt konto och all relaterad data. Denna åtgärd kan inte ångras.</p>
      <button type="button" className="settings-btn settings-btn-danger" onClick={onDeleteAccount}>
        Radera mitt konto
      </button>
    </div>
  </div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('mina-recept');
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const authData = getAuthData();
  const user = authData?.user;
  const favoriteIds = new Set(favorites.map((recipe) => recipe._id));

  const fetchMyRecipes = async () => {
    if (!user?.id) {
      setMyRecipes([]);
      return;
    }

    try {
      const allRecipes = await getAllRecipes();
      setMyRecipes(filterRecipesByUser(allRecipes, user.id));
    } catch (err) {
      console.error(err);
    }
  };

  const refreshFavorites = async () => {
    if (!user?.id) {
      setFavorites([]);
      return;
    }

    try {
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const [allRecipes, favs] = await Promise.all([
          getAllRecipes(),
          getFavorites(),
        ]);
        setMyRecipes(filterRecipesByUser(allRecipes, user.id));
        setFavorites(favs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleForkRecipe = async (recipeId: string, forkedRecipe: Partial<Recipe>) => {
    try {
      await createRecipe({
        ...normalizeForkedRecipe(forkedRecipe),
        originalRef: recipeId,
      });
      await fetchMyRecipes();
      setSelected(null);
      alert('Receptet har kopierats till dina recept!');
    } catch (err) {
      console.error('Det gick inte att forka receptet:', err);
      alert('Kunde inte skapa receptet. Kontrollera konsolen för detaljer.');
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    await deleteRecipe(id);
    setMyRecipes((prev) => prev.filter((recipe) => recipe._id !== id));
    setSelected(null);
  };

  const handleExportData = async () => {
    try {
      await exportMyData();
    } catch (err) {
      console.error('Kunde inte exportera data:', err);
      alert('Kunde inte exportera data. Försök igen senare.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Är du helt säker? Ditt konto och all din data raderas permanent. Denna åtgärd kan inte ångras.'
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMyAccount();
      clearAuthData();
      navigate('/');
    } catch (err) {
      console.error('Kunde inte radera kontot:', err);
      alert('Kunde inte radera kontot. Försök igen senare.');
      setIsDeleting(false);
    }
  };

  const renderActiveTab = () => {
    if (loading) {
      return <p className="profile-loading">Laddar...</p>;
    }

    if (activeTab === 'mina-recept') {
      return (
        <MyRecipesSection
          recipes={myRecipes}
          favoriteIds={favoriteIds}
          onAddRecipe={() => setShowAddForm(true)}
          onSelectRecipe={setSelected}
          onFavoriteChanged={refreshFavorites}
        />
      );
    }

    if (activeTab === 'favoriter') {
      return (
        <FavoritesSection
          recipes={favorites}
          favoriteIds={favoriteIds}
          onSelectRecipe={setSelected}
          onFavoriteChanged={refreshFavorites}
        />
      );
    }

    return (
      <SettingsSection
        onExportData={handleExportData}
        onDeleteAccount={handleDeleteAccount}
      />
    );
  };

  if (!user) {
    return (
      <div className="profile-page">
        <p className="profile-not-logged-in">Du måste logga in för att se din profil.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{user.username.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p>{user.email}</p>
          <div className="profile-stats">
            <span><strong>{myRecipes.length}</strong> recept</span>
            <span><strong>{favorites.length}</strong> favoriter</span>
          </div>
        </div>
      </div>

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="profile-content">{renderActiveTab()}</div>

      {selected && (
        <RecipeModal
          recipe={selected}
          onClose={() => setSelected(null)}
          onFork={handleForkRecipe}
          onDelete={handleDeleteRecipe}
          onOpenRecipe={(recipe) => setSelected(recipe)}
          onEdit={(recipe) => {
            setRecipeToEdit(recipe);
            setSelected(null);
            setShowAddForm(true);
          }}
        />
      )}

      {showAddForm && (
        <AddRecipeForm
          onClose={() => {
            setShowAddForm(false);
            setRecipeToEdit(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setRecipeToEdit(null);
            void fetchMyRecipes();
          }}
          recipeToEdit={recipeToEdit || undefined}
        />
      )}
    </div>
  );
};

export default ProfilePage;
