
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for password reset mode or invitation on component mount
  useEffect(() => {
    const mode = searchParams.get('mode');
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const inviteToken = searchParams.get('invite');
    
    if (mode === 'reset') {
      setShowPasswordReset(true);
    }
    
    // Handle invitation acceptance
    if (inviteToken) {
      handleInvitationAcceptance(inviteToken);
    }
    
    // Handle email verification confirmation
    if (accessToken && refreshToken) {
      handleEmailVerification(accessToken, refreshToken);
    }
  }, [searchParams]);

  const handleEmailVerification = async (accessToken: string, refreshToken: string) => {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) throw error;
      
      if (data.user?.email_confirmed_at) {
        toast({
          title: "Email verified successfully",
          description: "Your email has been confirmed. Welcome!",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Email verification error:", error);
      toast({
        title: "Email verification failed",
        description: error.message || "Please try signing in again.",
        variant: "destructive",
      });
    }
  };

  const handleInvitationAcceptance = async (token: string) => {
    try {
      // Get invitation details
      const { data: invitation, error: inviteError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (inviteError || !invitation) {
        toast({
          title: "Invalid Invitation",
          description: "This invitation link is invalid or has expired.",
          variant: "destructive",
        });
        return;
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        toast({
          title: "Invitation Expired",
          description: "This invitation has expired. Please contact an administrator.",
          variant: "destructive",
        });
        return;
      }

      // Check if already accepted
      if (invitation.accepted_at) {
        toast({
          title: "Invitation Already Accepted",
          description: "This invitation has already been used.",
          variant: "destructive",
        });
        return;
      }

      // Pre-populate email and show signup form
      setEmail(invitation.email);
      setIsLogin(false);
      
      toast({
        title: "Welcome to StreetCredRX",
        description: "Please complete your registration below.",
      });
    } catch (error: any) {
      console.error('Invitation error:', error);
      toast({
        title: "Error",
        description: "Failed to process invitation",
        variant: "destructive",
      });
    }
  };

  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      cleanupAuthState();
      
      // Attempt global sign out to clear any existing sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Configure storage based on remember me preference
      const storageType = rememberMe ? localStorage : sessionStorage;
      
      // Create a new client instance with the appropriate storage
      const { createClient } = await import('@supabase/supabase-js');
      const tempClient = createClient(
        "https://tvqyozyjqcswojsbduzw.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cXlvenlqcWNzd29qc2JkdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzIyMzUsImV4cCI6MjA2MzEwODIzNX0.MJl1EtbDCjzT5PvBxoA7j4_4iM_FtX_1IjcDexcwz9Y",
        {
          auth: {
            storage: storageType,
            persistSession: true,
            autoRefreshToken: true,
          }
        }
      );
      
      const { data, error } = await tempClient.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('supabase_remember_me', 'true');
          // Set a 30-day expiry for the preference
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          localStorage.setItem('supabase_remember_me_expires', expiryDate.toISOString());
        } else {
          localStorage.removeItem('supabase_remember_me');
          localStorage.removeItem('supabase_remember_me_expires');
        }
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      cleanupAuthState();
      
      // Attempt global sign out to clear any existing sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      // Check if this is an invitation signup
      const inviteToken = searchParams.get('invite');
      let inviteData = null;
      
      if (inviteToken) {
        // Get invitation details
        const { data: invitation, error: inviteError } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('token', inviteToken)
          .single();

        if (inviteError || !invitation) {
          toast({
            title: "Invalid Invitation",
            description: "This invitation link is invalid or has expired.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Check if invitation is expired
        if (new Date(invitation.expires_at) < new Date()) {
          toast({
            title: "Invitation Expired",
            description: "This invitation has expired. Please contact an administrator.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Check if already accepted
        if (invitation.accepted_at) {
          toast({
            title: "Invitation Already Accepted",
            description: "This invitation has already been used.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        inviteData = invitation;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            invited_role_id: inviteData?.role_id
          },
          emailRedirectTo: "https://streetcredrx.lovable.app/dashboard"
        }
      });
      
      if (error) throw error;
      
      if (data.user && inviteData) {
        // Mark invitation as accepted
        await supabase
          .from('user_invitations')
          .update({ 
            accepted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('token', inviteToken);

        // Update user profile with invited role
        await supabase
          .from('profiles')
          .update({ role_id: inviteData.role_id })
          .eq('id', data.user.id);
      }
      
      if (data.user) {
        toast({
          title: "Registration successful",
          description: inviteData 
            ? "Welcome to StreetCredRX! Your account has been created with the assigned role."
            : "Please check your email for a verification link.",
        });
        // Switch to login view after successful signup
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: "https://streetcredrx.lovable.app/auth?mode=reset",
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions.",
      });
      
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setPasswordResetLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated successfully",
        description: "You can now sign in with your new password.",
      });
      
      // Redirect to login after successful password reset
      setShowPasswordReset(false);
      setIsLogin(true);
      setNewPassword("");
      setConfirmPassword("");
      
      // Remove the mode parameter from URL
      navigate("/auth", { replace: true });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setPasswordResetLoading(false);
    }
  };

  if (showPasswordReset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Set your new password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please enter your new password below
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  minLength={6}
                />
              </div>
            </div>
            <div>
              <Button
                type="submit"
                className="w-full mb-4"
                disabled={passwordResetLoading}
              >
                {passwordResetLoading ? "Updating..." : "Update Password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowPasswordReset(false);
                  navigate("/auth", { replace: true });
                }}
              >
                Back to login
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email address and we'll send you a reset link
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email</Label>
              <Input
                id="resetEmail"
                name="resetEmail"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <Button
                type="submit"
                className="w-full mb-4"
                disabled={resetLoading}
              >
                {resetLoading ? "Sending..." : "Send reset link"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to login
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              className="font-medium text-blue-600 hover:text-blue-500"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={isLogin ? handleSignIn : handleSignUp}>
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
           </div>
           {isLogin && (
             <div className="flex items-center space-x-2">
               <Checkbox
                 id="rememberMe"
                 checked={rememberMe}
                 onCheckedChange={(checked) => setRememberMe(checked as boolean)}
               />
               <Label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                 Remember me for 30 days
               </Label>
             </div>
           )}
           <div>
             <Button
               type="submit"
               className="w-full"
               disabled={loading}
             >
               {loading ? "Processing..." : isLogin ? "Sign in" : "Sign up"}
             </Button>
            {isLogin && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
