import { useState } from "react";
import Navbar from "../navbar/Navbar";
import Hero from "../hero/Hero";
import RecipeGrid from "../recipeGrid/RecipeGrid";
import Features from "../features/Feature";
import HowItWorks from "../howItWorks/HowItWorks";
import UserLogin from "../userLogin/UserLogin";
import { clearAuthData, getAuthData } from "../../api/authApi";

type AuthUser = {
  id: number;
  email: string;
  username: string;
};

const Home = () => {
  const initialAuth = getAuthData();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(initialAuth?.user ?? null);

  const isLoggedIn = currentUser !== null;

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

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
        onLoginClick={openLogin}
        onLogoutClick={handleLogout}
        isLoggedIn={isLoggedIn}
        username={currentUser?.username}
      />

      <Hero />

      {/* Vit sektion som går kant-till-kant */}
      <RecipeGrid />

      {/* Beige sektion (Features stannar i containern) */}
      <div className="container">
        <div className="section">
          <Features />
        </div>
      </div>

      {/* Vit sektion som går kant-till-kant */}
      <HowItWorks />

      <UserLogin isOpen={isLoginOpen} onClose={closeLogin} onAuthSuccess={handleAuthSuccess} />
    </>
  );
};

export default Home;