// =====================================================
// 🔹 TYPDEFINITIONER (Interfaces)
// =====================================================

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface RegisterDto {
  username: string;
  email: string;
}

export interface LoginDto {
  email: string;
}

export interface AuthData {
  token: string;
  user: User;
}

// =====================================================
// 🔹 KONFIGURATION
// =====================================================

const USE_MOCK = true;
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";
const API_TIMEOUT = 10000;

// =====================================================
// 🔹 INTERNA HJÄLPFUNKTIONER
// =====================================================

const mockDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.message === "Failed to fetch")
  );
}

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
      throw new Error(await getResponseErrorMessage(response));
    }

    return response.json();
  } catch (error) {
    if (isNetworkError(error)) {
      throw new Error("Kunde inte ansluta till servern");
    }
    throw error;
  }
}

// =====================================================
// 🔹 MOCK DATA & LOGIK
// =====================================================

const mockUsers: User[] = [
  { id: 1, email: "test@test.com", username: "TestUser" },
  { id: 2, email: "admin@test.com", username: "AdminUser" },
];

async function mockRegisterUser(data: RegisterDto): Promise<User> {
  await mockDelay(500);
  if (mockUsers.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("E-postadressen används redan");
  }
  const newUser: User = { id: mockUsers.length + 1, ...data };
  mockUsers.push(newUser);
  return newUser;
}

async function mockLoginUser(data: LoginDto): Promise<AuthData> {
  await mockDelay(500);
  const user = mockUsers.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (!user) throw new Error("E-postadressen hittades inte");
  return { token: "mock-token", user };
}

// =====================================================
// 🔹 PUBLIC API (Exporterade funktioner)
// =====================================================

export async function registerUser(data: RegisterDto): Promise<User> {
  if (USE_MOCK) return mockRegisterUser(data);

  return requestJson(`${BASE_URL}/api/v1/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: LoginDto): Promise<AuthData> {
  if (USE_MOCK) return mockLoginUser(data);

  const users = await requestJson<User[]>(`${BASE_URL}/api/v1/users`);
  const user = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());

  if (!user) throw new Error("E-postadressen hittades inte");
  return { token: "demo-token", user };
}

// =====================================================
// 🔹 LOCAL STORAGE HANTERING
// =====================================================

export function saveAuthData(data: AuthData): void {
  localStorage.setItem("authToken", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function getAuthData(): AuthData | null {
  const token = localStorage.getItem("authToken");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) return null;

  try {
    return { token, user: JSON.parse(userStr) };
  } catch {
    return null;
  }
}

export function clearAuthData(): void {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
}