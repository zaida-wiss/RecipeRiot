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

      {/* 1. Vi lägger RecipeGrid helt utanför .container */}
      <RecipeGrid />

      {/* 2. De andra sektionerna som ska ha beige bakgrund och vara smalare 
          ligger kvar i containern */}
      <div className="container">
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