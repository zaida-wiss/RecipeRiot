import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import UserLogin from "../userLogin/UserLogin";
import {
  AUTH_SESSION_ENDED_EVENT,
  clearAuthData,
  getAuthData,
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
    const handleSessionEnded = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      setCurrentUser(null);
      setAuthStatusMessage(customEvent.detail?.message ?? null);
    };

    window.addEventListener(AUTH_SESSION_ENDED_EVENT, handleSessionEnded);
    return () => window.removeEventListener(AUTH_SESSION_ENDED_EVENT, handleSessionEnded);
  }, []);

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
