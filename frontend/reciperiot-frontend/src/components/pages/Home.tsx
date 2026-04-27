import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Hero from "../hero/Hero";
import RecipeGrid from "../recipeGrid/RecipeGrid";
import Features from "../features/Feature";
import HowItWorks from "../howItWorks/HowItWorks";
import Footer from "../footer/Footer";
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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(
    initialAuth?.user ?? null
  );
  const navigate = useNavigate();

  const isLoggedIn = currentUser !== null;

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
        isLoggedIn={isLoggedIn}
        username={currentUser?.username}
      />

      <main id="main-content">
        <Hero
          onExplore={() => navigate("/utforska")}
          onStart={() => setIsLoginOpen(true)}
        />
        <RecipeGrid />
        <div className="container">
          <Features />
        </div>
        <HowItWorks />
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

export default Home;