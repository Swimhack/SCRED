// Scalekit client configuration
// Note: Scalekit primarily uses server-side OAuth flows
// For frontend integration, we'll use redirect-based authentication

export interface ScalekitConfig {
  environmentUrl: string;
  clientId: string;
  redirectUri: string;
}

// Get Scalekit configuration from environment variables
export const getScalekitConfig = (): ScalekitConfig => {
  const environmentUrl = import.meta.env.VITE_SCALEKIT_ENVIRONMENT_URL || '';
  const clientId = import.meta.env.VITE_SCALEKIT_CLIENT_ID || '';
  const redirectUri = import.meta.env.VITE_SCALEKIT_REDIRECT_URI || `${window.location.origin}/auth/callback`;

  return {
    environmentUrl,
    clientId,
    redirectUri,
  };
};

// Check if Scalekit is configured
export const isScalekitConfigured = (): boolean => {
  const config = getScalekitConfig();
  return !!(config.environmentUrl && config.clientId);
};

// Generate authorization URL for Scalekit login
export const getScalekitAuthorizationUrl = (options?: {
  organizationId?: string;
  connectionId?: string;
  loginHint?: string;
  state?: string;
}): string => {
  const config = getScalekitConfig();
  
  if (!isScalekitConfigured()) {
    throw new Error('Scalekit is not configured. Please set VITE_SCALEKIT_ENVIRONMENT_URL and VITE_SCALEKIT_CLIENT_ID environment variables.');
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state: options?.state || generateRandomState(),
  });

  if (options?.organizationId) {
    params.append('organization_id', options.organizationId);
  }

  if (options?.connectionId) {
    params.append('connection_id', options.connectionId);
  }

  if (options?.loginHint) {
    params.append('login_hint', options.loginHint);
  }

  // Scalekit authorization endpoint
  const authUrl = `${config.environmentUrl}/oauth/authorize`;
  return `${authUrl}?${params.toString()}`;
};

// Generate random state for OAuth security
const generateRandomState = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Store state in sessionStorage for callback verification
export const storeAuthState = (state: string): void => {
  sessionStorage.setItem('scalekit_auth_state', state);
};

// Verify and retrieve stored state
export const verifyAuthState = (state: string): boolean => {
  const storedState = sessionStorage.getItem('scalekit_auth_state');
  if (storedState && storedState === state) {
    sessionStorage.removeItem('scalekit_auth_state');
    return true;
  }
  return false;
};

// Store user session after successful authentication
export const storeScalekitSession = (sessionData: {
  accessToken: string;
  refreshToken?: string;
  user: any;
  expiresAt?: number;
}): void => {
  localStorage.setItem('scalekit_session', JSON.stringify({
    ...sessionData,
    expiresAt: sessionData.expiresAt || Date.now() + 3600000, // Default 1 hour
  }));
};

// Get stored Scalekit session
export const getScalekitSession = (): {
  accessToken: string;
  refreshToken?: string;
  user: any;
  expiresAt: number;
} | null => {
  const sessionStr = localStorage.getItem('scalekit_session');
  if (!sessionStr) return null;

  try {
    const session = JSON.parse(sessionStr);
    // Check if session is expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      clearScalekitSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

// Clear Scalekit session
export const clearScalekitSession = (): void => {
  localStorage.removeItem('scalekit_session');
  sessionStorage.removeItem('scalekit_auth_state');
};

