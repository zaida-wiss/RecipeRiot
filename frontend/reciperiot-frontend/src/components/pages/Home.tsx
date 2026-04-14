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
    </>
  );
};

export default Home;