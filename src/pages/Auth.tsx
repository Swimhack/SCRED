
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { loginRequest, signupRequest } from "@/lib/auth-api";
import { storeAuthSession, clearAuthSession } from "@/lib/auth-storage";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      clearAuthSession();

      const { token, user } = await loginRequest({
        email,
        password,
        rememberMe,
      });

      storeAuthSession({ token, user, rememberMe });

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Unable to sign in. Please try again.",
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
      clearAuthSession();

      const { token, user } = await signupRequest({
        email,
        password,
        firstName,
        lastName,
        rememberMe,
      });

      storeAuthSession({ token, user, rememberMe });

      toast({
        title: "Registration successful",
        description: "Your account has been created. Welcome aboard!",
      });

      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description:
          error.message || "Unable to create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    setPassword("");
    setFirstName("");
    setLastName("");
  };

  const handleForgotPassword = () => {
    toast({
      title: "Contact support",
      description:
        "Password resets are currently handled manually. Please email contact@streetcredrx.com for assistance.",
    });
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
            {isLogin ? (
              <a
                href="/contact"
                className="font-medium text-brand-bittersweet hover:text-brand-bittersweet/80"
              >
                Contact us
              </a>
            ) : (
              <button
                className="font-medium text-brand-bittersweet hover:text-brand-bittersweet/80"
                onClick={handleToggleAuthMode}
              >
                Sign in
              </button>
            )}
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
               className="w-full bg-brand-maize text-black hover:bg-brand-maize/90"
               disabled={loading}
             >
               {loading ? "Processing..." : isLogin ? "Sign in" : "Sign up"}
             </Button>
            {isLogin && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  className="text-sm text-brand-bittersweet hover:text-brand-bittersweet/80"
                  onClick={handleForgotPassword}
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
