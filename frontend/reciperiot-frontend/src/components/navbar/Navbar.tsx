import "./Navbar.css";

const Navbar = () => {
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
        <button className="login">Logga in</button>
        <button className="cta">Kom igång</button>
      </div>
    </nav>
  );
};

export default Navbar;