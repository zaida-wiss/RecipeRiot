import { useState, useEffect } from 'react';
import { ChefHat, Plus, UtensilsCrossed, ShoppingCart, ChevronDown, ArrowLeft } from 'lucide-react';
import { getFavorites } from '../../api/favoritesApi';
import { getAllRecipes } from '../../api/recipesApi';
import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../../types';
import './WeeklyPlanner.css';

const WeeklyPlanner = () => {
  const days = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
  const navigate = useNavigate();

  const [activeDay, setActiveDay] = useState<string | null>(null);

  // Läser sparade måltider från localStorage vid start
  const [selectedMeals, setSelectedMeals] = useState<Record<string, Recipe>>(() => {
    const saved = localStorage.getItem('plannedMeals');
    try {
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);

  // Spara måltider till localStorage när de ändras
  useEffect(() => {
    localStorage.setItem('plannedMeals', JSON.stringify(selectedMeals));
  }, [selectedMeals]);

  useEffect(() => {
    const fetchPlannerRecipes = async () => {
      setLoading(true);
      try {
        const allRecipes = await getAllRecipes();
        const unique = [...new Map(allRecipes.map(r => [r._id, r])).values()];
        setMyRecipes(unique);
        try { await getFavorites(); } catch { /* ignorera */ }
      } catch (err) {
        console.error("Kunde inte hämta recept:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlannerRecipes();
  }, []);

  const toggleDay = (day: string) => {
    setActiveDay(prev => prev === day ? null : day);
  };

  const selectRecipe = (recipe: Recipe) => {
    if (activeDay) {
      setSelectedMeals(prev => ({ ...prev, [activeDay]: recipe }));
      setActiveDay(null);
    }
  };

  const removeDay = (day: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedMeals(prev => {
      const updated = { ...prev };
      delete updated[day];
      return updated;
    });
  };

  const handleSendToShoppingList = () => {
    localStorage.setItem('plannedMeals', JSON.stringify(selectedMeals));
    setSent(true);
    setTimeout(() => navigate('/inkopslista'), 800);
  };

  const plannedCount = Object.keys(selectedMeals).length;

  const RecipeList = () => (
    <>
      {loading ? (
        <p className="dropdown-loading">Laddar recept...</p>
      ) : myRecipes.length === 0 ? (
        <p className="no-recipes-alert">Inga recept hittades.</p>
      ) : (
        myRecipes.map((r) => (
          <div key={r._id} className="recipe-item" onClick={() => selectRecipe(r)}>
            {r.imageUrl && (
              <img src={r.imageUrl} alt={r.title} className="recipe-item-img" />
            )}
            <span>{r.title}</span>
          </div>
        ))
      )}
    </>
  );

  return (
    <div className="planner-page-wrapper">
      <div className="planner-container">
        <header className="planner-header">
          <h1>Veckoplanering</h1>
          <p>Planera veckans måltider och skicka ingredienserna till inköpslistan</p>
        </header>

        {/* ── MOBIL: Accordion ── */}
        <div className="planner-mobile">
          <div className="days-list">
            {days.map((day) => (
              <div key={day} className={`day-accordion ${activeDay === day ? 'accordion-open' : ''}`}>
                <div className="day-row" onClick={() => toggleDay(day)}>
                  <div className="day-label">{day}</div>
                  <div className="day-meal-preview">
                    {selectedMeals[day] ? (
                      <div className="selected-meal-text">
                        {selectedMeals[day].imageUrl && (
                          <img
                            src={selectedMeals[day].imageUrl}
                            alt={selectedMeals[day].title}
                            className="selected-meal-img"
                          />
                        )}
                        <UtensilsCrossed size={15} />
                        <span>{selectedMeals[day].title}</span>
                      </div>
                    ) : (
                      <div className="btn-content">
                        <Plus size={16} />
                        <span>Lägg till måltid</span>
                      </div>
                    )}
                  </div>
                  <div className="day-actions">
                    {selectedMeals[day] && (
                      <button
                        className="remove-meal-btn"
                        onClick={(e) => removeDay(day, e)}
                        aria-label={`Ta bort ${day}`}
                      >
                        ×
                      </button>
                    )}
                    <ChevronDown
                      size={18}
                      className={`chevron ${activeDay === day ? 'chevron-up' : ''}`}
                    />
                  </div>
                </div>

                {activeDay === day && (
                  <div className="day-dropdown">
                    <div className="dropdown-recipe-list">
                      <RecipeList />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {plannedCount > 0 && (
            <div className="planner-footer">
              <p className="summary-text">{plannedCount} av 7 dagar planerade</p>
              <button
                className="send-to-shopping-btn"
                onClick={handleSendToShoppingList}
                disabled={sent}
              >
                <ShoppingCart size={18} />
                {sent ? 'Skickat! ✓' : 'Skicka till inköpslistan'}
              </button>
            </div>
          )}

          {!plannedCount && (
            <div className="planner-empty-hint">
              <ChefHat size={40} strokeWidth={1.5} />
              <p>Klicka på en dag för att lägga till ett recept</p>
            </div>
          )}
        </div>

        {/* ── DESKTOP: Sidebar-layout ── */}
        <div className="planner-desktop">
          <div className="planner-content">
            <div className="days-list">
              {days.map((day) => (
                <div
                  key={day}
                  className={`day-row ${activeDay === day ? 'active-row' : ''}`}
                >
                  <div className="day-label">{day}</div>
                  <button className="add-meal-btn" onClick={() => toggleDay(day)}>
                    {selectedMeals[day] ? (
                      <div className="selected-meal-text">
                        {selectedMeals[day].imageUrl && (
                          <img
                            src={selectedMeals[day].imageUrl}
                            alt={selectedMeals[day].title}
                            className="selected-meal-img"
                          />
                        )}
                        <UtensilsCrossed size={18} />
                        <span>{selectedMeals[day].title}</span>
                      </div>
                    ) : (
                      <div className="btn-content">
                        <Plus size={18} />
                        <span>
                          {activeDay === day ? 'Välj recept...' : 'Lägg till måltid'}
                        </span>
                      </div>
                    )}
                  </button>
                  {selectedMeals[day] && (
                    <button
                      className="remove-meal-btn"
                      onClick={(e) => removeDay(day, e)}
                      aria-label={`Ta bort ${day}`}
                    >
                      ×
                    </button>
                  )}
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
                    <h3>Välj recept för {activeDay}</h3>
                    <div className="recipe-list">
                      <RecipeList />
                    </div>
                  </div>
                ) : (
                  <div className="default-info">
                    <ChefHat size={48} strokeWidth={1.5} />
                    <p>Klicka på en dag för att lägga till ett recept.</p>
                    {plannedCount > 0 && (
                      <div className="planner-summary">
                        <p className="summary-text">
                          {plannedCount} av 7 dagar planerade
                        </p>
                        <button
                          className="send-to-shopping-btn"
                          onClick={handleSendToShoppingList}
                          disabled={sent}
                        >
                          <ShoppingCart size={18} />
                          {sent ? 'Skickat! ✓' : 'Skicka till inköpslistan'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WeeklyPlanner;