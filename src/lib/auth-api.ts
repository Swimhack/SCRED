export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleId: number | null;
  roleName: string | null;
  isSuperAdmin: boolean;
  emailVerified: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  message?: string;
  user?: AuthUser;
  token?: string;
  data?: T;
}

const DEFAULT_BASE =
  "https://streetcredrx1.fly.dev/api";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  DEFAULT_BASE;

const endpoints = {
  login: `${API_BASE}/auth-login`,
  signup: `${API_BASE}/auth-signup`,
  me: `${API_BASE}/auth-me`,
};

async function request<T>(
  url: string,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  const text = await response.text();
  let json: ApiResponse<T>;

  try {
    json = text ? (JSON.parse(text) as ApiResponse<T>) : { success: false };
  } catch (error) {
    console.error("Failed to parse auth API response:", error, text);
    throw new Error("Unexpected response from authentication service");
  }

  if (!response.ok || !json.success) {
    const errorMessage =
      json.error ||
      json.message ||
      `Authentication request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return json;
}

export async function loginRequest(params: {
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<{ token: string; user: AuthUser }> {
  const response = await request<AuthUser>(endpoints.login, {
    method: "POST",
    body: JSON.stringify(params),
  });

  if (!response.token || !response.user) {
    throw new Error("Invalid response from authentication service");
  }

  return { token: response.token, user: response.user };
}

export async function signupRequest(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  rememberMe: boolean;
}): Promise<{ token: string; user: AuthUser }> {
  const response = await request<AuthUser>(endpoints.signup, {
    method: "POST",
    body: JSON.stringify(params),
  });

  if (!response.token || !response.user) {
    throw new Error("Invalid response from authentication service");
  }

  return { token: response.token, user: response.user };
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  const response = await request<AuthUser>(endpoints.me, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.user) {
    throw new Error("Invalid response from authentication service");
  }

  return response.user;
}

export function getApiBaseUrl() {
  return API_BASE;
}


