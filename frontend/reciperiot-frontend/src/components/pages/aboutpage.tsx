import { Users, GitFork, Heart } from "lucide-react";
import "./InfoPages.css";

const AboutPage = () => {
  return (
    <div className="info-page">
      <div className="info-hero">
        <span className="section-label">Om oss</span>
        <h1>Vi tror på recept som lever vidare</h1>
        <p>RecipeRiot är byggt för kockar som vill dela, förbättra och inspirera.</p>
      </div>

      <div className="info-section">
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon"><GitFork size={18} strokeWidth={1.8} /></div>
            <h3>Vår mission</h3>
            <p>Placeholder-text om vad RecipeRiot vill uppnå och varför det skapades.</p>
          </div>
          <div className="info-card">
            <div className="info-icon"><Users size={18} strokeWidth={1.8} /></div>
            <h3>Vårt team</h3>
            <p>Placeholder-text om personerna bakom plattformen och deras bakgrund.</p>
          </div>
          <div className="info-card">
            <div className="info-icon"><Heart size={18} strokeWidth={1.8} /></div>
            <h3>Våra värderingar</h3>
            <p>Placeholder-text om vad som driver oss — öppenhet, gemenskap och mat.</p>
          </div>
        </div>
      </div>

      <div className="info-section info-section--beige">
        <div className="info-text-block">
          <h2>Vår historia</h2>
          <p>Placeholder-text om hur RecipeRiot startade, vilka problem det löser och vart vi är på väg.</p>
          <p>Placeholder-text om tillväxt, community och framtidsplaner.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;