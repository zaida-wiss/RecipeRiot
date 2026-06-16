import { useState, useEffect, useMemo, useRef } from 'react';
import type { Recipe } from '../types';

export type TimeFilter = 'Snabb' | 'Medel' | 'Lång';
export type FavoriteSort = 'newest' | 'title' | 'time';
export type OpenFilter = 'type' | 'difficulty' | 'time' | null;

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

export const useFavoriteFilter = (recipes: Recipe[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeDifficulties, setActiveDifficulties] = useState<string[]>([]);
  const [activeTimes, setActiveTimes] = useState<TimeFilter[]>([]);
  const [sortBy, setSortBy] = useState<FavoriteSort>('newest');
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null);
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

  return {
    searchQuery,
    setSearchQuery,
    activeTags,
    setActiveTags,
    activeDifficulties,
    setActiveDifficulties,
    activeTimes,
    setActiveTimes,
    sortBy,
    setSortBy,
    openFilter,
    setOpenFilter,
    filterSectionRef,
    allTags,
    filteredRecipes,
    hasActiveFilters,
    toggleArrayValue,
    clearFilters,
  };
};
