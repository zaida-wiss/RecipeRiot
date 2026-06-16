import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getAuthData, clearAuthData, deleteMyAccount, exportMyData } from '../../api/authApi';
import DeleteAccountModal from '../deleteAccountModal/DeleteAccountModal';

declare global {
  interface Window {
    onAccountDeleted?: () => void;
  }
}
import { useRecipeFilter } from '../../hooks/useRecipeFilter';
import { useRecipeOperations } from '../../hooks/useRecipeOperations';
import { useProfileData } from '../../hooks/useProfileData';
import RecipeFilterBar from '../recipeFilterBar/RecipeFilterBar';
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
  favoriteIds: Set<string>;
  onFavoriteChanged: () => void;
};

type MyRecipesSectionProps = RecipeSectionProps & {
  onAddRecipe: () => void;
};

const MyRecipesSection = ({
  recipes,
  onAddRecipe,
  onSelectRecipe,
  favoriteIds,
  onFavoriteChanged,
}: MyRecipesSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filterHook = useRecipeFilter(recipes, searchQuery);
  const { filteredRecipes } = filterHook;

  return (
    <div>
      <button className="profile-add-btn" onClick={onAddRecipe}>
        + Lägg till nytt recept
      </button>

      {recipes.length > 0 && (
        <>
          <div className="search-wrapper" style={{ marginBottom: '1.5rem' }}>
            <Search className="search-icon-svg" size={20} color="#817878" />
            <input
              type="text"
              placeholder="Sök på recepttitel..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <RecipeFilterBar {...filterHook} />
        </>
      )}

      {filteredRecipes.length > 0 ? (
        <div className="profile-grid">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              isFavorite={favoriteIds.has(recipe._id)}
              onClick={() => onSelectRecipe(recipe)}
              onFavoriteChanged={onFavoriteChanged}
            />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="profile-cta">
          <div className="profile-cta-icon">🍳</div>
          <h3>Du har inga recept än</h3>
          <p>Dela ditt första recept med communityn!</p>
          <button className="profile-add-btn" onClick={onAddRecipe}>
            + Lägg till ditt första recept
          </button>
        </div>
      ) : (
        <div className="profile-empty">
          <p>Inga recept matchar dina filter.</p>
        </div>
      )}
    </div>
  );
};

const FavoritesSection = ({
  recipes,
  onSelectRecipe,
  favoriteIds,
  onFavoriteChanged,
}: RecipeSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filterHook = useRecipeFilter(recipes, searchQuery);
  const { filteredRecipes } = filterHook;

  if (recipes.length === 0) {
    return (
      <div className="profile-empty">
        <p>Du har inga favoriter än.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="search-wrapper" style={{ marginBottom: '1.5rem' }}>
        <Search className="search-icon-svg" size={20} color="#817878" />
        <input
          type="text"
          placeholder="Sök på recepttitel..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <RecipeFilterBar {...filterHook} />

      {filteredRecipes.length > 0 ? (
        <div className="profile-grid">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              isFavorite={favoriteIds.has(recipe._id)}
              onClick={() => onSelectRecipe(recipe)}
              onFavoriteChanged={onFavoriteChanged}
            />
          ))}
        </div>
      ) : (
        <div className="profile-empty">
          <p>Inga favoriter matchar dina filter.</p>
        </div>
      )}
    </div>
  );
};

type SettingsSectionProps = {
  onExportData: () => void;
  onDeleteAccount: () => void;
};

const SettingsSection = ({ onExportData, onDeleteAccount }: SettingsSectionProps) => (
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

    <div className="settings-card">
      <h3>Exportera data</h3>
      <p>Ladda ner en kopia av all din data enligt GDPR.</p>
      <button type="button" className="settings-btn" onClick={onExportData}>
        Exportera mina data
      </button>
    </div>

    <div className="settings-card settings-danger">
      <h3>Radera konto</h3>
      <p>Permanent borttagning av ditt konto och all relaterad data. Denna åtgärd kan inte ångras.</p>
      <button type="button" className="settings-btn settings-btn-danger" onClick={onDeleteAccount}>
        Radera mitt konto
      </button>
    </div>
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
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const authData = getAuthData();
  const user = authData?.user;
  const favoriteIds = new Set(favorites.map((recipe) => recipe._id));

  const {
    myRecipes: hookMyRecipes,
    favorites: hookFavorites,
    refreshFavorites,
    loading: hookLoading,
    fetchMyRecipes,
  } = useProfileData(user?.id);

  const { forkRecipe, removeRecipe } = useRecipeOperations(
    () => {
      void fetchMyRecipes();
      setSelected(null);
    },
    (id: string) => {
      setMyRecipes((prev) => prev.filter((recipe) => recipe._id !== id));
      setSelected(null);
    }
  );

  useEffect(() => {
    setMyRecipes(hookMyRecipes);
  }, [hookMyRecipes]);

  useEffect(() => {
    setFavorites(hookFavorites);
  }, [hookFavorites]);

  useEffect(() => {
    setLoading(hookLoading);
  }, [hookLoading]);

  const handleForkRecipe = async (recipeId: string, forkedRecipe: Partial<Recipe>) => {
    await forkRecipe(recipeId, forkedRecipe);
  };

  const handleDeleteRecipe = async (id: string) => {
    await removeRecipe(id);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (password: string) => {
    try {
      await deleteMyAccount(password);
      clearAuthData();
    } catch (err) {
      console.error('Kunde inte radera kontot:', err);
      throw err;
    }
  };

  const handleDeleteSuccess = () => {
    window.onAccountDeleted?.();
    navigate('/');
  };

  const handleExportData = async () => {
    try {
      await exportMyData();
    } catch (err) {
      console.error('Kunde inte exportera data:', err);
      alert('Kunde inte exportera data. Försök igen senare.');
    }
  };

  const renderActiveTab = () => {
    if (loading) {
      return <p className="profile-loading">Laddar...</p>;
    }

    if (activeTab === 'mina-recept') {
      return (
        <MyRecipesSection
          recipes={myRecipes}
          favoriteIds={favoriteIds}
          onAddRecipe={() => setShowAddForm(true)}
          onSelectRecipe={setSelected}
          onFavoriteChanged={refreshFavorites}
        />
      );
    }

    if (activeTab === 'favoriter') {
      return (
        <FavoritesSection
          recipes={favorites}
          favoriteIds={favoriteIds}
          onSelectRecipe={setSelected}
          onFavoriteChanged={refreshFavorites}
        />
      );
    }

    return (
      <SettingsSection
        onExportData={handleExportData}
        onDeleteAccount={handleDeleteAccount}
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
          onOpenRecipe={(recipe) => setSelected(recipe)}
          onEdit={(recipe) => {
            setRecipeToEdit(recipe);
            setSelected(null);
            setShowAddForm(true);
          }}
        />
      )}

      {showAddForm && (
        <AddRecipeForm
          onClose={() => {
            setShowAddForm(false);
            setRecipeToEdit(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setRecipeToEdit(null);
            void fetchMyRecipes();
          }}
          recipeToEdit={recipeToEdit || undefined}
        />
      )}

      {showDeleteModal && user && (
        <DeleteAccountModal
          username={user.username}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default ProfilePage;
