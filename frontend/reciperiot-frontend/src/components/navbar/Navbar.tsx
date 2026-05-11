import "./Navbar.css";
import { Link } from "react-router-dom";
import { GitFork } from "lucide-react";

type NavbarProps = {
  onLoginClick: () => void;
  onLogoutClick: () => void;
  isLoggedIn: boolean;
  username?: string;
};

const Navbar = ({
  onLoginClick,
  onLogoutClick,
  isLoggedIn,
  username,
}: NavbarProps) => {
  return (
    <nav className="navbar">
    <Link to="/" className="logo">
      <GitFork size={20} />
      <span>RecipeRiot</span>
    </Link>

      <div className="nav-links">
        <Link to="/utforska">Utforska</Link>
        <Link to="/mina-forks">Mina forks</Link>
        <Link to="/veckomeny">Veckomeny</Link>
        <Link to="/inkopslista">Inköpslista</Link>
      </div>

      <div className="nav-actions">
        {isLoggedIn && <span className="welcome">Hej, {username}</span>}

        <button
          className="login"
          onClick={isLoggedIn ? onLogoutClick : onLoginClick}
        >
          {isLoggedIn ? "Logga ut" : "Logga in"}
        </button>

        <button className="cta">Kom igång</button>
      </div>
    </nav>
  );
};

export default Navbar;