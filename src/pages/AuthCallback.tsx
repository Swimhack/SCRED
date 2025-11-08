import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { verifyAuthState, storeScalekitSession } from '@/integrations/scalekit/client';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth errors
        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }

        if (!code) {
          throw new Error('Authorization code not found');
        }

        if (!state || !verifyAuthState(state)) {
          throw new Error('Invalid state parameter. Possible CSRF attack.');
        }

        // Exchange authorization code for tokens
        // Note: This should ideally be done on the backend for security
        // For now, we'll call a Supabase Edge Function to handle this securely
        const { data, error: exchangeError } = await supabase.functions.invoke('scalekit-auth-callback', {
          body: {
            code,
            redirectUri: window.location.origin + '/auth/callback',
          },
        });

        if (exchangeError) {
          throw exchangeError;
        }

        if (!data || !data.success) {
          throw new Error(data?.error || 'Failed to authenticate');
        }

        // Store session
        storeScalekitSession({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          expiresAt: data.expiresAt,
        });

        // Sync user with Supabase profile if needed
        // This ensures compatibility with existing profile system
        if (data.user?.email) {
          try {
            // Check if user exists in Supabase
            const { data: existingUser } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', data.user.email)
              .maybeSingle();

            if (!existingUser && data.user.email) {
              // Create profile if doesn't exist
              await supabase.from('profiles').insert({
                id: data.user.id || data.user.sub,
                email: data.user.email,
                first_name: data.user.given_name || data.user.first_name || '',
                last_name: data.user.family_name || data.user.last_name || '',
              });
            }
          } catch (profileError) {
            console.warn('Profile sync error:', profileError);
            // Non-critical error, continue with login
          }
        }

        toast({
          title: 'Authentication successful',
          description: 'Welcome to StreetCredRx!',
        });

        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        toast({
          title: 'Authentication failed',
          description: err.message || 'An error occurred during authentication',
          variant: 'destructive',
        });
        navigate('/auth', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-bittersweet mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-brand-maize text-black px-6 py-2 rounded-full"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;

