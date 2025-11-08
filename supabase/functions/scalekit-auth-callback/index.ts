// Supabase Edge Function to handle Scalekit OAuth callback
// This securely exchanges the authorization code for tokens using the client secret

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Scalekit } from "npm:@scalekit-sdk/node@latest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, redirectUri } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: "Authorization code is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Scalekit configuration from environment variables
    const environmentUrl = Deno.env.get("SCALEKIT_ENVIRONMENT_URL");
    const clientId = Deno.env.get("SCALEKIT_CLIENT_ID");
    const clientSecret = Deno.env.get("SCALEKIT_CLIENT_SECRET");

    if (!environmentUrl || !clientId || !clientSecret) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Scalekit configuration is missing. Please set environment variables.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Scalekit client
    const scalekit = new Scalekit(environmentUrl, clientId, clientSecret);

    // Exchange authorization code for tokens
    const authResult = await scalekit.authenticateWithCode(
      code,
      redirectUri || `${Deno.env.get("SITE_URL") || "https://streetcredrx1.fly.dev"}/auth/callback`
    );

    // Calculate expiration time (default to 1 hour from now)
    const expiresAt = Date.now() + (authResult.expiresIn || 3600) * 1000;

    return new Response(
      JSON.stringify({
        success: true,
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
        user: authResult.user,
        expiresAt,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Scalekit auth callback error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to authenticate with Scalekit",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

