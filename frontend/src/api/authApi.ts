// API-basens adress kommer från Vite-miljön, så frontend inte behöver hårdkoda backend-url överallt.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';
const API_TIMEOUT = 10000;

// Helpers
// AbortController gör att ett anrop inte kan hänga hur länge som helst.
const fetchWithTimeout = async (
  url: string,
  init?: RequestInit
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

// Backend skickar ofta { message: "..." }. Den här helpern gör om det till ett tydligt frontend-fel.
const getResponseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return data.message || `Fel (${response.status})`;
  } catch {
    return `Fel (${response.status})`;
  }
};

// Gemensam JSON-wrapper: alla API-anrop får timeout, felhantering och typat svar på samma sätt.
const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  try {
    const response = await fetchWithTimeout(url, init);

    if (!response.ok) {
      const message = await getResponseErrorMessage(response);
      throw new Error(message);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && (error.name === 'AbortError' || error.message === 'Failed to fetch')) {
      throw new Error('Kunde inte ansluta till servern');
    }

    throw error;
  }
};

// Auth-routes använder samma POST-mönster. Bara endpoint och body skiljer register från login.
const postAuth = async <T>(
  endpoint: string,
  body: unknown
): Promise<T> => {
  return requestJson(`${BASE_URL}/api/v1/auth/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};


// Typer
// AuthUser matchar det säkra användarobjektet backend returnerar. passwordHash ska aldrig finnas här.
export type AuthUser = {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};


// Export-funktioner
// Registrering skickar lösenordet till backend, där det hashats med bcrypt innan användaren sparas.
export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  return postAuth<AuthResponse>('register', { username, email, password });
};

// Login skickar användarnamn/e-post och lösenord till backend. Frontend ska inte själv jämföra lösenord.
export const loginUser = async (
  identifier: string,
  password: string
): Promise<AuthResponse> => {
  return postAuth<AuthResponse>('login', { identifier, password });
};

// Token och publik user-info sparas så appen kan komma ihåg inloggningen efter sidladdning.
export const saveAuthData = (token: string, user: AuthUser): void => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Hämtar sparad auth-data. Om JSON är trasig rensas datan så appen inte hamnar i ett konstigt läge.
export const getAuthData = (): { token: string; user: AuthUser } | null => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return null;
  }

  try {
    return { token, user: JSON.parse(userStr) };
  } catch {
    clearAuthData();
    return null;
  }
};

// Logout i frontend betyder att vi glömmer token lokalt.
export const clearAuthData = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};


// Det här behövs när frontend ska skapa, uppdatera, radera eller forka recept.
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};
// Skapar Authorization-headern för skyddade routes.
// Om användaren inte är inloggad skickas inga auth-headers.
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};
