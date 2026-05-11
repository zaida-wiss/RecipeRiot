import { useNavigate } from "react-router-dom";
import Hero from "../hero/Hero";
import RecipeGrid from "../recipeGrid/RecipeGrid";
import Features from "../features/Feature";
import HowItWorks from "../howItWorks/HowItWorks";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Hero
        onExplore={() => navigate("/utforska")}
        onStart={() => navigate("/utforska")}
      />
      <RecipeGrid />
      <div className="container">
        <Features />
      </div>
      <HowItWorks />
    </>
  );
};

export default Home;