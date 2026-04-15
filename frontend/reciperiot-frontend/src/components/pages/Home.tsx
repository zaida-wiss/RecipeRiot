import { useState } from "react";
import Navbar from "../navbar/Navbar";
import Hero from "../hero/Hero";
import RecipeGrid from "../recipeGrid/RecipeGrid";
import Features from "../features/Feature";
import HowItWorks from "../howItWorks/HowItWorks";
import UserLogin from "../userLogin/UserLogin";

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  return (
    <>
      <Navbar onLoginClick={openLogin} />

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

      <UserLogin isOpen={isLoginOpen} onClose={closeLogin} />
    </>
  );
};

export default Home;