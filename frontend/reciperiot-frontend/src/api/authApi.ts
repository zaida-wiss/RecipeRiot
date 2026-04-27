// Vi använder fetch här i stället för axios eftersom den här wrappern redan hanterar timeout och fel. Byt till axios först om vi behöver interceptors, retries eller gemensam auth-hantering för många requests.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';
const API_TIMEOUT = 10000;

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
    const data = await response.json();
    return data.message || `Fel (${response.status})`;
  } catch {
    return `Fel (${response.status})`;
  }
}

function isNetworkFailure(error: unknown): error is Error {
  return error instanceof Error && (error.name === 'AbortError' || error.message === 'Failed to fetch');
}

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

  return (
    user.email.toLowerCase() === normalizedIdentifier ||
    user.username.toLowerCase() === normalizedIdentifier
  );
}

export async function registerUser(payload: { username: string; email: string }): Promise<{ id: number; username: string; email: string }> {
  const { username, email } = payload;

  return requestJson(`${BASE_URL}/api/v1/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email }),
  });
}

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

export function saveAuthData(auth: { token: string; user: { id: number; email: string; username: string } }): void {
  localStorage.setItem('authToken', auth.token);
  localStorage.setItem('user', JSON.stringify(auth.user));
}

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

export function clearAuthData(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}
