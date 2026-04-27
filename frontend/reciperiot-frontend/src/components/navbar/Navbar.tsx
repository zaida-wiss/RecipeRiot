import { useState, type KeyboardEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, GitFork, LogIn, LogOut, Menu, X } from "lucide-react";
import "./Navbar.css";

type NavbarProps = {
  onLoginClick: () => void;
  onLogoutClick: () => void;
  isLoggedIn: boolean;
  username?: string;
};

const navLinks = [
  { to: "/utforska", label: "Utforska" },
  { to: "/veckomeny", label: "Veckomeny" },
  { to: "/inkopslista", label: "Inköpslista" },
];

const Navbar = ({ onLoginClick, onLogoutClick, isLoggedIn, username }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (q: string) => {
    const trimmed = q.trim();
    navigate(trimmed ? `/utforska?q=${encodeURIComponent(trimmed)}` : "/utforska");
    setSearchQuery("");
    setMenuOpen(false);
  };

  const handleSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch(searchQuery);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "navbar-link navbar-link--active" : "navbar-link";

  const drawerLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "navbar-drawer-link navbar-drawer-link--active" : "navbar-drawer-link";

  return (
    <>
      <a className="skip-link" href="#main-content">Hoppa till innehåll</a>

      <nav className="navbar" aria-label="Huvudnavigation">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo" aria-label="RecipeRiot – startsidan">
          <span className="navbar-logo-icon" aria-hidden="true">
            <GitFork size={14} strokeWidth={2} />
          </span>
          <span className="navbar-logo-name">RecipeRiot</span>
        </NavLink>

        {/* Desktop sökfält */}
        <div className="navbar-search" role="search">
          <label htmlFor="navbar-search-input" className="sr-only">Sök bland recept</label>
          <span className="navbar-search-icon" aria-hidden="true">
            <Search size={15} strokeWidth={2} />
          </span>
          <input
            id="navbar-search-input"
            type="search"
            className="navbar-search-input"
            placeholder="Sök bland recept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKey}
            autoComplete="off"
          />
          <kbd className="navbar-kbd" aria-hidden="true">⏎</kbd>
        </div>

        {/* Desktop länkar */}
        <ul className="navbar-links" role="list">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClass}>{link.label}</NavLink>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              <span className="navbar-welcome" aria-live="polite">Hej, {username}</span>
              <button className="navbar-btn navbar-btn--ghost" onClick={onLogoutClick} aria-label="Logga ut">
                <LogOut size={14} strokeWidth={2} aria-hidden="true" />
                Logga ut
              </button>
            </>
          ) : (
            <>
              <button className="navbar-btn navbar-btn--ghost" onClick={onLoginClick} aria-label="Logga in">
                <LogIn size={14} strokeWidth={2} aria-hidden="true" />
                Logga in
              </button>
              <NavLink to="/utforska" className="navbar-btn navbar-btn--cta">
                Kom igång
              </NavLink>
            </>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          className="navbar-hamburger"
          aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        id="mobile-drawer"
        className={`navbar-drawer${menuOpen ? " open" : ""}`}
        aria-hidden={!menuOpen}
      >
        {/* Sökfält i drawer */}
        <div className="navbar-drawer-search" role="search">
          <label htmlFor="drawer-search-input" className="sr-only">Sök bland recept</label>
          <span className="navbar-drawer-search-icon" aria-hidden="true">
            <Search size={15} strokeWidth={2} />
          </span>
          <input
            id="drawer-search-input"
            type="search"
            className="navbar-drawer-search-input"
            placeholder="Sök bland recept..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(e.currentTarget.value);
            }}
            autoComplete="off"
          />
        </div>

        <div className="navbar-drawer-divider" aria-hidden="true" />

        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={drawerLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </>
  );
};

export default Navbar;