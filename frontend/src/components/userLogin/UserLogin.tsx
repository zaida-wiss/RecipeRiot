import { useEffect, useState, type FormEvent } from "react";
// Vi importerar funktionerna och typen User.
// Att importera typer (type User) är "best practice" för att hålla koden typsäker.
import { loginUser, registerUser, saveAuthData, type User } from "../../api/authApi";
import "./UserLogin.css";

// 🔹 Props-definition: Definierar vad komponenten kräver utifrån.
// Användning av 'readonly' gör att vi inte kan ändra dessa värden inifrån komponenten, vilket minskar buggar.
type UserLoginProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onAuthSuccess: (user: User) => void;
};

const UserLogin = ({ isOpen, onClose, onAuthSuccess }: UserLoginProps) => {

  // 🔹 State (Hooks): 'useState' används för att hålla koll på UI-data som förändras över tid.
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 useEffect: Hanterar "side effects".
  // Här använder vi den för att lyssna på tangentbordet (Escape) och stänga modalen.
  useEffect(() => {
    if (!isOpen) return; // Kör bara logik om modalen faktiskt visas

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);

    // Cleanup-funktion: Tar bort lyssnaren när komponenten stängs/unmountas.
    // Detta förhindrar "minnesläckor" (memory leaks).
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Hjälpfunktion för att nollställa formulärvärden
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setUsername("");
    setError("");
    setSuccess("");
  };

  // Växlar mellan inloggnings- och registreringsvy
  const toggleMode = () => {
    resetForm();
    setIsRegisterMode(!isRegisterMode);
  };

  // Validering: Vi kastar fel som sedan fångas upp av vår 'catch'-block i handleSubmit.
  const validateRegisterInput = () => {
    if (password !== passwordConfirm) throw new Error("Lösenorden matchar inte");
    if (password.length < 6) throw new Error("Lösenordet måste vara minst 6 tecken");
    if (!username.trim()) throw new Error("Användarnamn krävs");
  };

  // Registreringslogik: Notera att vi skickar in ett OBJEKT { username, email }
  // Detta är en "Data Transfer Object"-pattern för att undvika "String Heavy Arguments"-problemet.
  const handleRegister = async () => {
    validateRegisterInput();

    const user = await registerUser(username, email);

    // formaterar användarobjekt
    const authUser = { id: user.id, email: user.email, username: user.username };

    saveAuthData("demo-token", authUser); // sparar i localStorage (eller liknande)
    onAuthSuccess(authUser); // skickar upp till parent
    setSuccess("Registreringen lyckades! Välkommen till RecipeRiot.");
  };

  // Inloggningslogik
  const handleLogin = async () => {
    const result = await loginUser({ email });

    saveAuthData(result.token, result.user);
    onAuthSuccess(result.user);
    setSuccess("Inloggningen lyckades! Välkommen tillbaka.");
  };

  // Form submit: Hanterar både register och login beroende på state
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Hindrar webbläsaren från att ladda om sidan
    setError("");
    setSuccess("");
    setIsLoading(true); // Visar laddningsindikator

    try {
      if (isRegisterMode) {
        await handleRegister();
      } else {
        await handleLogin();
      }
      // Väntar 2 sekunder innan vi stänger modalen så användaren hinner läsa "succé"-meddelandet
      setTimeout(onClose, 2000);
    } catch (err) {
      // Hanterar fel och visar dem för användaren
      setError(err instanceof Error ? err.message : "Ett fel inträffade");
    } finally {
      setIsLoading(false); // Stänger av laddningsindikatorn oavsett resultat (success eller fail)
    }
  };

  // Rendera inget om modalen är stängd
  if (!isOpen) return null;

  return (
    <div className="user-login-backdrop" onClick={onClose}>
      {/* stopPropagation förhindrar att click-eventet bubblar upp till backdropen */}
      <div className="user-login-modal" onClick={(e) => e.stopPropagation()}>

        <button className="user-login-close" type="button" onClick={onClose}>×</button>

        <h2 className="user-login-title">
          {isRegisterMode ? "Registrera dig" : "Logga in"}
        </h2>

        {/* Conditional rendering: Visar fel/succé-meddelanden endast om de finns */}
        {error && <div className="user-login-error">{error}</div>}
        {success && <div className="user-login-success">{success}</div>}

        <form className="user-login-form" onSubmit={handleSubmit}>

          {/* Rendera användarnamn endast i registreringsläge */}
          {isRegisterMode && (
            <>
              <label htmlFor="user-login-username">Användarnamn</label>
              <input
                id="user-login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </>
          )}

          {/* Email */}
          <label htmlFor="user-login-email">E-post</label>
          <input
            id="user-login-email"
            className="user-login-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="namn@email.com"
            required
          />

          <label htmlFor="user-login-password">Lösenord</label>
          <input
            id="user-login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

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

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Laddar..." : isRegisterMode ? "Registrera" : "Logga in"}
          </button>
        </form>

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