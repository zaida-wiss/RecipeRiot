import Navbar from "../navbar/Navbar";
import Hero from "../hero/Hero";
import RecipeGrid from "../recipeGrid/RecipeGrid";
import Features from "../features/Feature";
import HowItWorks from "../howItWorks/HowItWorks";

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