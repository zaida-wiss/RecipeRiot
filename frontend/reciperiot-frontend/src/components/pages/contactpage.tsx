import { useState, type FormEvent } from "react";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import "./InfoPages.css";

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="info-page">
      <div className="info-hero">
        <span className="section-label">Kontakt</span>
        <h1>Hör av dig till oss</h1>
        <p>Vi svarar inom 1–2 arbetsdagar.</p>
      </div>

      <div className="info-section">
        <div className="contact-layout">

          {/* Kontaktinfo */}
          <div className="contact-info">
            <div className="contact-info-item">
              <div className="info-icon"><Mail size={18} strokeWidth={1.8} /></div>
              <div>
                <h3>E-post</h3>
                <p>hej@reciperiot.se</p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="info-icon"><MessageSquare size={18} strokeWidth={1.8} /></div>
              <div>
                <h3>Support</h3>
                <p>support@reciperiot.se</p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="info-icon"><MapPin size={18} strokeWidth={1.8} /></div>
              <div>
                <h3>Adress</h3>
                <p>Placeholder-adress, Sverige</p>
              </div>
            </div>
          </div>

          {/* Formulär */}
          <div className="contact-form-wrap">
            {submitted ? (
              <div className="contact-success">
                <Mail size={32} strokeWidth={1.5} />
                <h3>Tack för ditt meddelande!</h3>
                <p>Vi återkommer så snart vi kan.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="contact-name">Namn</label>
                  <input id="contact-name" type="text" placeholder="Ditt namn" required />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">E-post</label>
                  <input id="contact-email" type="email" placeholder="din@email.com" required />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-subject">Ämne</label>
                  <input id="contact-subject" type="text" placeholder="Vad gäller det?" required />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Meddelande</label>
                  <textarea
                    id="contact-message"
                    placeholder="Skriv ditt meddelande här..."
                    rows={5}
                    required
                  />
                </div>
                <button type="submit" className="contact-submit">
                  Skicka meddelande
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;