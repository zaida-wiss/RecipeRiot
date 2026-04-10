import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>
            Recept som <span>utvecklas</span> tillsammans
          </h1>

          <p>
            Forka recept, skapa egna variationer och planera veckans måltider.
          </p>

          <div className="hero-buttons">
            <button className="primary">Börja laga</button>
            <button className="secondary">Utforska recept</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;