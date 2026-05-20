import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import UserLogin from "../userLogin/UserLogin";
import { clearAuthData, getAuthData, type AuthUser } from "../../api/authApi";

const Layout = () => {
  // Läser eventuell sparad token/user när appen laddas om.
  // Om inget finns börjar användaren som utloggad.
  const initialAuth = getAuthData();

  // Layout äger om login-modalen är öppen eftersom Navbar öppnar den.
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Kort statusmeddelande i Navbar, till exempel efter logout.
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null);

  // currentUser styr om Navbar ska visa "Logga in" eller "Logga ut".
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(
    initialAuth?.user ?? null
  );

  // Körs när UserLogin lyckas logga in eller registrera en användare.
  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setAuthStatusMessage(null);
  };

  // Logout ska rensa både localStorage och React-state.
  const handleLogout = () => {
    clearAuthData();
    setCurrentUser(null);
    setAuthStatusMessage("Du är utloggad");
  };

  // När användaren öppnar login igen tar vi bort logout-meddelandet.
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
