import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  saveAuthData,
  type AuthUser,
} from "../../api/authApi";
import "./UserLogin.css";

type UserLoginProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onAuthSuccess: (user: AuthUser) => void;
};

const UserLogin = ({ isOpen, onClose, onAuthSuccess }: UserLoginProps) => {
  type ViewMode = "login" | "register" | "forgot" | "reset";

  // isRegisterMode avgör om samma modal visar login-formulär eller registreringsformulär.
  const [viewMode, setViewMode] = useState<ViewMode>("login");

  // Login använder ett gemensamt fält eftersom backend kan söka på både username och email.
  const [loginIdentifier, setLoginIdentifier] = useState("");

  // Registrering behöver separata fält så backend kan skapa ett komplett användarkonto.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [devResetToken, setDevResetToken] = useState("");
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState("");

  // error och success visas i modalen för att användaren ska förstå vad som händer.
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Varje ny öppning ska börja i login-läge, inte visa gammal success eller register-form.
    setViewMode("login");
    setLoginIdentifier("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setUsername("");
    setResetEmail("");
    setResetToken("");
    setDevResetToken("");
    setResetPasswordValue("");
    setResetPasswordConfirm("");
    setError("");
    setSuccess("");

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Samma reset används både när man byter läge och när formuläret behöver börja om.
  const resetForm = () => {
    setLoginIdentifier("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setUsername("");
    setResetEmail("");
    setResetToken("");
    setDevResetToken("");
    setResetPasswordValue("");
    setResetPasswordConfirm("");
    setError("");
    setSuccess("");
  };

  // Växlar mellan login och registrering utan att gamla fältvärden följer med.
  const toggleMode = () => {
    resetForm();
    setViewMode((currentMode) => currentMode === "register" ? "login" : "register");
  };

  // Frontendvalidering hjälper användaren snabbt, men backendens Zod-schema är fortfarande säkerhetsgränsen.
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

  // Register-flödet får tillbaka en riktig JWT från backend och sparar den lokalt.
  const handleRegister = async () => {
    validateRegisterInput();

    const result = await registerUser(username, email, password);

    saveAuthData(result.token, result.user);
    onAuthSuccess(result.user);
    setSuccess("Registreringen lyckades! Välkommen till RecipeRiot.");
  };

  // Login skickar identifier + password till backend. Frontend kontrollerar aldrig lösenord själv.
  const handleLogin = async () => {
    const result = await loginUser(loginIdentifier, password);

    saveAuthData(result.token, result.user);
    onAuthSuccess(result.user);
    setSuccess("Inloggningen lyckades! Välkommen tillbaka.");
  };

  const handleForgotPasswordRequest = async () => {
    const result = await requestPasswordReset(resetEmail);
    setSuccess(result.message);
    setDevResetToken(result.resetToken ?? "");
    setResetToken(result.resetToken ?? "");
    setViewMode("reset");
  };

  const handleResetPassword = async () => {
    if (resetPasswordValue !== resetPasswordConfirm) {
      throw new Error("Lösenorden matchar inte");
    }

    if (resetPasswordValue.length < 8) {
      throw new Error("Lösenordet måste vara minst 8 tecken");
    }

    const result = await resetPassword(resetToken, resetPasswordValue);
    setSuccess(result.message);
    setError("");
    setViewMode("login");
    setPassword("");
    setLoginIdentifier(resetEmail);
  };

  // Ett gemensamt submit-flöde gör att knappen kan användas i både login- och registerläge.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (viewMode === "register") {
        await handleRegister();
      } else if (viewMode === "login") {
        await handleLogin();
      } else if (viewMode === "forgot") {
        await handleForgotPasswordRequest();
      } else {
        await handleResetPassword();
      }

      if (viewMode === "login" || viewMode === "register") {
        setTimeout(onClose, 2000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ett fel inträffade";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Hindrar klick inuti modalen från att bubbla upp till backdropen och stänga modalen.
  const stopModalClose = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="user-login-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="user-login-modal" onClick={stopModalClose}>
        <button className="user-login-close" type="button" aria-label="Stäng" onClick={onClose}>
          ×
        </button>

        <h2 className="user-login-title">
          {viewMode === "register"
            ? "Registrera dig"
            : viewMode === "forgot"
              ? "Återställ lösenord"
              : viewMode === "reset"
                ? "Sätt nytt lösenord"
                : "Logga in"}
        </h2>
        <p className="user-login-subtitle">
          {viewMode === "register"
            ? "Skapa ett konto för att börja dela recept"
            : viewMode === "forgot"
              ? "Ange din e-postadress så skapar vi en återställningskod."
              : viewMode === "reset"
                ? "Ange reset-koden och välj ett nytt lösenord."
                : "Välkommen tillbaka till RecipeRiot."}
        </p>

        {error && <div className="user-login-error">{error}</div>}
        {success && <div className="user-login-success">{success}</div>}

        <form className="user-login-form" onSubmit={handleSubmit}>
          {viewMode === "register" && (
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
                required={viewMode === "register"}
              />
            </>
          )}

          {viewMode === "register" ? (
            <>
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
            </>
          ) : viewMode === "login" ? (
            <>
              <label className="user-login-label" htmlFor="user-login-identifier">
                Användarnamn eller e-post
              </label>
              <input
                id="user-login-identifier"
                className="user-login-input"
                type="text"
                value={loginIdentifier}
                onChange={(event) => setLoginIdentifier(event.target.value)}
                placeholder="Användarnamn eller e-post"
                autoComplete="username"
                required
              />
            </>
          ) : viewMode === "forgot" ? (
            <>
              <label className="user-login-label" htmlFor="user-login-reset-email">
                E-post
              </label>
              <input
                id="user-login-reset-email"
                className="user-login-input"
                type="email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                placeholder="namn@email.com"
                required
              />
            </>
          ) : (
            <>
              <label className="user-login-label" htmlFor="user-login-reset-token">
                Reset-kod
              </label>
              <input
                id="user-login-reset-token"
                className="user-login-input"
                type="text"
                value={resetToken}
                onChange={(event) => setResetToken(event.target.value)}
                placeholder="Klistra in din reset-kod"
                required
              />
            </>
          )}

          {viewMode !== "forgot" && (
            <>
              <label className="user-login-label" htmlFor="user-login-password">
                {viewMode === "reset" ? "Nytt lösenord" : "Lösenord"}
              </label>
              <input
                id="user-login-password"
                className="user-login-input"
                type="password"
                value={viewMode === "reset" ? resetPasswordValue : password}
                onChange={(event) => {
                  if (viewMode === "reset") {
                    setResetPasswordValue(event.target.value);
                    return;
                  }

                  setPassword(event.target.value);
                }}
                placeholder="••••••••"
                required
              />
            </>
          )}

          {(viewMode === "register" || viewMode === "reset") && (
            <>
              <label className="user-login-label" htmlFor="user-login-password-confirm">
                Bekräfta lösenord
              </label>
              <input
                id="user-login-password-confirm"
                className="user-login-input"
                type="password"
                value={viewMode === "reset" ? resetPasswordConfirm : passwordConfirm}
                onChange={(event) => {
                  if (viewMode === "reset") {
                    setResetPasswordConfirm(event.target.value);
                    return;
                  }

                  setPasswordConfirm(event.target.value);
                }}
                placeholder="••••••••"
                required
              />
            </>
          )}

          {viewMode === "reset" && devResetToken && (
            <div className="user-login-dev-token">
              <strong>Utvecklingsläge:</strong> din reset-kod är <code>{devResetToken}</code>
            </div>
          )}

          <button className="user-login-submit" type="submit" disabled={isLoading}>
            {isLoading
              ? "Laddar..."
              : viewMode === "register"
                ? "Registrera"
                : viewMode === "forgot"
                  ? "Skicka reset-kod"
                  : viewMode === "reset"
                    ? "Spara nytt lösenord"
                    : "Logga in"}
          </button>
        </form>

        {viewMode === "login" && (
          <button
            type="button"
            className="user-login-forgot"
            onClick={() => {
              resetForm();
              setViewMode("forgot");
            }}
          >
            Glömt lösenordet?
          </button>
        )}

        {(viewMode === "forgot" || viewMode === "reset") && (
          <button
            type="button"
            className="user-login-forgot"
            onClick={() => {
              resetForm();
              setViewMode("login");
            }}
          >
            Tillbaka till inloggning
          </button>
        )}

        {(viewMode === "login" || viewMode === "register") && (
          <div className="user-login-toggle">
          <p className="user-login-toggle-text">
            {viewMode === "register" ? "Redan medlem?" : "Ny medlem?"}
          </p>
          <button type="button" className="user-login-toggle-btn" onClick={toggleMode}>
            {viewMode === "register" ? "Logga in här" : "Registrera dig här"}
          </button>
        </div>
        )}
      </div>
    </div>
  );
};

export default UserLogin;
