import React, { useState, useMemo } from 'react';
import { recipes } from '../data/mockRecipes';
import { Search, Clock, Tag } from 'lucide-react';
import './ExplorePage.css';

const ExplorePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('Alla');
  const [activeDifficulty, setActiveDifficulty] = useState('Alla');

  // 1. Skapa unika kategorier/taggar dynamiskt från din mockdata
  const allTags = useMemo(() => {
    const tags = recipes.flatMap((r) => r.tags);
    // Skapar en unik lista och lägger till "Alla" först
    return ['Alla', ...Array.from(new Set(tags))];
  }, []);

  const difficulties = ['Alla', 'Lätt', 'Medel', 'Svår'];

  // 2. Filtreringslogik som körs varje gång state ändras
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTag = 
      activeTag === 'Alla' || recipe.tags.includes(activeTag);
    const matchesDiff = 
      activeDifficulty === 'Alla' || recipe.difficulty === activeDifficulty;
    
    return matchesSearch && matchesTag && matchesDiff;
  });

  return (
    <div className="explore-page-wrapper">
      <div className="explore-container">
        
        {/* Header - Matchar din WeeklyPlanner stil */}
        <header className="explore-header">
          <h1>Utforska recept</h1>
          <p>Hitta inspiration bland hundratals recept från vår gemenskap</p>
        </header>

        {/* Sökfält */}
        <div className="search-wrapper">
          <Search className="search-icon-svg" size={20} color="#817878" />
          <input
            type="text"
            placeholder="Sök på recepttitel..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter-sektion */}
        <div className="filter-section">
          {/* Kategorier/Taggar */}
          <div className="filter-group">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`filter-btn ${activeTag === tag ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Svårighetsgrad */}
          <div className="filter-group">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setActiveDifficulty(diff)}
                className={`filter-btn ${activeDifficulty === diff ? 'active' : ''}`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Recept-grid */}
        <div className="recipe-grid">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <article key={recipe.id} className="recipe-card">
                <div className="image-container">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="recipe-image" 
                  />
                </div>
                
                <div className="recipe-content">
                  <div className="recipe-meta">
                    <span className="difficulty-badge">{recipe.difficulty}</span>
                    <span className="time-info">
                      <Clock size={14} /> {recipe.time}
                    </span>
                  </div>
                  
                  <h2 className="recipe-title">{recipe.title}</h2>
                  
                  <div className="recipe-tags">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="tag">
                        <Tag size={10} style={{ marginRight: '4px' }} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="no-results">
              <p>Inga recept matchar din sökning. Prova något annat!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;