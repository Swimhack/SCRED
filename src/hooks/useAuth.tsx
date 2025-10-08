
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import featureFlags from "@/lib/featureFlags";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  userRole: string | null;
  loading: boolean;
  isEmailVerified: boolean;
  signOut: () => Promise<void>;
  refreshProfile: (userId: string) => Promise<void>;
  resendVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();

  // Check and clean up expired remember me preferences on app start
  useEffect(() => {
    const rememberMe = localStorage.getItem('supabase_remember_me');
    const expiresAt = localStorage.getItem('supabase_remember_me_expires');
    
    if (rememberMe === 'true' && expiresAt) {
      const expiryDate = new Date(expiresAt);
      const now = new Date();
      
      if (now >= expiryDate) {
        // Clean up expired remember me preference
        localStorage.removeItem('supabase_remember_me');
        localStorage.removeItem('supabase_remember_me_expires');
        // Also clear any existing session data if it was in localStorage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsEmailVerified(currentSession?.user?.email_confirmed_at ? true : false);
        
        // Wait before fetching profile to avoid potential deadlocks
        if (currentSession?.user) {
          setTimeout(async () => {
            await fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
          setIsEmailVerified(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsEmailVerified(currentSession?.user?.email_confirmed_at ? true : false);
      
      if (currentSession?.user) {
        await fetchUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // For now, provide a default profile if there's an error
      // This prevents the app from crashing when profile fetching fails
      
      try {
        // Attempt to fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, roles(name)')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileError) throw profileError;
        
        if (profileData) {
          setProfile(profileData);
          // Use simplified role system based on feature flags
          const rawRole = profileData.roles?.name || "user";
          const simplifiedRole = featureFlags.isMvp 
            ? (rawRole === "super_admin" || rawRole === "admin_manager" || rawRole === "admin_regional" ? "admin" : "pharmacist")
            : rawRole;
          setUserRole(simplifiedRole);
        }
      } catch (error: any) {
        console.error("Error fetching user profile:", error.message);
        
        // Instead of failing, set a default profile
        setProfileError(true);
        
        // Set default user role to prevent blocking access
        setUserRole(featureFlags.isMvp ? "pharmacist" : "user");
        
        // Create a basic profile with available user data
        if (user) {
          setProfile({
            id: userId,
            email: user.email,
            first_name: user.user_metadata?.first_name || "",
            last_name: user.user_metadata?.last_name || "",
          });
        }
        
        // Show non-blocking toast
        toast({
          title: "Profile Issue",
          description: "Using default profile settings. Some features might be limited.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Fatal auth error:", error.message);
      setLoading(false);
    }
  };

  const refreshProfile = async (userId: string) => {
    await fetchUserProfile(userId);
  };

  const resendVerification = async (): Promise<boolean> => {
    if (!user?.email) return false;
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: "https://streetcredrx.netlify.app/dashboard"
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error resending verification:", error);
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      await supabase.auth.signOut({ scope: 'global' });
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRole(null);
      setIsEmailVerified(false);
      
      navigate("/auth");
      
      toast({
        title: "Signed out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error("Error signing out:", error.message);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    profile,
    userRole,
    loading,
    isEmailVerified,
    signOut,
    refreshProfile,
    resendVerification
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
