import { NavLink } from "react-router-dom";
import { GitFork, ExternalLink, Mail } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer" aria-label="Sidfot">
      <div className="footer-inner">

        <div className="footer-top">
          <div className="footer-brand">
            <NavLink to="/" className="footer-logo" aria-label="RecipeRiot – startsidan">
              <span className="footer-logo-icon" aria-hidden="true">
                <GitFork size={13} strokeWidth={2} />
              </span>
              <span className="footer-logo-name">RecipeRiot</span>
            </NavLink>
            <p className="footer-tagline">Recept som lever vidare</p>
          </div>

          <nav className="footer-links" aria-label="Footerlänkar">
            <NavLink to="/om">Om oss</NavLink>
            <NavLink to="/integritet">Integritet</NavLink>
            <NavLink to="/kontakt">Kontakt</NavLink>
          </nav>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© 2026 RecipeRiot</span>
          <div className="footer-social">
            <a href="mailto:info@reciperiot.se" className="social-btn" aria-label="Kontakta oss via mail">
              <Mail size={13} strokeWidth={2} aria-hidden="true" />
            </a>
            <a href="https://github.com/zaida-wiss/RecipeRiot" className="social-btn" aria-label="Extern länk">
              <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;