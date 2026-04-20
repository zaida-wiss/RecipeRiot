import "./Navbar.css";
import { Link } from "react-router-dom";

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
      <div className="logo">🍳 RecipeRiot</div>

      <div className="nav-links">
        <Link to="/">Utforska</Link>
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