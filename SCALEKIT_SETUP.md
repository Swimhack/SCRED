# Scalekit Authentication Setup Guide

This application now supports Scalekit authentication alongside the existing Supabase authentication.

## Configuration Steps

### 1. Get Scalekit Credentials

1. Sign up for a Scalekit account at https://www.scalekit.com/
2. Navigate to the **API Config** section in your Scalekit Dashboard
3. Copy the following values:
   - Environment URL
   - Client ID
   - Client Secret

### 2. Set Environment Variables

#### Frontend (Vite) Environment Variables

Create a `.env` file in the `streetcredrx1` directory with:

```env
VITE_SCALEKIT_ENVIRONMENT_URL=your_scalekit_environment_url
VITE_SCALEKIT_CLIENT_ID=your_scalekit_client_id
VITE_SCALEKIT_REDIRECT_URI=http://localhost:5173/auth/callback
```

For production deployments:

**Netlify:**
- Go to Site settings > Environment variables
- Add the variables with `VITE_` prefix

**Fly.io:**
- Set secrets: `fly secrets set VITE_SCALEKIT_ENVIRONMENT_URL=... VITE_SCALEKIT_CLIENT_ID=...`

#### Backend (Supabase Edge Function) Environment Variables

In your Supabase Dashboard:

1. Go to Project Settings > Edge Functions
2. Add the following secrets:
   - `SCALEKIT_ENVIRONMENT_URL` - Your Scalekit environment URL
   - `SCALEKIT_CLIENT_ID` - Your Scalekit client ID
   - `SCALEKIT_CLIENT_SECRET` - Your Scalekit client secret (keep this secure!)

### 3. Configure Scalekit Redirect URI

In your Scalekit Dashboard:

1. Go to **Redirect URIs** settings
2. Add your callback URLs:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

### 4. Deploy the Edge Function

Deploy the Scalekit auth callback function to Supabase:

```bash
cd streetcredrx1
supabase functions deploy scalekit-auth-callback
```

## How It Works

1. **User clicks "Sign in with Scalekit"** on the auth page
2. **Redirects to Scalekit** hosted login page
3. **User authenticates** via Scalekit (supports passwordless, social logins, SSO)
4. **Scalekit redirects back** to `/auth/callback` with authorization code
5. **Frontend calls Supabase Edge Function** to exchange code for tokens securely
6. **Session is stored** and user is logged in
7. **User profile is synced** with Supabase profiles table for compatibility

## Features

- ✅ OAuth 2.0 compliant authentication flow
- ✅ Secure token exchange via backend (client secret never exposed)
- ✅ Session management with automatic expiration
- ✅ Compatible with existing Supabase profile system
- ✅ Supports both Scalekit and Supabase authentication simultaneously
- ✅ Automatic profile creation for Scalekit users

## Authentication Methods Supported

Scalekit supports:
- Passwordless authentication
- Social logins (Google, Microsoft, etc.)
- Enterprise SSO (SAML, OIDC)
- Email/password

Configure these in your Scalekit Dashboard under **Authentication Methods**.

## Troubleshooting

### "Scalekit is not configured" error
- Ensure environment variables are set correctly
- Check that variables start with `VITE_` for frontend
- Verify the values match your Scalekit Dashboard

### Callback not working
- Verify redirect URI matches exactly in Scalekit Dashboard
- Check that the Edge Function is deployed
- Ensure Edge Function secrets are set in Supabase

### Session not persisting
- Check browser localStorage permissions
- Verify session expiration time
- Check browser console for errors

## Security Notes

- The client secret is **never** exposed to the frontend
- Token exchange happens securely via Supabase Edge Function
- OAuth state parameter prevents CSRF attacks
- Sessions expire automatically for security

