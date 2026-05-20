import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { loginUser, registerUser, saveAuthData, type AuthUser } from "../../api/authApi";
import "./UserLogin.css";

type UserLoginProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onAuthSuccess: (user: AuthUser) => void;
};

const UserLogin = ({ isOpen, onClose, onAuthSuccess }: UserLoginProps) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setUsername("");
    setError("");
    setSuccess("");
  };

  const toggleMode = () => {
    resetForm();
    setIsRegisterMode(!isRegisterMode);
  };

  const validateRegisterInput = () => {
    const validationRules: Array<[boolean, string]> = [
      [password !== passwordConfirm, "Lösenorden matchar inte"],
      [password.length < 8, "Lösenordet måste vara minst 8 tecken"],
      [!username.trim(), "Användarnamn krävs"],
    ];

    const validationMessage = validationRules.find(([isInvalid]) => isInvalid)?.[1];

    if (validationMessage) {
      throw new Error(validationMessage);
    }
  };

  const handleRegister = async () => {
    validateRegisterInput();

    const result = await registerUser(username, email, password);

    saveAuthData(result.token, result.user);
    onAuthSuccess(result.user);
    setSuccess("Registreringen lyckades! Välkommen till RecipeRiot.");
  };

  const handleLogin = async () => {
    const result = await loginUser(email, password);

    saveAuthData(result.token, result.user);
    onAuthSuccess(result.user);
    setSuccess("Inloggningen lyckades! Välkommen tillbaka.");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        await handleRegister();
      } else {
        await handleLogin();
      }

      setTimeout(onClose, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ett fel inträffade";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const stopModalClose = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="user-login-backdrop" onClick={onClose}>
      <div className="user-login-modal" onClick={stopModalClose}>
        <button className="user-login-close" type="button" aria-label="Stäng" onClick={onClose}>
          ×
        </button>

        <h2 className="user-login-title">{isRegisterMode ? "Registrera dig" : "Logga in"}</h2>
        <p className="user-login-subtitle">
          {isRegisterMode ? "Skapa ett konto för att börja dela recept" : "Välkommen tillbaka till RecipeRiot."}
        </p>

        {error && <div className="user-login-error">{error}</div>}
        {success && <div className="user-login-success">{success}</div>}

        <form className="user-login-form" onSubmit={handleSubmit}>
          {isRegisterMode && (
            <>
              <label className="user-login-label" htmlFor="user-login-username">
                Användarnamn
              </label>
              <input
                id="user-login-username"
                className="user-login-input"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="ditt_användarnamn"
                required={isRegisterMode}
              />
            </>
          )}

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
            Lösenord
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

          {isRegisterMode && (
            <>
              <label className="user-login-label" htmlFor="user-login-password-confirm">
                Bekräfta lösenord
              </label>
              <input
                id="user-login-password-confirm"
                className="user-login-input"
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                placeholder="••••••••"
                required
              />
            </>
          )}

          <button className="user-login-submit" type="submit" disabled={isLoading}>
            {isLoading ? "Laddar..." : isRegisterMode ? "Registrera" : "Logga in"}
          </button>
        </form>

        <div className="user-login-toggle">
          <p className="user-login-toggle-text">
            {isRegisterMode ? "Redan medlem?" : "Ny medlem?"}
          </p>
          <button type="button" className="user-login-toggle-btn" onClick={toggleMode}>
            {isRegisterMode ? "Logga in här" : "Registrera dig här"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
