
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import {
  clearAuthSession,
  getStoredSession,
  storeAuthSession,
} from "@/lib/auth-storage";
import {
  AuthUser,
  fetchCurrentUser,
} from "@/lib/auth-api";

interface AuthSession {
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: any | null;
  userRole: string | null;
  loading: boolean;
  isEmailVerified: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resendVerification: () => Promise<boolean>;
  setSessionManually: (token: string, user: AuthUser, rememberMe: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rememberSession, setRememberSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const stored = getStoredSession();
        if (!stored || !stored.token) {
          setLoading(false);
          return;
        }

        setToken(stored.token);
        setRememberSession(stored.rememberMe);

        if (stored.user) {
          setUser(stored.user);
        }

        try {
          const freshUser = await fetchCurrentUser(stored.token);
          setUser(freshUser);
          storeAuthSession({
            token: stored.token,
            user: freshUser,
            rememberMe: stored.rememberMe,
          });
        } catch (error) {
          console.warn("Failed to refresh user session", error);
          clearAuthSession();
          setUser(null);
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const profile = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      role_id: user.roleId,
      role_name: user.roleName,
      is_super_admin: user.isSuperAdmin,
    };
  }, [user]);

  const userRole = useMemo(() => {
    if (!user) return null;
    if (user.isSuperAdmin) return "super_admin";
    return user.roleName || null;
  }, [user]);

  const isEmailVerified = user?.emailVerified ?? true;

  const session = token ? { token } : null;

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const freshUser = await fetchCurrentUser(token);
      setUser(freshUser);
      storeAuthSession({
        token,
        user: freshUser,
        rememberMe: rememberSession,
      });
    } catch (error) {
      console.error("Failed to refresh profile", error);
      toast({
        title: "Session expired",
        description: "Please sign in again.",
        variant: "destructive",
      });
      await signOut();
    }
  };

  const resendVerification = async () => {
    toast({
      title: "Verification email",
      description:
        "Please contact contact@streetcredrx.com to request verification assistance.",
    });
    return false;
  };

  const signOut = async () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
    setRememberSession(false);
    navigate("/auth");
    toast({
      title: "Signed out",
      description: "You have been successfully logged out.",
    });
  };

  const setSessionManually = (
    newToken: string,
    newUser: AuthUser,
    rememberMe: boolean
  ) => {
    setToken(newToken);
    setUser(newUser);
    setRememberSession(rememberMe);
    storeAuthSession({
      token: newToken,
      user: newUser,
      rememberMe,
    });
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    userRole,
    loading,
    isEmailVerified,
    signOut,
    refreshProfile,
    resendVerification,
    setSessionManually,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
