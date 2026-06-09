import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Trash2, Users, UtensilsCrossed } from "lucide-react";
import {
  checkAdminAccess,
  getAdminRecipes,
  getAdminUsers,
  softDeleteRecipeAsAdmin,
  softDeleteUserAsAdmin,
  type AdminUser,
  type ApiStatusError,
} from "../../api/adminApi";
import { clearAuthData, getAuthData } from "../../api/authApi";
import type { Recipe } from "../../types";
import "./AdminPage.css";

type AdminAccessStatus = "checking" | "allowed" | "denied";

const formatDate = (value?: string): string => {
  if (!value) {
    return "Okänt datum";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Okänt datum";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Något gick fel";
};

const AdminPage = () => {
  const navigate = useNavigate();
  const currentUserId = getAuthData()?.user.id ?? null;

  const [adminStatus, setAdminStatus] =
    useState<AdminAccessStatus>("checking");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleAdminApiError = (error: unknown): boolean => {
    const status = (error as ApiStatusError).status;

    if (status === 401) {
      clearAuthData();
      navigate("/");
      return true;
    }

    if (status === 403) {
      navigate("/profil");
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (!currentUserId) {
      navigate("/");
      return;
    }

    const verifyAndLoad = async () => {
      try {
        await checkAdminAccess();
        setAdminStatus("allowed");
        setIsLoadingData(true);
        setPageError(null);

        const [usersData, recipesData] = await Promise.all([
          getAdminUsers(),
          getAdminRecipes(),
        ]);

        setUsers(usersData);
        setRecipes(recipesData);
      } catch (error) {
        const status = (error as ApiStatusError).status;

        if (status === 401) {
          clearAuthData();
          navigate("/");
          return;
        }

        if (status === 403) {
          navigate("/profil");
          return;
        }

        setAdminStatus("denied");
        setPageError(getErrorMessage(error));
      } finally {
        setIsLoadingData(false);
      }
    };

    void verifyAndLoad();
  }, [currentUserId, navigate]);

  const adminCount = users.filter((user) => user.role === "admin").length;

  const canDeleteUser = (user: AdminUser): boolean => {
    if (user.role !== "admin") {
      return true;
    }

    if (user._id !== currentUserId) {
      return false;
    }

    return adminCount > 1;
  };

  const getUserActionLabel = (user: AdminUser): string => {
    if (user.role !== "admin") {
      return "Soft delete";
    }

    if (user._id !== currentUserId) {
      return "Skyddad admin";
    }

    if (adminCount <= 1) {
      return "Sista admin";
    }

    return "Radera mig själv";
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!canDeleteUser(user)) {
      return;
    }

    const isSelf = user._id === currentUserId;
    const confirmed = window.confirm(
      isSelf
        ? "Vill du soft delete:a ditt eget konto? Du loggas ut direkt efteråt."
        : `Vill du soft delete:a användaren ${user.username}?`
    );

    if (!confirmed) {
      return;
    }

    setPendingAction(`user:${user._id}`);
    setFeedbackMessage(null);
    setPageError(null);

    try {
      await softDeleteUserAsAdmin(user._id);

      if (isSelf) {
        clearAuthData();
        navigate("/");
        return;
      }

      setUsers((prev) => prev.filter((item) => item._id !== user._id));
      setRecipes((prev) =>
        prev.filter((recipe) => String(recipe.createdBy) !== user._id)
      );
      setFeedbackMessage(`Användaren ${user.username} har soft delete:ats.`);
    } catch (error) {
      if (handleAdminApiError(error)) {
        return;
      }

      setPageError(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    const confirmed = window.confirm(
      `Vill du soft delete:a receptet "${recipe.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setPendingAction(`recipe:${recipe._id}`);
    setFeedbackMessage(null);
    setPageError(null);

    try {
      await softDeleteRecipeAsAdmin(recipe._id);
      setRecipes((prev) => prev.filter((item) => item._id !== recipe._id));
      setFeedbackMessage(`Receptet "${recipe.title}" har soft delete:ats.`);
    } catch (error) {
      if (handleAdminApiError(error)) {
        return;
      }

      setPageError(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  if (adminStatus === "checking") {
    return <p className="admin-status">Laddar adminpanelen...</p>;
  }

  if (adminStatus === "denied") {
    return <p className="admin-status">Du har inte behörighet att se adminpanelen.</p>;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Adminverktyg</p>
          <h1>Hantera användare och recept</h1>
          <p className="admin-subtitle">
            Du är fortfarande inloggad som vanlig användare, men har extra verktyg
            för att soft delete:a innehåll när det behövs.
          </p>
        </div>

        <div className="admin-summary" aria-label="Sammanfattning">
          <div className="admin-summary-item">
            <Users size={16} aria-hidden="true" />
            <span>{users.length} aktiva användare</span>
          </div>
          <div className="admin-summary-item">
            <UtensilsCrossed size={16} aria-hidden="true" />
            <span>{recipes.length} synliga recept</span>
          </div>
          <div className="admin-summary-item">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{adminCount} aktiva admins</span>
          </div>
        </div>
      </header>

      {feedbackMessage && (
        <p className="admin-feedback admin-feedback--success">{feedbackMessage}</p>
      )}

      {pageError && (
        <p className="admin-feedback admin-feedback--error">{pageError}</p>
      )}

      {isLoadingData ? (
        <p className="admin-status">Hämtar användare och recept...</p>
      ) : (
        <div className="admin-layout">
          <section className="admin-section" aria-labelledby="admin-users-heading">
            <div className="admin-section-header">
              <div>
                <p className="admin-section-label">Användare</p>
                <h2 id="admin-users-heading">Aktiva användare</h2>
              </div>
              <p className="admin-section-copy">
                Vanliga användare kan soft delete:as. Andra admins skyddas och den
                sista adminen kan inte raderas.
              </p>
            </div>

            <ul className="admin-list" role="list">
              {users.map((user) => {
                const disabled = !canDeleteUser(user);
                const isPending = pendingAction === `user:${user._id}`;
                const isSelf = user._id === currentUserId;

                return (
                  <li key={user._id} className="admin-row">
                    <div className="admin-row-main">
                      <div className="admin-row-heading">
                        <h3>{user.username}</h3>
                        <span
                          className={`admin-badge ${
                            user.role === "admin" ? "admin-badge--admin" : ""
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                        {isSelf && <span className="admin-badge">Du</span>}
                      </div>
                      <p>{user.email}</p>
                      <div className="admin-meta">
                        <span>Skapad {formatDate(user.createdAt)}</span>
                        <span>{user.favorites?.length ?? 0} favoriter</span>
                      </div>
                    </div>

                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-danger-btn"
                        disabled={disabled || isPending}
                        onClick={() => void handleDeleteUser(user)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        {isPending ? "Arbetar..." : getUserActionLabel(user)}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="admin-section" aria-labelledby="admin-recipes-heading">
            <div className="admin-section-header">
              <div>
                <p className="admin-section-label">Recept</p>
                <h2 id="admin-recipes-heading">Synliga recept</h2>
              </div>
              <p className="admin-section-copy">
                Soft delete döljer receptet i appen, men bevarar datan i databasen.
              </p>
            </div>

            <ul className="admin-list" role="list">
              {recipes.map((recipe) => {
                const isPending = pendingAction === `recipe:${recipe._id}`;

                return (
                  <li key={recipe._id} className="admin-row">
                    <div className="admin-row-main">
                      <div className="admin-row-heading">
                        <h3>{recipe.title}</h3>
                        {recipe.originalRef && (
                          <span className="admin-badge">Fork</span>
                        )}
                      </div>
                      <p>{recipe.createdByUsername || "Okänd användare"}</p>
                      <div className="admin-meta">
                        <span>Skapad {formatDate(recipe.createdAt)}</span>
                        <span>{recipe.ingredients?.length ?? 0} ingredienser</span>
                      </div>
                    </div>

                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-danger-btn"
                        disabled={isPending}
                        onClick={() => void handleDeleteRecipe(recipe)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        {isPending ? "Arbetar..." : "Soft delete"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
