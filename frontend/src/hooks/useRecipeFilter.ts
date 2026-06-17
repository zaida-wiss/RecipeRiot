import { useState, useEffect, useMemo, useRef } from 'react';
import type { Recipe } from '../types';

export type TimeFilter = 'Alla' | 'Snabb' | 'Medel' | 'Lång';
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

export const useRecipeFilter = (recipes: Recipe[], searchQuery: string = '') => {
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeDifficulties, setActiveDifficulties] = useState<string[]>([]);
  const [activeTimes, setActiveTimes] = useState<TimeFilter[]>([]);
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

  const allTags = useMemo(() => {
    const tags = recipes.flatMap((r) => r.tags ?? []);
    return ['Alla', ...Array.from(new Set(tags))];
  }, [recipes]);

  const difficulties = ['Alla', 'Lätt', 'Medel', 'Svår', 'Ej angiven'];

  const timeOptions: Array<{ value: TimeFilter; label: string }> = [
    { value: 'Alla', label: 'Alla tider' },
    { value: 'Snabb', label: 'Högst 30 min' },
    { value: 'Medel', label: '31-60 min' },
    { value: 'Lång', label: 'Mer än 60 min' },
  ];

  const filteredRecipes = useMemo(() => recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
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
  }), [recipes, searchQuery, activeTags, activeDifficulties, activeTimes]);

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

  return {
    activeTags,
    setActiveTags,
    activeDifficulties,
    setActiveDifficulties,
    activeTimes,
    setActiveTimes,
    openFilter,
    setOpenFilter,
    filterSectionRef,
    allTags,
    difficulties,
    timeOptions,
    filteredRecipes,
    hasActiveFilters,
    clearFilters,
    toggleFilter,
    toggleArrayValue,
  };
};
