# 🔧 Fix "Invalid JWT" Error

## Problem
The Edge Functions are returning `401 Unauthorized` with message "Invalid JWT"

## Root Cause
The Edge Functions are not configured to accept anonymous (public) requests, or the JWT verification is failing.

## Solutions

### Solution 1: Check Supabase Edge Function Auth Settings

1. Go to your Supabase dashboard:
   https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions

2. For EACH function (`send-email` and `send-contact-email`):
   - Click on the function name
   - Look for "Verify JWT" or "Auth required" setting
   - **Make sure JWT verification is DISABLED** or set to allow anonymous access

### Solution 2: Verify API Keys Match

Run this in PowerShell to check your current anon key:

```powershell
Get-Content .env | Select-String "ANON_KEY"
```

Expected output should contain:
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Solution 3: Check Function Deployment Status

1. Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions

2. Verify these functions show as "Active":
   - `send-email`
   - `send-contact-email`

3. If they show errors or are not deployed, you may need to redeploy them

###  Solution 4: Test from Your Live App

The JWT error might only occur when testing externally. Try testing from your actual application:

1. Go to: https://streetcredrx1.fly.dev
2. Try to submit the contact form
3. Check if it works from within the app

### Solution 5: Update Edge Function to Allow Anonymous Access

The Edge Functions need to be configured to NOT require JWT verification for public endpoints like contact forms.

#### Check your Edge Function code:

File: `supabase/functions/send-email/index.ts`

The function should have CORS headers like this (which it does):
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

And should handle OPTIONS requests (which it does):
```typescript
if (req.method === "OPTIONS") {
  return new Response(null, { headers: corsHeaders });
}
```

### Solution 6: Check if Functions Need Service Role Key

Some functions might require the service role key instead of the anon key. Let's test with service role:

**⚠️ WARNING: Never expose service role key in client-side code!**

This is ONLY for testing from a secure environment (like your local machine):

```powershell
$SUPABASE_URL = "https://tvqyozyjqcswojsbduzw.supabase.co"
$SERVICE_ROLE_KEY = "YOUR_SERVICE_ROLE_KEY_HERE"  # Get from Supabase settings

$body = @{
    type = "welcome"
    to = "james@ekaty.com"
    firstName = "James"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$SUPABASE_URL/functions/v1/send-email" `
    -Method Post `
    -Headers @{
        "Authorization" = "Bearer $SERVICE_ROLE_KEY"
        "Content-Type" = "application/json"
    } `
    -Body $body
```

### Solution 7: Check Supabase Project Auth Settings

1. Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/auth

2. Look for these settings:
   - **"Enable anonymous sign-ins"** - Should be enabled if you want public access
   - **"Disable email confirmations"** - For testing, you might want this on

###  Solution 8: Verify Edge Function is Receiving Requests

Check the function logs to see if requests are even reaching the function:

1. Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions
2. Click on `send-email`
3. Click "Logs" tab
4. Run the test again
5. Check if any logs appear

If NO logs appear → The request isn't reaching the function (network/CORS issue)
If logs appear with JWT error → The function is rejecting the auth

### Solution 9: Alternative - Test Contact Form from Live Site

Instead of testing the Edge Functions directly, test through your actual application:

1. Go to: https://streetcredrx1.fly.dev/contact
2. Fill out and submit the contact form
3. Check if the email is sent

The app uses the same Edge Functions but with proper context and auth.

### Solution 10: Temporary Workaround - Deploy Functions Without JWT Check

If the functions are requiring JWT auth when they shouldn't, you can temporarily modify them:

**File: `supabase/functions/send-email/index.ts`**

Add this near the top of the handler function (after OPTIONS check):

```typescript
// For testing - remove JWT requirement
// REMOVE THIS AFTER TESTING
if (req.method === "OPTIONS") {
  return new Response(null, { headers: corsHeaders });
}

// Skip JWT validation for now
// const authHeader = req.headers.get("Authorization");
// if (!authHeader) {
//   return new Response(JSON.stringify({ error: "No authorization header" }), {
//     status: 401,
//     headers: { ...corsHeaders, "Content-Type": "application/json" },
//   });
// }
```

Then redeploy the function.

## Recommended Next Steps

1. **First**, check if the functions work from your live application (Solution 9)
2. **If that works**, the issue is just with external testing - which is fine!
3. **If that doesn't work**, check function logs (Solution 8)
4. **Then** check Edge Function auth settings (Solution 1)

## Quick Test from Live App

The easiest way to verify everything works:

1. Open: https://streetcredrx1.fly.dev/contact
2. Fill out the contact form
3. Submit it
4. Check `contact@streetcredrx.com` for the notification email
5. Check your inbox for confirmation

If this works, then Resend is configured correctly and the JWT issue is only affecting external testing!

## Still Not Working?

If none of the above solutions work, the issue might be:

1. **Edge Functions not deployed** - Redeploy them via Supabase dashboard
2. **Resend API key not set** - Double-check it's added to secrets as `RESEND_API_KEY`
3. **Network/firewall issue** - Try from a different network
4. **Supabase project issue** - Contact Supabase support

## Contact Support

If you've tried everything above:

- **Supabase Support**: https://supabase.com/support
- **Resend Support**: https://resend.com/support
- **Check Supabase Status**: https://status.supabase.com

---

**TL;DR**: The JWT error usually means the Edge Functions are configured to require authentication when they should allow anonymous access. The quickest fix is to test from your actual application at https://streetcredrx1.fly.dev/contact instead of testing the API directly.
