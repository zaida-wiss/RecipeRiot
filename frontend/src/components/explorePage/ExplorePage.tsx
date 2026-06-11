import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import RecipeModal from '../recipeModal/RecipeModal';
import RecipeCard from '../recipeCard/RecipeCard';
import type { Recipe } from '../../types';
import { getAllRecipes, deleteRecipe, createRecipe } from '../../api/recipesApi';
import './ExplorePage.css';

type TimeFilter = 'Alla' | 'Snabb' | 'Medel' | 'Lång';
type OpenFilter = 'type' | 'difficulty' | 'time' | null;

const timeOptions: { value: TimeFilter; label: string }[] = [
  { value: 'Alla', label: 'Alla tider' },
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

const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeDifficulties, setActiveDifficulties] = useState<string[]>([]);
  const [activeTimes, setActiveTimes] = useState<TimeFilter[]>([]);
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const filterSectionRef = useRef<HTMLElement>(null);

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

  const allTags = useMemo(() => {
    const tags = recipes.flatMap((r) => r.tags ?? []);
    return ['Alla', ...Array.from(new Set(tags))];
  }, [recipes]);

  const difficulties = ['Alla', 'Lätt', 'Medel', 'Svår', 'Ej angiven'];

  const filteredRecipes = useMemo(() => recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(urlQuery.toLowerCase());
    const matchesTag =
      activeTags.length === 0
      || activeTags.some((tag) => (recipe.tags ?? []).includes(tag));
    const recipeDifficulty = recipe.difficulty?.trim() || 'Ej angiven';
    const matchesDiff =
      activeDifficulties.length === 0 || activeDifficulties.includes(recipeDifficulty);
    const timeInMinutes = getRecipeTimeInMinutes(recipe.time);
    const matchesTime =
      activeTimes.length === 0
      || activeTimes.some((timeFilter) =>
        (timeFilter === 'Snabb' && timeInMinutes !== null && timeInMinutes <= 30)
        || (timeFilter === 'Medel' && timeInMinutes !== null && timeInMinutes > 30 && timeInMinutes <= 60)
        || (timeFilter === 'Lång' && timeInMinutes !== null && timeInMinutes > 60)
      );

    return matchesSearch && matchesTag && matchesDiff && matchesTime;
  }), [recipes, urlQuery, activeTags, activeDifficulties, activeTimes]);

  const hasActiveFilters =
    activeTags.length > 0 || activeDifficulties.length > 0 || activeTimes.length > 0;

  const clearFilters = () => {
    setActiveTags([]);
    setActiveDifficulties([]);
    setActiveTimes([]);
  };

  const toggleFilter = (filter: Exclude<OpenFilter, null>) => {
    setOpenFilter((currentFilter) => currentFilter === filter ? null : filter);
  };

  const toggleArrayValue = <T,>(values: T[], value: T): T[] =>
    values.includes(value)
      ? values.filter((currentValue) => currentValue !== value)
      : [...values, value];

  const handleFork = async (_recipeId: string, forkedRecipe: Partial<Recipe>) => {
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
        originalRef: _recipeId,
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
            value={urlQuery}
            onChange={(e) => {
              const nextParams = new URLSearchParams(searchParams);
              const nextQuery = e.target.value;

              if (nextQuery) {
                nextParams.set('q', nextQuery);
              } else {
                nextParams.delete('q');
              }

              setSearchParams(nextParams, { replace: true });
            }}
          />
        </div>

        <section
          ref={filterSectionRef}
          className="filter-section"
          aria-label="Filtrera recept"
        >
          <div className="filter-grid">
            <div className="filter-group">
              <button
                type="button"
                className={`filter-trigger ${activeTags.length > 0 ? 'filter-trigger--active' : ''}`}
                aria-expanded={openFilter === 'type'}
                onClick={() => toggleFilter('type')}
              >
                <span>Typ av rätt</span>
                <ChevronDown size={17} className={openFilter === 'type' ? 'chevron-open' : ''} />
              </button>
              {openFilter === 'type' && (
                <div className="filter-menu">
                {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={
                        tag === 'Alla'
                          ? activeTags.length === 0 ? 'selected' : ''
                          : activeTags.includes(tag) ? 'selected' : ''
                      }
                      onClick={() => {
                        setActiveTags((currentTags) =>
                          tag === 'Alla' ? [] : toggleArrayValue(currentTags, tag)
                        );
                      }}
                    >
                      {tag === 'Alla' ? 'Alla typer' : tag}
                    </button>
                ))}
                </div>
              )}
            </div>

            <div className="filter-group">
              <button
                type="button"
                className={`filter-trigger ${activeDifficulties.length > 0 ? 'filter-trigger--active' : ''}`}
                aria-expanded={openFilter === 'difficulty'}
                onClick={() => toggleFilter('difficulty')}
              >
                <span>Svårighetsgrad</span>
                <ChevronDown
                  size={17}
                  className={openFilter === 'difficulty' ? 'chevron-open' : ''}
                />
              </button>
              {openFilter === 'difficulty' && (
                <div className="filter-menu">
                {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      type="button"
                      className={
                        difficulty === 'Alla'
                          ? activeDifficulties.length === 0 ? 'selected' : ''
                          : activeDifficulties.includes(difficulty) ? 'selected' : ''
                      }
                      onClick={() => {
                        setActiveDifficulties((currentDifficulties) =>
                          difficulty === 'Alla'
                            ? []
                            : toggleArrayValue(currentDifficulties, difficulty)
                        );
                      }}
                    >
                      {difficulty === 'Alla' ? 'Alla nivåer' : difficulty}
                    </button>
                ))}
                </div>
              )}
            </div>

            <div className="filter-group">
              <button
                type="button"
                className={`filter-trigger ${activeTimes.length > 0 ? 'filter-trigger--active' : ''}`}
                aria-expanded={openFilter === 'time'}
                onClick={() => toggleFilter('time')}
              >
                <span>Tid</span>
                <ChevronDown size={17} className={openFilter === 'time' ? 'chevron-open' : ''} />
              </button>
              {openFilter === 'time' && (
                <div className="filter-menu">
                  {timeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={
                        option.value === 'Alla'
                          ? activeTimes.length === 0 ? 'selected' : ''
                          : activeTimes.includes(option.value) ? 'selected' : ''
                      }
                      onClick={() => {
                        setActiveTimes((currentTimes) =>
                          option.value === 'Alla'
                            ? []
                            : toggleArrayValue(currentTimes, option.value)
                        );
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="active-filters" aria-label="Aktiva filter">
              {activeTags.map((tag) => (
                <button
                  key={`tag-${tag}`}
                  type="button"
                  className="active-filter-chip"
                  onClick={() => setActiveTags((currentTags) => toggleArrayValue(currentTags, tag))}
                  aria-label={`Ta bort filtret ${tag}`}
                >
                  {tag}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
              {activeDifficulties.map((difficulty) => (
                <button
                  key={`difficulty-${difficulty}`}
                  type="button"
                  className="active-filter-chip"
                  onClick={() => setActiveDifficulties((currentDifficulties) =>
                    toggleArrayValue(currentDifficulties, difficulty)
                  )}
                  aria-label={`Ta bort filtret ${difficulty}`}
                >
                  {difficulty}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
              {activeTimes.map((time) => {
                const label = timeOptions.find((option) => option.value === time)?.label ?? time;

                return (
                  <button
                    key={`time-${time}`}
                    type="button"
                    className="active-filter-chip"
                    onClick={() => setActiveTimes((currentTimes) =>
                      toggleArrayValue(currentTimes, time)
                    )}
                    aria-label={`Ta bort filtret ${label}`}
                  >
                    {label}
                    <span aria-hidden="true">×</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="filter-footer">
            <p className="filter-result-count" aria-live="polite">
              {filteredRecipes.length} recept hittades
            </p>
            {hasActiveFilters && (
              <button className="clear-filters-btn" type="button" onClick={clearFilters}>
                Rensa filter
              </button>
            )}
          </div>
        </section>

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
          onOpenRecipe={(recipe) => setSelectedRecipe(recipe)}
        />
      )}
    </div>
  );
};

export default ExplorePage;
