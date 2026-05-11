import { useState } from 'react';
import { ChefHat, Plus, UtensilsCrossed, ArrowLeft, } from 'lucide-react';
import './WeeklyPlanner.css';

const WeeklyPlanner = () => {
  const days = [
    'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 
    'Fredag', 'Lördag', 'Söndag'
  ];

  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<Record<string, string>>({});

  const savedRecipes = [
    { id: 1, title: "Krämig Pasta med Basilika" },
    { id: 2, title: "Hemgjorda Tacos" },
    { id: 3, title: "Linssoppa med Citron" },
    { id: 4, title: "Smashed Burgers" }
  ];

  const selectRecipe = (recipeTitle: string) => {
    if (activeDay) {
      setSelectedMeals((prev) => ({ ...prev, [activeDay]: recipeTitle }));
      setActiveDay(null);
    }
  };

  return (
    <div className="planner-page-wrapper">
      <div className="planner-container">
        <header className="planner-header">
          <h1>Veckoplanering</h1>
          <p>Planera veckans måltider och generera inköpslista automatiskt</p>
        </header>

        <div className="planner-content">
          <div className="days-list">
            {days.map((day) => (
              <div 
                key={day} 
                className={`day-row ${activeDay === day ? 'active-row' : ''}`}
              >
                <div className="day-label">{day}</div>
                <button 
                  className="add-meal-btn" 
                  onClick={() => setActiveDay(day)}
                >
                  {selectedMeals[day] ? (
                    <div className="selected-meal-text">
                      <UtensilsCrossed size={18} /> 
                      <span>{selectedMeals[day]}</span>
                    </div>
                  ) : (
                    <div className="btn-content">
                      <Plus size={18} /> 
                      <span>
                        {activeDay === day 
                          ? 'Välj recept i menyn till höger...' 
                          : 'Lägg till måltid'}
                      </span>
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
                  <h3>Mina recept</h3>
                  <p className="selector-subtitle">Välj ett recept för {activeDay}:</p>
                  <div className="recipe-list">
                    {savedRecipes.map((recipe) => (
                      <div 
                        key={recipe.id} 
                        className="recipe-item"
                        onClick={() => selectRecipe(recipe.title)}
                      >
                        {recipe.title}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="default-info">
                  <div className="chef-hat-icon">
                    <ChefHat size={48} strokeWidth={1.5} />
                  </div>
                  <p>Välj recept för varje dag så genereras din inköpslista automatiskt</p>
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