export type ApiResponse<T> = {
  data: T;
  error?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<ApiResponse<T>> {
  const url = typeof input === 'string' && !input.startsWith('http') ? apiUrl(input) : input;

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      credentials: "include",
    });

    const text = await res.text();
    if (!res.ok) {
      let message = text;
      try {
        const body = JSON.parse(text);
        message = body?.message ?? JSON.stringify(body);
      } catch {
        // ignore
      }
      return { data: null as any, error: message || "Request failed" };
    }

    const data = text ? (JSON.parse(text) as T) : ({} as T);
    return { data, error: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { data: null as any, error: message || "Network request failed" };
  }
}

export function getAuthToken() {
  return localStorage.getItem("dabbaToken");
}

export function setAuthToken(token: string) {
  localStorage.setItem("dabbaToken", token);
}

export function clearAuthToken() {
  localStorage.removeItem("dabbaToken");
}

export function buildAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}
