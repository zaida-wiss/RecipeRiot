import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { loginUser, registerUser, saveAuthData } from "../../api/authApi";
import "./UserLogin.css";

// 🔹 Typdefinition för props – beskriver vad komponenten förväntar sig
type UserLoginProps = {
  readonly isOpen: boolean; // styr om modalen visas
  readonly onClose: () => void; // funktion för att stänga modalen
  readonly onAuthSuccess: (user: { id: number; email: string; username: string }) => void; // callback efter lyckad auth
};

// 🔹 Själva React-komponenten (funktionell komponent med hooks)
const UserLogin = ({ isOpen, onClose, onAuthSuccess }: UserLoginProps) => {

  // 🔹 State: styr UI och användarinput
  const [isRegisterMode, setIsRegisterMode] = useState(false); // login vs register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(""); // felmeddelande till användaren
  const [success, setSuccess] = useState(""); // success message
  const [isLoading, setIsLoading] = useState(false); // loader state

  // 🔹 useEffect: hanterar side effects (lyssnar på ESC-tangent)
  useEffect(() => {
    if (!isOpen) return; // kör bara när modalen är öppen

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose(); // stäng modalen vid ESC
      }
    };

    window.addEventListener("keydown", handleEsc);

    // cleanup: viktigt för att undvika memory leaks
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // 🔹 Reset av formulär – återanvändbar funktion
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setUsername("");
    setError("");
    setSuccess("");
  };

  // 🔹 Växla mellan login och register
  const toggleMode = () => {
    resetForm(); // rensa formulär vid byte
    setIsRegisterMode(!isRegisterMode);
  };

  // 🔹 Validering (frontend-säkerhet + UX)
  const validateRegisterInput = () => {
    const validationRules: Array<[boolean, string]> = [
      [password !== passwordConfirm, "Lösenorden matchar inte"],
      [password.length < 6, "Lösenordet måste vara minst 6 tecken"],
      [!username.trim(), "Användarnamn krävs"],
    ];

    // hittar första regel som failar
    const validationMessage = validationRules.find(([isInvalid]) => isInvalid)?.[1];

    if (validationMessage) {
      throw new Error(validationMessage); // kastar error → fångas i try/catch
    }
  };

  // 🔹 Registreringslogik (API-anrop)
  const handleRegister = async () => {
    validateRegisterInput();

    const user = await registerUser(username, email);
    const authUser = { id: user.id, email: user.email, username: user.username };

    saveAuthData("demo-token", authUser);
    onAuthSuccess(authUser);
    setSuccess("Registreringen lyckades! Välkommen till RecipeRiot.");
  };

  // 🔹 Inloggning
  const handleLogin = async () => {
    const result = await loginUser(email);

    saveAuthData(result);
    onAuthSuccess(result.user);
    setSuccess("Inloggningen lyckades! Välkommen tillbaka.");
  };

  // 🔹 Form submit – central controller
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // stoppar reload

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // conditional logic beroende på mode
      if (isRegisterMode) {
        await handleRegister();
      } else {
        await handleLogin();
      }

      // stäng modalen efter delay
      setTimeout(onClose, 2000);

    } catch (err) {
      const message = err instanceof Error ? err.message : "Ett fel inträffade";
      setError(message); // visar fel i UI
    } finally {
      setIsLoading(false); // alltid körs
    }
  };

  // 🔹 Stoppar click bubbling (för att inte stänga modal)
  const stopModalClose = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  // 🔹 Conditional rendering – rendera inget om stängd
  if (!isOpen) {
    return null;
  }

  return (
    <div className="user-login-backdrop" onClick={onClose}>
      <div className="user-login-modal" onClick={stopModalClose}>

        {/* Stäng-knapp */}
        <button className="user-login-close" type="button" aria-label="Stäng" onClick={onClose}>
          ×
        </button>

        {/* Dynamisk titel */}
        <h2 className="user-login-title">
          {isRegisterMode ? "Registrera dig" : "Logga in"}
        </h2>

        {/* UX-text */}
        <p className="user-login-subtitle">
          {isRegisterMode
            ? "Skapa ett konto för att börja dela recept"
            : "Välkommen tillbaka till RecipeRiot."}
        </p>

        {/* Feedback till användaren */}
        {error && <div className="user-login-error">{error}</div>}
        {success && <div className="user-login-success">{success}</div>}

        <form className="user-login-form" onSubmit={handleSubmit}>

          {/* Conditional rendering: username bara vid register */}
          {isRegisterMode && (
            <>
              <label htmlFor="user-login-username">Användarnamn</label>
              <input
                id="user-login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

          {/* Password */}
          <label htmlFor="user-login-password">Lösenord</label>
          <input
            id="user-login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Confirm password */}
          {isRegisterMode && (
            <>
              <label htmlFor="user-login-password-confirm">Bekräfta lösenord</label>
              <input
                id="user-login-password-confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </>
          )}

          {/* Submit */}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Laddar..." : isRegisterMode ? "Registrera" : "Logga in"}
          </button>
        </form>

        {/* Toggle mellan login/register */}
        <div>
          <p>{isRegisterMode ? "Redan medlem?" : "Ny medlem?"}</p>
          <button type="button" onClick={toggleMode}>
            {isRegisterMode ? "Logga in här" : "Registrera dig här"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;