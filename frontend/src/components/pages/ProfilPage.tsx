import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthData } from '../../api/authApi';
import { getAllRecipes, deleteRecipe, createRecipe } from '../../api/recipesApi';
import { getFavorites } from '../../api/favoritesApi';
import RecipeCard from '../recipeCard/RecipeCard';
import RecipeModal from '../recipeModal/RecipeModal';
import AddRecipeForm from '../addRecipe/AddRecipeForm';
import type { Recipe } from '../../types';
import './ProfilePage.css';

type Tab = 'mina-recept' | 'favoriter' | 'installningar';

const profileTabs: Array<{ value: Tab; label: string }> = [
  { value: 'mina-recept', label: 'Mina recept' },
  { value: 'favoriter', label: 'Favoriter' },
  { value: 'installningar', label: 'Inställningar' },
];

const filterRecipesByUser = (recipes: Recipe[], userId?: string) =>
  recipes.filter((recipe) => String(recipe.createdBy) === String(userId));

const normalizeForkedRecipe = (forkedRecipe: Partial<Recipe>) => {
  const cleanedIngredients = (forkedRecipe.ingredients ?? []).map((ingredient) => ({
    ...ingredient,
    quantity:
      typeof ingredient.quantity === 'string'
        ? Number(ingredient.quantity)
        : (ingredient.quantity as number),
  }));

  return {
    title: forkedRecipe.title || 'Nytt recept',
    ingredients: cleanedIngredients,
    steps: forkedRecipe.steps || [],
    imageUrl: forkedRecipe.imageUrl || '',
    createdBy: forkedRecipe.createdBy,
  };
};

type ProfileTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const ProfileTabs = ({ activeTab, onTabChange }: ProfileTabsProps) => (
  <div className="profile-tabs">
    {profileTabs.map((tab) => (
      <button
        key={tab.value}
        className={`profile-tab ${activeTab === tab.value ? 'active' : ''}`}
        onClick={() => onTabChange(tab.value)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

type RecipeSectionProps = {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
};

type MyRecipesSectionProps = RecipeSectionProps & {
  onAddRecipe: () => void;
};

const MyRecipesSection = ({
  recipes,
  onAddRecipe,
  onSelectRecipe,
}: MyRecipesSectionProps) => (
  <div>
    <button className="profile-add-btn" onClick={onAddRecipe}>
      + Lägg till nytt recept
    </button>

    {recipes.length > 0 ? (
      <div className="profile-grid">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe._id}
            recipe={recipe}
            onClick={() => onSelectRecipe(recipe)}
          />
        ))}
      </div>
    ) : (
      <div className="profile-cta">
        <div className="profile-cta-icon">🍳</div>
        <h3>Du har inga recept än</h3>
        <p>Dela ditt första recept med communityn!</p>
      </div>
    )}
  </div>
);

const FavoritesSection = ({ recipes, onSelectRecipe }: RecipeSectionProps) => (
  <div className="profile-grid">
    {recipes.length > 0 ? (
      recipes.map((recipe) => (
        <RecipeCard
          key={recipe._id}
          recipe={recipe}
          onClick={() => onSelectRecipe(recipe)}
        />
      ))
    ) : (
      <div className="profile-empty">
        <p>Du har inga favoriter än.</p>
      </div>
    )}
  </div>
);

type SettingsSectionProps = {
  isAdmin: boolean;
  onOpenAdmin: () => void;
};

const SettingsSection = ({ isAdmin, onOpenAdmin }: SettingsSectionProps) => (
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
        <button type="submit" className="settings-btn">
          Spara lösenord
        </button>
      </form>
    </div>

    {isAdmin && (
      <div className="settings-card">
        <h3>Adminbehörigheter</h3>
        <p>Hantera användare och recept.</p>
        <button type="button" className="settings-btn" onClick={onOpenAdmin}>
          Öppna adminverktyg
        </button>
      </div>
    )}
  </div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('mina-recept');
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const authData = getAuthData();
  const user = authData?.user;

  const fetchMyRecipes = async () => {
    if (!user?.id) {
      setMyRecipes([]);
      return;
    }

    try {
      const allRecipes = await getAllRecipes();
      setMyRecipes(filterRecipesByUser(allRecipes, user.id));
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
        setMyRecipes(filterRecipesByUser(allRecipes, user.id));
        setFavorites(favs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleForkRecipe = async (forkedRecipe: Partial<Recipe>) => {
    try {
      await createRecipe(normalizeForkedRecipe(forkedRecipe));
      await fetchMyRecipes();
      setSelected(null);
      alert('Receptet har kopierats till dina recept!');
    } catch (err) {
      console.error('Det gick inte att forka receptet:', err);
      alert('Kunde inte skapa receptet. Kontrollera konsolen för detaljer.');
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    await deleteRecipe(id);
    setMyRecipes((prev) => prev.filter((recipe) => recipe._id !== id));
    setSelected(null);
  };

  const handleAddRecipeSuccess = async () => {
    setShowAddForm(false);
    await fetchMyRecipes();
  };

  const renderActiveTab = () => {
    if (loading) {
      return <p className="profile-loading">Laddar...</p>;
    }

    if (activeTab === 'mina-recept') {
      return (
        <MyRecipesSection
          recipes={myRecipes}
          onAddRecipe={() => setShowAddForm(true)}
          onSelectRecipe={setSelected}
        />
      );
    }

    if (activeTab === 'favoriter') {
      return <FavoritesSection recipes={favorites} onSelectRecipe={setSelected} />;
    }

    return (
      <SettingsSection
        isAdmin={user?.role === 'admin'}
        onOpenAdmin={() => navigate('/admin')}
      />
    );
  };

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

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="profile-content">{renderActiveTab()}</div>

      {selected && (
        <RecipeModal
          recipe={selected}
          onClose={() => setSelected(null)}
          onFork={handleForkRecipe}
          onDelete={handleDeleteRecipe}
        />
      )}

      {showAddForm && (
        <AddRecipeForm
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddRecipeSuccess}
        />
      )}
    </div>
  );
};

export default ProfilePage;
