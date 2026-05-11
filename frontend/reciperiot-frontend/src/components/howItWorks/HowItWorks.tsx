import "./HowItWorks.css";

const steps = [
  { num: "01", title: "Hitta inspiration", desc: "Bläddra bland tusentals recept från kockar världen över" },
  { num: "02", title: "Forka & anpassa", desc: "Gör receptet till ditt eget – byt ingredienser och proportioner" },
  { num: "03", title: "Planera veckan", desc: "Dra favoritrecept till veckomenyn med drag-and-drop" },
  { num: "04", title: "Handla smart", desc: "Få en automatisk inköpslista och börja laga" },
];

const HowItWorks = () => {
  return (
    <section className="how-section" aria-labelledby="how-heading">
      <div className="how-header">
        <span className="section-label">Så funkar det</span>
        <h2 className="how-main-title" id="how-heading">Från inspiration till tallrik</h2>
        <p className="how-subtitle">Fyra enkla steg för att komma igång</p>
      </div>

      <ol className="how-grid" aria-label="Steg för att komma igång">
        {steps.map((step) => (
          <li key={step.num} className="how-step-card">
            <div className="how-step-number-wrap" aria-hidden="true">
              <span className="how-step-number">{step.num}</span>
            </div>
            <div className="how-step-text">
              <h3 className="how-step-heading">{step.title}</h3>
              <p className="how-step-description">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default HowItWorks;