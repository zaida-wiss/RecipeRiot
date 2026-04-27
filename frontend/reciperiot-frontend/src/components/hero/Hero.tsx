import "./Hero.css";

type HeroProps = {
  onExplore: () => void;
  onStart: () => void;
};

const Hero = ({ onExplore, onStart }: HeroProps) => {
  return (
    <section className="hero" aria-label="Introduktion">
      <div className="hero-content">
        <h1>
          Recept som <em>utvecklas</em> tillsammans
        </h1>
        <p>
          Forka recept, skapa egna variationer och planera veckans måltider –
          som GitHub, fast för mat.
        </p>
        <div className="hero-buttons">
          <button className="primary" onClick={onStart}>
            Börja laga
          </button>
          <button className="secondary" onClick={onExplore}>
            Utforska recept
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;