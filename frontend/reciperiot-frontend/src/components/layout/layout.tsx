import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import UserLogin from "../userLogin/UserLogin";
import { clearAuthData, getAuthData } from "../../api/authApi";

type AuthUser = { id: number; email: string; username: string };

const Layout = () => {
  const initialAuth = getAuthData();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(
    initialAuth?.user ?? null
  );

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    clearAuthData();
    setCurrentUser(null);
  };

  return (
    <>
      <Navbar
        onLoginClick={() => setIsLoginOpen(true)}
        onLogoutClick={handleLogout}
        isLoggedIn={currentUser !== null}
        username={currentUser?.username}
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