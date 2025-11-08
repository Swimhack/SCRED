import jwt from "jsonwebtoken";

const DEFAULT_TOKEN_TTL = "12h";
const REMEMBER_ME_TTL = "30d";

const jwtSecret = process.env.JWT_SECRET || "development-secret-change-me";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role?: string | null;
  rememberMe?: boolean;
}

export function signAuthToken(
  payload: AuthTokenPayload,
  rememberMe?: boolean
): string {
  const expiresIn = rememberMe ? REMEMBER_ME_TTL : DEFAULT_TOKEN_TTL;
  return jwt.sign(
    {
      sub: payload.sub,
      email: payload.email,
      role: payload.role ?? null,
      rememberMe: rememberMe ?? false,
    },
    jwtSecret,
    { expiresIn }
  );
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
  return {
    sub: decoded.sub as string,
    email: decoded.email as string,
    role: (decoded.role as string | null) ?? null,
    rememberMe: Boolean(decoded.rememberMe),
  };
}


