import Navbar from "../components/navbar/Navbar";
import Hero from "../components/hero/Hero";
import RecipeGrid from "../components/recipeGrid/RecipeGrid";
import Features from "../components/features/Features";
import HowItWorks from "../components/howItWorks/HowItWorks";

const Home = () => {
  return (
<>
  <Navbar />

  <Hero />

  <div className="container">
    <div className="section">
      <RecipeGrid />
    </div>

    <div className="section">
      <Features />
    </div>

    <div className="section">
      <HowItWorks />
    </div>
  </div>
</>
  );
};

export default Home;