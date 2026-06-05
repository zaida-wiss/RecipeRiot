import { useState, useEffect } from 'react';
import { ChefHat, Plus, UtensilsCrossed, ArrowLeft } from 'lucide-react';
import { getFavorites } from '../../api/favoritesApi';
import { getAllRecipes } from '../../api/recipesApi';
import type { Recipe } from '../../types';
import './WeeklyPlanner.css';

// Interface för att hantera olika möjliga svar från backend
interface Favorite {
  recipeId?: string;
  _id?: string;
  id?: string;
  title?: string;
}

const WeeklyPlanner = () => {
  const days = [
    'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 
    'Fredag', 'Lördag', 'Söndag'
  ];

  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<Record<string, Recipe>>({});
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Synka planerade måltider till localStorage
  useEffect(() => {
    localStorage.setItem('plannedMeals', JSON.stringify(selectedMeals));
  }, [selectedMeals]);

  // Hämta recept och favoriter
  useEffect(() => {
    const fetchPlannerRecipes = async () => {
      setLoading(true);
      try {
        const [allRecipes, favorites] = await Promise.all([
          getAllRecipes(),
          getFavorites()
        ]);

        // Om favorites returnerar hela objekt
        if (favorites.length > 0 && typeof favorites[0] === 'object' && 'title' in favorites[0]) {
          setMyRecipes(favorites as unknown as Recipe[]);
        } else {
          // Om favorites returnerar ID-lista, filtrera allRecipes
          const favIds = favorites.map((f: Favorite) => 
            f.recipeId || f._id || ''
);
          
          const filtered = allRecipes.filter((r) => 
            favIds.includes(r._id)
          );
          setMyRecipes(filtered.length > 0 ? filtered : allRecipes);
        }
      } catch (err) {
        console.error("Kunde inte hämta recept:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlannerRecipes();
  }, []);

  const selectRecipe = (recipe: Recipe) => {
    if (activeDay) {
      setSelectedMeals((prev) => ({ ...prev, [activeDay]: recipe }));
      setActiveDay(null);
    }
  };

  return (
    <div className="planner-page-wrapper">
      <div className="planner-container">
        <header className="planner-header">
          <h1>Veckoplanering</h1>
        </header>

        <div className="planner-content">
          <div className="days-list">
            {days.map((day) => (
              <div key={day} className={`day-row ${activeDay === day ? 'active-row' : ''}`}>
                <div className="day-label">{day}</div>
                <button className="add-meal-btn" onClick={() => setActiveDay(day)}>
                  {selectedMeals[day] ? (
                    <div className="selected-meal-text">
                      <UtensilsCrossed size={18} /> 
                      <span>{selectedMeals[day].title}</span>
                    </div>
                  ) : (
                    <div className="btn-content">
                      <Plus size={18} /> <span>{activeDay === day ? 'Välj recept...' : 'Lägg till måltid'}</span>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>

          <aside className="info-sidebar">
            <div className="info-card">
              {activeDay ? (
                <div className="recipe-selector">
                  <button className="back-btn" onClick={() => setActiveDay(null)}>
                    <ArrowLeft size={16} /> Tillbaka
                  </button>
                  <h3>Mina recept & favoriter</h3>
                  <div className="recipe-list">
                    {loading ? <p>Laddar...</p> : myRecipes.map((r) => (
                      <div key={r._id} className="recipe-item" onClick={() => selectRecipe(r)}>
                        {r.title}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="default-info">
                  <ChefHat size={48} />
                  <p>Klicka på en dag för att lägga till ett recept.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanner;