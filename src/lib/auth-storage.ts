import type { AuthUser } from "./auth-api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const REMEMBER_ME_KEY = "auth_remember_me";
const REMEMBER_EXPIRES_KEY = "auth_remember_me_expires";
const REMEMBER_DAYS = 30;

export type StorageKind = "local" | "session";

function getStorage(kind: StorageKind) {
  return kind === "local" ? window.localStorage : window.sessionStorage;
}

function getPreferredStorage(): StorageKind {
  if (typeof window === "undefined") {
    return "session";
  }

  const rememberMe = window.localStorage.getItem(REMEMBER_ME_KEY);
  const expiresAt = window.localStorage.getItem(REMEMBER_EXPIRES_KEY);

  if (rememberMe === "true" && expiresAt) {
    const expiryDate = new Date(expiresAt);
    if (expiryDate > new Date()) {
      return "local";
    }

    // Expired
    window.localStorage.removeItem(REMEMBER_ME_KEY);
    window.localStorage.removeItem(REMEMBER_EXPIRES_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }

  return "session";
}

export interface StoredSession {
  token: string;
  user: AuthUser | null;
  storage: StorageKind;
  rememberMe: boolean;
}

export function storeAuthSession(params: {
  token: string;
  user: AuthUser;
  rememberMe: boolean;
}): void {
  if (typeof window === "undefined") return;

  const storageKind: StorageKind = params.rememberMe ? "local" : "session";
  const storage = getStorage(storageKind);

  storage.setItem(TOKEN_KEY, params.token);
  storage.setItem(USER_KEY, JSON.stringify(params.user));

  if (params.rememberMe) {
    const expires = new Date();
    expires.setDate(expires.getDate() + REMEMBER_DAYS);
    window.localStorage.setItem(REMEMBER_ME_KEY, "true");
    window.localStorage.setItem(REMEMBER_EXPIRES_KEY, expires.toISOString());

    // Ensure session storage is cleared
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
  } else {
    window.sessionStorage.setItem(REMEMBER_ME_KEY, "false");
    window.sessionStorage.removeItem(REMEMBER_EXPIRES_KEY);

    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
}

export function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  const storageKind = getPreferredStorage();
  const storage = getStorage(storageKind);

  const token = storage.getItem(TOKEN_KEY);
  if (!token) {
    return null;
  }

  const userRaw = storage.getItem(USER_KEY);
  let user: AuthUser | null = null;

  if (userRaw) {
    try {
      user = JSON.parse(userRaw) as AuthUser;
    } catch (error) {
      console.warn("Failed to parse stored auth user", error);
      user = null;
    }
  }

  return {
    token,
    user,
    storage: storageKind,
    rememberMe: storageKind === "local",
  };
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(REMEMBER_ME_KEY);
  window.localStorage.removeItem(REMEMBER_EXPIRES_KEY);

  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(REMEMBER_ME_KEY);
  window.sessionStorage.removeItem(REMEMBER_EXPIRES_KEY);
}


