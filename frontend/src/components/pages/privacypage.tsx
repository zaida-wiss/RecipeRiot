import { Shield, Lock, Eye, Trash2 } from "lucide-react";
import "./InfoPages.css";

const sections = [
  {
    icon: Eye,
    title: "Vilken data vi samlar in",
    text: "Placeholder-text om vilken information vi samlar in när du använder RecipeRiot, t.ex. e-post, användarnamn och receptaktivitet.",
  },
  {
    icon: Lock,
    title: "Hur vi skyddar din data",
    text: "Placeholder-text om kryptering, säkerhet och hur vi hanterar din personliga information.",
  },
  {
    icon: Shield,
    title: "Dina rättigheter (GDPR)",
    text: "Placeholder-text om dina rättigheter enligt GDPR — rätt till tillgång, rättelse och radering av data.",
  },
  {
    icon: Trash2,
    title: "Radering av konto",
    text: "Placeholder-text om hur du raderar ditt konto och vad som händer med din data efteråt.",
  },
];

const PrivacyPage = () => {
  return (
    <div className="info-page">
      <div className="info-hero">
        <span className="section-label">Integritet</span>
        <h1>Din integritet är viktig för oss</h1>
        <p>Vi är transparenta med hur vi hanterar din data. Senast uppdaterad: januari 2026.</p>
      </div>

      <div className="info-section">
        <div className="privacy-list">
          {sections.map(({ icon: Icon, title, text }) => (
            <div key={title} className="privacy-item">
              <div className="info-icon"><Icon size={18} strokeWidth={1.8} /></div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;