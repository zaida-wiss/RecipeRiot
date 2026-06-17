// API-basens adress kommer från Vite-miljön, så frontend inte behöver hårdkoda backend-url överallt.
const BASE_URL = import.meta.env.VITE_API_URL;
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

// Backend skickar ofta { message: "...", errors: [...] }. Den här helpern bevarar valideringsfel.
const getResponseErrorMessage = async (response: Response): Promise<{ message: string; errors?: any[] }> => {
  try {
    const data = await response.json();
    return { message: data.message || `Fel (${response.status})`, errors: data.errors };
  } catch {
    return { message: `Fel (${response.status})` };
  }
};

// Gemensam JSON-wrapper: alla API-anrop får timeout, felhantering och typat svar på samma sätt.
const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  try {
    const response = await fetchWithTimeout(url, init);

    if (!response.ok) {
      const errorData = await getResponseErrorMessage(response);
      const error = new Error(errorData.message) as any;
      if (errorData.errors) error.errors = errorData.errors;
      throw error;
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
  role: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken?: string;
};

export type ResetPasswordResponse = {
  message: string;
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

export const requestPasswordReset = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  return requestJson<ForgotPasswordResponse>(`${BASE_URL}/api/v1/password-reset/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (
  token: string,
  password: string
): Promise<ResetPasswordResponse> => {
  return requestJson<ResetPasswordResponse>(`${BASE_URL}/api/v1/password-reset/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
};

// Token och publik user-info sparas så appen kan komma ihåg inloggningen efter sidladdning.
export const saveAuthData = (token: string, user: AuthUser): void => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));
};

type JwtExpirationPayload = {
  exp?: number;
};

export const getTokenExpiration = (token: string): number | null => {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    const normalizedPayload = payloadPart
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, '=');
    const payload = JSON.parse(atob(normalizedPayload)) as JwtExpirationPayload;

    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

// Hämtar sparad auth-data. Om JSON är trasig rensas datan så appen inte hamnar i ett konstigt läge.
export const getAuthData = (): { token: string; user: AuthUser } | null => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return null;
  }

  try {
    const expiresAt = getTokenExpiration(token);
    if (!expiresAt || expiresAt <= Date.now()) {
      clearAuthData();
      return null;
    }

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
  console.log('clearAuthData called, dispatching authDataCleared event');
  window.dispatchEvent(new Event('authDataCleared'));
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

// Permanent borttagning av användarkonto (GDPR hard delete)
export const deleteMyAccount = async (password: string): Promise<void> => {
  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/gdpr/me/hard`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as any;
    throw new Error(errorData.message || 'Kunde inte radera kontot');
  }
};

// Exportera användarens data (GDPR export)
export const exportMyData = async (): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/v1/gdpr/export`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Kunde inte exportera data');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reciperiot-my-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
