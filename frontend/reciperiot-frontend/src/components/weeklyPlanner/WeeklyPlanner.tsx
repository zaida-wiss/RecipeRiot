import './WeeklyPlanner.css';
import { ChefHat } from 'lucide-react';

const WeeklyPlanner = () => {
  const days = [
    'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 
    'Fredag', 'Lördag', 'Söndag'
  ];

  return (
    <div className="planner-page-wrapper">
      <div className="planner-container">
        <header className="planner-header">
          <h1>Veckoplanering</h1>
          <p>Planera veckans måltider och generera inköpslista automatiskt</p>
        </header>

        <div className="planner-content">
          {/* Vänster: Listan med dagar */}
          <div className="days-list">
            {days.map((day) => (
              <div key={day} className="day-row">
                <div className="day-label">{day}</div>
                <button className="add-meal-btn">
                  <span className="plus-icon">+</span> Lägg till måltid
                </button>
              </div>
            ))}
          </div>

          {/* Höger: Inköpslista info */}
          <aside className="info-sidebar">
            <div className="info-card">
            <div className="chef-hat-icon">
                {/* Här byter vi ut emojin mot Lucide-komponenten */}
                <ChefHat size={48} strokeWidth={1.5} color="#9f9e9c" />
                </div>
              <p>Välj recept för varje dag så genereras din inköpslista automatiskt</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer längst ner */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-logo">🍳 RecipeRiot</span>
            <span className="footer-copyright">
              © 2026 RecipeRiot. Recept förtjänar att leva vidare.
            </span>
          </div>
          
          <div className="footer-links">
            <a href="/om-oss">Om oss</a>
            <a href="/integritet">Integritet</a>
            <a href="/kontakt">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WeeklyPlanner;