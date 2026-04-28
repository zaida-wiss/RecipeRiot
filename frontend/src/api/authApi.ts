// Den här filen samlar all logik som rör login/registrering.
// Vi använder `fetch` i stället för `axios` eftersom vi här bara behöver en enkel wrapper
// som kan hantera timeout, felmeddelanden och demo-login på ett tydligt sätt.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';
const API_TIMEOUT = 10000;

// Skickar en request och avbryter den automatiskt om servern tar för lång tid.
// Det gör att användaren får ett snabbare och mer begripligt felmeddelande.
async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function getResponseErrorMessage(response: Response): Promise<string> {
  try {
    // Om backend skickar JSON med en `message`, använder vi den direkt i UI:t.
    const data = await response.json();
    return data.message || `Fel (${response.status})`;
  } catch {
    // Om svaret inte går att läsa som JSON visar vi ändå ett generellt fel.
    return `Fel (${response.status})`;
  }
}

// Hjälpfunktion som avgör om felet kommer från nätverket och inte från vår egen logik.
// Då kan vi visa ett vänligare fel som "Kunde inte ansluta till servern".
function isNetworkFailure(error: unknown): error is Error {
  return error instanceof Error && (error.name === 'AbortError' || error.message === 'Failed to fetch');
}

// Denna funktion ser till att vi bara får ett lyckat svar tillbaka.
// Om status inte är OK översätts det till ett tydligt felmeddelande.
async function getSuccessfulResponse(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetchWithTimeout(url, init);

  if (!response.ok) {
    throw new Error(await getResponseErrorMessage(response));
  }

  return response;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  try {
    const response = await getSuccessfulResponse(url, init);

    // När svaret är OK kan vi läsa JSON och returnera den till komponenterna.
    return response.json();
  } catch (error) {
    if (isNetworkFailure(error)) {
      throw new Error('Kunde inte ansluta till servern');
    }

    throw error;
  }
}

function matchesLoginIdentifier(user: { email: string; username: string }, identifier: string): boolean {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  // Vi tillåter både användarnamn och e-postadress som inloggningsidentifierare.
  return (
    user.email.toLowerCase() === normalizedIdentifier ||
    user.username.toLowerCase() === normalizedIdentifier
  );
}

// Registrering i demo-läget skickar användaren till backend så att den sparas i mock-/in-memory-listan.
export async function registerUser(payload: { username: string; email: string }): Promise<{ id: number; username: string; email: string }> {
  const { username, email } = payload;

  return requestJson(`${BASE_URL}/api/v1/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email }),
  });
}

// Login i den här versionen använder mockdata från `/api/v1/users`.
// Det betyder att vi hämtar alla användare, letar upp en matchning och skapar ett demo-token.
export async function loginUser(identifier: string): Promise<{ token: string; user: { id: number; email: string; username: string } }> {
  const users = await requestJson<Array<{ id: number; email: string; username: string }>>(`${BASE_URL}/api/v1/users`);

  const user = users.find((u) => matchesLoginIdentifier(u, identifier));
  if (!user) {
    throw new Error('Användarnamnet eller e-postadressen hittades inte');
  }

  return {
    token: 'demo-token',
    user,
  };
}

// Vi sparar auth-information i `localStorage` så att användaren fortfarande är inloggad
// även om sidan laddas om. `authToken` och `user` sparas som två separata värden.
export function saveAuthData(auth: { token: string; user: { id: number; email: string; username: string } }): void {
  localStorage.setItem('authToken', auth.token);
  localStorage.setItem('user', JSON.stringify(auth.user));
}

// När appen startar kan vi läsa tillbaka sparad info från `localStorage`.
// `user` sparas som JSON-text, därför behöver vi `JSON.parse` när vi hämtar den igen.
export function getAuthData(): { token: string; user: { id: number; email: string; username: string } } | null {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return null;
  }

  try {
    return { token, user: JSON.parse(userStr) };
  } catch {
    return null;
  }
}

// Vid utloggning tar vi bort båda nycklarna så att sessionen försvinner direkt i UI:t.
export function clearAuthData(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}
