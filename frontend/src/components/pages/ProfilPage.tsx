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
    // Vi hämtar all data igen
    const all = await getAllRecipes();
    
    // Filtrera ut de som hör till användaren
    const filtered = all.filter((r) => {
      if (!user?.id || !r.createdBy) return false;
      
      const creatorId = typeof r.createdBy === 'object' && r.createdBy !== null
        ? (r.createdBy as { _id?: string; id?: string })._id || (r.createdBy as { _id?: string; id?: string }).id 
        : String(r.createdBy);
        
      return String(creatorId).trim() === String(user.id).trim();
    });

    // Logga för att se vad vi faktiskt får tillbaka
    console.log("Hämtade recept:", filtered); 
    
    setMyRecipes(filtered);
  } catch (err) {
    console.error("Kunde inte hämta recept:", err);
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
                <h3>Du har inga recept än</h3>
                <button className="profile-add-btn" onClick={() => setShowAddForm(true)}>+ Lägg till ditt första recept</button>
              </div>
            )}
          </div>
        ) : activeTab === 'favoriter' ? (
          <div className="profile-grid">
            {favorites.map((r) => <RecipeCard key={r._id} recipe={r} onClick={() => setSelected(r)} />)}
          </div>
        ) : (
          <div className="profile-settings"><h3>Inställningar...</h3></div>
        )}
      </div>

      {selected && (
        <RecipeModal
          recipe={selected}
          onClose={() => setSelected(null)}
          onFork={async (forkedRecipe) => {
            try {
              // Vi skapar ett objekt som garanterat uppfyller CreateRecipeInput
              const recipeToSave = {
                ...forkedRecipe,
                title: forkedRecipe.title || "Nytt recept",
                ingredients: forkedRecipe.ingredients || [], // Om ingredients krävs
              };

              await createRecipe(recipeToSave);
              await fetchMyRecipes();
              
              setSelected(null);
              alert("Receptet har kopierats till dina recept!");
            } catch (err) {
              console.error("Det gick inte att forka receptet:", err);
              alert("Något gick fel, försök igen.");
            }
          }}
          onEdit={(recipeToEdit) => {
            setSelected(null);
            alert(`Öppnar ändrings-vy för: ${recipeToEdit.title}`);
          }}
          onDelete={async () => {
            if (!window.confirm(`Vill du radera "${selected.title}"?`)) return;
            try {
              await deleteRecipe(selected._id);
              setMyRecipes(prev => prev.filter(r => r._id !== selected._id));
            } catch {
              console.log("Rensar i frontend.");
            }
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