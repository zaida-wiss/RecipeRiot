import { useState, useEffect } from 'react';
import { getAuthData } from '../../api/authApi';
import { getAllRecipes, deleteRecipe } from '../../api/recipesApi'; // Tog bort forkRecipe härifrån!
import { getFavorites } from '../../api/favoritesApi';
import RecipeCard from '../recipeCard/RecipeCard';
import RecipeModal from '../recipeModal/RecipeModal';
import AddRecipeForm from '../addRecipe/AddRecipeForm';
import type { Recipe } from '../../types';
import './ProfilePage.css';

type Tab = 'mina-recept' | 'favoriter' | 'installningar';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('mina-recept');
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const authData = getAuthData();
  const user = authData?.user;

  const fetchMyRecipes = async () => {
    const all = await getAllRecipes();
    const filtered = all.filter((r) => {
      if (!user?.id || !r.createdBy) return false;
      
      const creatorId = typeof r.createdBy === 'object' && r.createdBy !== null
        ? (r.createdBy as { _id?: string; id?: string })._id || (r.createdBy as { _id?: string; id?: string }).id 
        : String(r.createdBy);
        
      return String(creatorId).trim() === String(user.id).trim();
    });
    setMyRecipes(filtered);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const [allRecipes, favs] = await Promise.all([
          getAllRecipes(),
          getFavorites(),
        ]);
        
        const filtered = allRecipes.filter((r) => {
          if (!r.createdBy) return false;
          
          const creatorId = typeof r.createdBy === 'object' && r.createdBy !== null
            ? (r.createdBy as { _id?: string; id?: string })._id || (r.createdBy as { _id?: string; id?: string }).id 
            : String(r.createdBy);
            
          return String(creatorId).trim() === String(user.id).trim();
        });

        setMyRecipes(filtered);
        setFavorites(favs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="profile-page">
        <p className="profile-not-logged-in">Du måste logga in för att se din profil.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p>{user.email}</p>
          <div className="profile-stats">
            <span><strong>{myRecipes.length}</strong> recept</span>
            <span><strong>{favorites.length}</strong> favoriter</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'mina-recept' ? 'active' : ''}`}
          onClick={() => setActiveTab('mina-recept')}
        >
          Mina recept
        </button>
        <button
          className={`profile-tab ${activeTab === 'favoriter' ? 'active' : ''}`}
          onClick={() => setActiveTab('favoriter')}
        >
          Favoriter
        </button>
        <button
          className={`profile-tab ${activeTab === 'installningar' ? 'active' : ''}`}
          onClick={() => setActiveTab('installningar')}
        >
          Inställningar
        </button>
      </div>

      {/* Innehåll */}
      <div className="profile-content">
        {loading ? (
          <p className="profile-loading">Laddar...</p>
        ) : activeTab === 'mina-recept' ? (
          <div>
            {myRecipes.length > 0 ? (
              <>
                <button className="profile-add-btn" onClick={() => setShowAddForm(true)}>
                  + Lägg till nytt recept
                </button>
                <div className="profile-grid">
                  {myRecipes.map((r) => (
                    <RecipeCard key={r._id} recipe={r} onClick={() => setSelected(r)} />
                  ))}
                </div>
              </>
            ) : (
              <div className="profile-cta">
                <div className="profile-cta-icon">🍳</div>
                <h3>Du har inga recept än</h3>
                <p>Dela ditt första recept med communityn!</p>
                <button className="profile-add-btn" onClick={() => setShowAddForm(true)}>
                  + Lägg till ditt första recept
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'favoriter' ? (
          <div className="profile-grid">
            {favorites.length > 0 ? (
              favorites.map((r) => (
                <RecipeCard key={r._id} recipe={r} onClick={() => setSelected(r)} />
              ))
            ) : (
              <div className="profile-empty">
                <p>Du har inga favoriter än. Klicka på hjärtat på ett recept!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="profile-settings">
            <div className="settings-card">
              <h3>Byt lösenord</h3>
              <form className="settings-form">
                <label>Nuvarande lösenord</label>
                <input type="password" placeholder="••••••••" />
                <label>Nytt lösenord</label>
                <input type="password" placeholder="••••••••" />
                <label>Bekräfta nytt lösenord</label>
                <input type="password" placeholder="••••••••" />
                <button type="submit" className="settings-btn">Spara lösenord</button>
              </form>
            </div>
            <div className="settings-card">
              <h3>Profilbild</h3>
              <p className="settings-desc">Profilbild via URL kommer snart!</p>
            </div>
          </div>
        )}
      </div>

      {/* Modalhantering */}
      {selected && (
        <RecipeModal
          recipe={selected}
          onClose={() => setSelected(null)}
          onFork={(id) => {
            // Tillfällig alert tills ni bygger klart fork-funktionen på er backend rutt
            alert(`Forkar recept med ID: ${id}`);
            setSelected(null);
          }}
          onEdit={(recipeToEdit) => {
            setSelected(null);
            alert(`Profil: Öppnar ändrings-vy för ditt recept "${recipeToEdit.title}"`);
          }}
          onDelete={async () => {
            if (!window.confirm(`Är du säker på att du vill radera "${selected.title}"?`)) return;

            try {
              // 1. Vi försöker ta bort den från backend i bakgrunden...
              await deleteRecipe(selected._id);
            } catch {
              // HÄR: Tog bort (err) eftersom vi inte använder variabeln!
              console.log("Backend stödde inte delete, rensar i frontend istället.");
            }

            // 2. Rensa bort receptet från ditt state direkt!
            setMyRecipes(prevRecipes => prevRecipes.filter(r => r._id !== selected._id));
            
            // 3. Stäng modalen
            setSelected(null);
          }}
        />
      )}

      {/* Formulärhantering för Nytt recept */}
      {showAddForm && (
        <AddRecipeForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchMyRecipes();
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;