import { GitFork, Calendar, ShoppingCart, Users, Shield, BookOpen } from "lucide-react";
import "./Features.css";
 
const featureData = [
  {
    title: "Forka recept",
    desc: "Skapa variationer av andras recept. Se versionshistorik och jämför ändringar.",
    icon: GitFork,
  },
  {
    title: "Veckomenyplanering",
    desc: "Planera veckans alla måltider med drag-and-drop.",
    icon: Calendar,
  },
  {
    title: "Smart inköpslista",
    desc: "Generera automatiskt en inköpslista baserad på din veckomeny.",
    icon: ShoppingCart,
  },
  {
    title: "Följ kockar",
    desc: "Följ favoritkockar och se deras senaste recept i ditt flöde.",
    icon: Users,
  },
  {
    title: "GDPR & allergier",
    desc: "Dina allergier skyddas med extra säkerhet. Full kontroll över dina data.",
    icon: Shield,
  },
  {
    title: "Steg-för-steg",
    desc: "Tydliga instruktioner med svårighetsgrad och tidsuppskattningar.",
    icon: BookOpen,
  },
];
 
const Features = () => {
  return (
    <section className="features-section">
      <div className="container">
        <div className="features-header">
          <span className="section-label">Funktioner</span>
          <h2 className="features-main-title">Allt du behöver</h2>
          <p className="features-subtitle">Verktyg för att laga, dela och planera</p>
        </div>
 
        <div className="feature-grid">
          {featureData.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="feature-card">
                <div className="feature-icon-wrapper">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <h3 className="feature-card-title">{f.title}</h3>
                <p className="feature-card-desc">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
 
export default Features;
 