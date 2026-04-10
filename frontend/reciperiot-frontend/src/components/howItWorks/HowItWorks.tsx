import './HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      num: "01",
      title: "Hitta inspiration",
      desc: "Bläddra bland tusentals recept från kockar världen över",
    },
    {
      num: "02",
      title: "Forka & anpassa",
      desc: "Gör receptet till ditt eget. Byt ingredienser, ändra proportioner",
    },
    {
      num: "03",
      title: "Planera veckan",
      desc: "Dra dina favoritrecept till veckomenyn",
    },
    {
      num: "04",
      title: "Handla smart",
      desc: "Få en automatisk inköpslista och börja laga",
    },
  ];

  return (
    <section className="how-section">
      <div className="how-inner-content">
        <h2 className="how-main-title">Så funkar det</h2>
        
        <div className="how-grid">
          {steps.map((step) => (
            <div key={step.num} className="how-step-card">
              <span className="how-step-number">{step.num}</span>
              <h3 className="how-step-heading">{step.title}</h3>
              <p className="how-step-description">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;