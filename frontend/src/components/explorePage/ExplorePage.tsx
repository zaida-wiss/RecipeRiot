import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import RecipeModal from '../recipeModal/RecipeModal';
import RecipeFilterBar from '../recipeFilterBar/RecipeFilterBar';
import RecipeCard from '../recipeCard/RecipeCard';
import { useRecipeFilter } from '../../hooks/useRecipeFilter';
import type { Recipe } from '../../types';
import { getAllRecipes, deleteRecipe, createRecipe } from '../../api/recipesApi';
import { getFavorites } from '../../api/favoritesApi';
import { getAuthData } from '../../api/authApi';
import './ExplorePage.css';

const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const isLoggedIn = getAuthData() !== null;

  const filterHook = useRecipeFilter(recipes, urlQuery);
  const { filteredRecipes } = filterHook;

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [recipeData, favoriteData] = await Promise.all([
          getAllRecipes(),
          isLoggedIn ? getFavorites() : Promise.resolve([]),
        ]);
        setRecipes(recipeData);
        setFavorites(favoriteData);
      } catch (err) {
        console.error('Kunde inte hämta recept eller favoriter', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [isLoggedIn]);

  const refreshFavorites = async () => {
    if (!isLoggedIn) {
      setFavorites([]);
      return;
    }

    try {
      setFavorites(await getFavorites());
    } catch (err) {
      console.error('Kunde inte uppdatera favoriter', err);
    }
  };

  const favoriteIds = new Set(favorites.map((recipe) => recipe._id));

  const cleanIngredients = (ingredients: Partial<Recipe>['ingredients']) => {
    return (ingredients || []).map(ing => ({
      ...ing,
      quantity: typeof ing.quantity === 'string' ? parseFloat(ing.quantity) : Number(ing.quantity)
    }));
  };

  const buildRecipeToSave = (forkedRecipe: Partial<Recipe>, recipeId: string) => {
    return {
      title: forkedRecipe.title || "Nytt recept",
      ingredients: cleanIngredients(forkedRecipe.ingredients),
      steps: forkedRecipe.steps || [],
      ...(forkedRecipe.imageUrl?.trim() && { imageUrl: forkedRecipe.imageUrl.trim() }),
      tags: forkedRecipe.tags || [],
      difficulty: forkedRecipe.difficulty || "Medel",
      ...(forkedRecipe.time?.trim() && { time: forkedRecipe.time.trim() }),
      originalRef: recipeId,
    };
  };

  const handleFork = async (_recipeId: string, forkedRecipe: Partial<Recipe>) => {
    try {
      const recipeToSave = buildRecipeToSave(forkedRecipe, _recipeId);
      await createRecipe(recipeToSave);
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

        <RecipeFilterBar {...filterHook} />

        <div className="recipe-grid">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                isFavorite={favoriteIds.has(recipe._id)}
                onFavoriteChanged={refreshFavorites}
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
