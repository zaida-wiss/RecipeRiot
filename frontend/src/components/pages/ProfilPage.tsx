import { useState, useEffect } from 'react';
import { getAuthData } from '../../api/authApi';
import { getAllRecipes, deleteRecipe, createRecipe } from '../../api/recipesApi';
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
    try {
      const all = await getAllRecipes();
      // Använder samma filtreringslogik som du använde i originalet, 
      // men med en kontroll för att vara säker
      setMyRecipes(all.filter((r) => String(r.createdBy) === String(user?.id)));
    } catch (err) {
      console.error(err);
    }
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
        setMyRecipes(allRecipes.filter((r) => String(r.createdBy) === String(user.id)));
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
      <div className="profile-header">
        <div className="profile-avatar">{user.username.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p>{user.email}</p>
          <div className="profile-stats">
            <span><strong>{myRecipes.length}</strong> recept</span>
            <span><strong>{favorites.length}</strong> favoriter</span>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`profile-tab ${activeTab === 'mina-recept' ? 'active' : ''}`} onClick={() => setActiveTab('mina-recept')}>Mina recept</button>
        <button className={`profile-tab ${activeTab === 'favoriter' ? 'active' : ''}`} onClick={() => setActiveTab('favoriter')}>Favoriter</button>
        <button className={`profile-tab ${activeTab === 'installningar' ? 'active' : ''}`} onClick={() => setActiveTab('installningar')}>Inställningar</button>
      </div>

      <div className="profile-content">
        {loading ? (
          <p className="profile-loading">Laddar...</p>
        ) : activeTab === 'mina-recept' ? (
          <div>
            {myRecipes.length > 0 ? (
              <>
                <button className="profile-add-btn" onClick={() => setShowAddForm(true)}>+ Lägg till nytt recept</button>
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
                <button className="profile-add-btn" onClick={() => setShowAddForm(true)}>+ Lägg till ditt första recept</button>
              </div>
            )}
          </div>
        ) : activeTab === 'favoriter' ? (
          <div className="profile-grid">
            {favorites.length > 0 ? (
              favorites.map((r) => <RecipeCard key={r._id} recipe={r} onClick={() => setSelected(r)} />)
            ) : (
              <div className="profile-empty"><p>Du har inga favoriter än.</p></div>
            )}
          </div>
        ) : (
          <div className="profile-settings">
            <div className="settings-card">
              <h3>Byt lösenord</h3>
              <form className="settings-form">
                <label>Nuvarande lösenord</label><input type="password" placeholder="••••••••" />
                <label>Nytt lösenord</label><input type="password" placeholder="••••••••" />
                <label>Bekräfta nytt lösenord</label><input type="password" placeholder="••••••••" />
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

      {selected && (
        <RecipeModal 
          recipe={selected} 
          onClose={() => setSelected(null)} 
          onFork={async (forkedRecipe) => {
            try {
              await createRecipe({
                ...forkedRecipe,
                title: forkedRecipe.title || "Nytt recept"
              });
              await fetchMyRecipes();
              setSelected(null);
              alert("Receptet har kopierats till dina recept!");
            } catch (err) {
              console.error("Det gick inte att forka receptet:", err);
              alert("Något gick fel, försök igen.");
            }
          }}
          onDelete={async (id) => {
            await deleteRecipe(id);
            setMyRecipes(prev => prev.filter(r => r._id !== id));
            setSelected(null);
          }}
        />
      )}

      {showAddForm && (
        <AddRecipeForm onClose={() => setShowAddForm(false)} onSuccess={() => { setShowAddForm(false); fetchMyRecipes(); }} />
      )}
    </div>
  );
};

export default ProfilePage;