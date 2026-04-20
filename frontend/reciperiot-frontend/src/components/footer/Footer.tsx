import { GitFork } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        {/* VÄNSTER */}
        <div className="footer-left">
          <span className="footer-logo">
            <GitFork size={20} /> RecipeRiot
          </span>
        </div>

        {/* MITTEN */}
        <span className="footer-copyright">
          © 2026 RecipeRiot. Recept förtjänar att leva vidare.
        </span>

        {/* HÖGER */}
        <div className="footer-links">
          <a href="#om">Om oss</a>
          <a href="#integritet">Integritet</a>
          <a href="#kontakt">Kontakt</a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;