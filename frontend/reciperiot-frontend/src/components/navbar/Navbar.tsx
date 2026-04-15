import "./Navbar.css";

type NavbarProps = {
  onLoginClick: () => void;
};

const Navbar = ({ onLoginClick }: NavbarProps) => {
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
        <button className="login" onClick={onLoginClick}>Logga in</button>
        <button className="cta">Kom igång</button>
      </div>
    </nav>
  );
};

export default Navbar;