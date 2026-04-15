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

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
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
}

export async function registerUser(username: string, email: string): Promise<{ id: number; username: string; email: string }> {
  return requestJson(`${BASE_URL}/api/v1/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email }),
  });
}

export async function loginUser(email: string): Promise<{ token: string; user: { id: number; email: string; username: string } }> {
  const users = await requestJson<Array<{ id: number; email: string; username: string }>>(`${BASE_URL}/api/v1/users`);

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new Error('E-postadressen hittades inte');
  }

  return {
    token: 'demo-token',
    user,
  };
}

export function saveAuthData(token: string, user: { id: number; email: string; username: string }): void {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));
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
