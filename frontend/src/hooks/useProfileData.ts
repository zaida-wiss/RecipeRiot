import { useState, useEffect } from 'react';
import { getAllRecipes, } from '../api/recipesApi';
import { getFavorites } from '../api/favoritesApi';
import type { Recipe } from '../types';

const filterRecipesByUser = (recipes: Recipe[], userId?: string) =>
  recipes.filter((recipe) => String(recipe.createdBy) === String(userId));

export const useProfileData = (userId?: string) => {
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyRecipes = async () => {
    if (!userId) {
      setMyRecipes([]);
      return;
    }

    try {
      const allRecipes = await getAllRecipes();
      setMyRecipes(filterRecipesByUser(allRecipes, userId));
    } catch (err) {
      console.error(err);
    }
  };

  const refreshFavorites = async () => {
    if (!userId) {
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
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const [allRecipes, favs] = await Promise.all([
          getAllRecipes(),
          getFavorites(),
        ]);
        setMyRecipes(filterRecipesByUser(allRecipes, userId));
        setFavorites(favs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  const removeRecipeFromMyRecipes = (id: string) => {
    setMyRecipes((prev) => prev.filter((recipe) => recipe._id !== id));
  };

  return {
    myRecipes,
    favorites,
    loading,
    fetchMyRecipes,
    refreshFavorites,
    removeRecipeFromMyRecipes,
  };
};
