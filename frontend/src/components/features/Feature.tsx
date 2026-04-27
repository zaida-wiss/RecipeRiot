import './Features.css';

const Features = () => {
  const featureData = [
    {
      title: "Forka recept",
      desc: "Skapa variationer av andras recept, precis som på GitHub. Se versionshistorik och jämför ändringar.",
      icon: "🍴" // Du kan byta ut dessa mot Lucide-react eller SVG senare
    },
    {
      title: "Veckomenyplanering",
      desc: "Planera veckans alla måltider med drag-and-drop. Dina forkade recept samlade på ett ställe.",
      icon: "📅"
    },
    {
      title: "Smart inköpslista",
      desc: "Generera automatiskt en inköpslista baserad på din veckomeny. Slå ihop dubbletter och sortera per butiksdel.",
      icon: "🛒"
    },
    {
      title: "Följ kockar",
      desc: "Följ dina favoritkockar och se deras senaste recept och forks i ditt personliga flöde.",
      icon: "👥"
    },
    {
      title: "GDPR & allergier",
      desc: "Dina allergier och matpreferenser skyddas med extra säkerhet. Fullständig kontroll över dina data.",
      icon: "🛡️"
    },
    {
      title: "Steg-för-steg",
      desc: "Tydliga instruktioner med svårighetsgrad, taggar och tidsuppskattningar för varje recept.",
      icon: "📖"
    }
  ];

  return (
    <section className="features-section">
      <div className="container">
        <h2 className="features-main-title">Allt du behöver</h2>
        <p className="features-subtitle">Kraftfulla verktyg för att laga, dela och planera</p>

        <div className="feature-grid">
          {featureData.map((f, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">{f.icon}</span>
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;