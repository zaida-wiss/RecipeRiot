import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import "./UserLogin.css";

type UserLoginProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

const UserLogin = ({ isOpen, onClose }: UserLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Placeholder until real auth endpoint is connected.
    onClose();
  };

  const stopModalClose = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="user-login-backdrop" onClick={onClose}>
      <div className="user-login-modal" onClick={stopModalClose}>
        <button className="user-login-close" type="button" aria-label="Stang" onClick={onClose}>
          ×
        </button>

        <h2 className="user-login-title">Logga in</h2>
        <p className="user-login-subtitle">Valkommen tillbaka till RecipeRiot.</p>

        <form className="user-login-form" onSubmit={handleSubmit}>
          <label className="user-login-label" htmlFor="user-login-email">
            E-post
          </label>
          <input
            id="user-login-email"
            className="user-login-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="namn@email.com"
            required
          />

          <label className="user-login-label" htmlFor="user-login-password">
            Losenord
          </label>
          <input
            id="user-login-password"
            className="user-login-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
          />

          <button className="user-login-submit" type="submit">
            Logga in
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
