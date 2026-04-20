import "./Navbar.css";

type NavbarProps = {
  onLoginClick: () => void;
  onLogoutClick: () => void;
  isLoggedIn: boolean;
  username?: string;
};

const Navbar = ({ onLoginClick, onLogoutClick, isLoggedIn, username }: NavbarProps) => {
  return (
    <nav className="navbar">
      <div className="logo">🍳 RecipeRiot</div>

      <div className="nav-links">
        <a>Utforska</a>
        <a>Mina forks</a>
        <a>Veckomeny</a>
        <a>Inköpslista</a>
      </div>

      <div className="nav-actions">
        {isLoggedIn && <span className="welcome">Hej, {username}</span>}
        <button className="login" onClick={isLoggedIn ? onLogoutClick : onLoginClick}>
          {isLoggedIn ? "Logga ut" : "Logga in"}
        </button>
        <button className="cta">Kom igång</button>
      </div>
    </nav>
  );
};

export default Navbar;