import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import UserLogin from "../userLogin/UserLogin";
import {
  clearAuthData,
  getAuthData,
  getTokenExpiration,
  getAuthToken,
  type AuthUser,
} from "../../api/authApi";

const Layout = () => {
  const initialAuth = getAuthData();
  const navigate = useNavigate();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(
    initialAuth?.user ?? null
  );

  useEffect(() => {
    const authData = getAuthData();
    if (!authData) return;

    const expiresAt = getTokenExpiration(authData.token);
    if (!expiresAt) return;

    const timeoutId = window.setTimeout(() => {
      clearAuthData();
      setCurrentUser(null);
      setAuthStatusMessage("Din session har gått ut. Logga in igen.");
    }, Math.max(0, expiresAt - Date.now()));

    return () => window.clearTimeout(timeoutId);
  }, [currentUser]);

  useEffect(() => {
    const checkAuthState = () => {
      const token = getAuthToken();

      if (!token && currentUser !== null) {
        setCurrentUser(null);
        return;
      }

      if (token) {
        const expiresAt = getTokenExpiration(token);
        if (expiresAt && expiresAt <= Date.now() && currentUser !== null) {
          clearAuthData();
          setCurrentUser(null);
        }
      }
    };

    const interval = setInterval(checkAuthState, 1000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setAuthStatusMessage(null);
    setIsLoginOpen(false);
    navigate('/profil');
  };

  const handleLogout = () => {
    clearAuthData();
    setCurrentUser(null);
    setAuthStatusMessage("Du är utloggad");
    navigate('/');
  };

  const handleLoginClick = () => {
    setAuthStatusMessage(null);
    setIsLoginOpen(true);
  };

  return (
    <>
      <Navbar
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogout}
        isLoggedIn={currentUser !== null}
        username={currentUser?.username}
        role={currentUser?.role}
        statusMessage={authStatusMessage}
      />

      <main id="main-content">
        <Outlet />
      </main>

      <Footer />

      <UserLogin
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Layout;
