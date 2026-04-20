import Hero from "../hero/Hero";
import RecipeGrid from "../recipeGrid/RecipeGrid";
import Features from "../features/Feature";
import HowItWorks from "../howItWorks/HowItWorks";
import UserLogin from "../userLogin/UserLogin";

type AuthUser = {
  id: number;
  email: string;
  username: string;
};

type HomeProps = {
  isLoginOpen: boolean;
  setIsLoginOpen: (value: boolean) => void;
  onAuthSuccess: (user: AuthUser) => void;
};

const Home = ({ isLoginOpen, setIsLoginOpen, onAuthSuccess }: HomeProps) => {
  return (
    <>
      <Hero />

      <RecipeGrid />

      <div className="container">
        <div className="section">
          <Features />
        </div>
      </div>

      <HowItWorks />

      <UserLogin
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onAuthSuccess={onAuthSuccess}
      />
    </>
  );
};

export default Home;