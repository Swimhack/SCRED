# Deploy Edge Function to Fix Contact Form

## Problem
The contact form is not working because the `send-contact-email` Edge Function is not deployed to Supabase.

## Solution - Option 1: Deploy via Command Line (Recommended)

### Step 1: Get your Supabase Access Token
1. Go to https://supabase.com/dashboard/account/tokens
2. Click "Generate New Token"
3. Give it a name like "CLI Access"
4. Copy the token

### Step 2: Deploy the Edge Function
Run this command (replace YOUR_TOKEN with the token from step 1):

```powershell
$env:SUPABASE_ACCESS_TOKEN="YOUR_TOKEN"
npx supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw
```

Or in one line:
```powershell
npx supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw --token YOUR_TOKEN
```

### Step 3: Verify the Resend API Key
1. Go to https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions
2. Click on "Edge Function Secrets"
3. Make sure `RESEND_API_KEY` is set
4. If not, add it with your Resend API key

### Step 4: Test
1. Visit https://streetcredrx1.fly.dev/contact
2. Fill out the contact form
3. Submit it
4. You should see "Message sent!" instead of the email client opening

---

## Solution - Option 2: Deploy via Supabase Dashboard

### Step 1: Access the Dashboard
1. Go to https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions
2. Click "Create a new function" or "Deploy"

### Step 2: Create/Update the Function
1. Name: `send-contact-email`
2. Copy the entire content from `supabase/functions/send-contact-email/index.ts`
3. Paste it into the editor
4. Click "Deploy"

### Step 3: Set Environment Variables
1. Go to Settings → Edge Functions
2. Add these secrets:
   - `RESEND_API_KEY`: Your Resend API key
   - `SUPABASE_URL`: https://tvqyozyjqcswojsbduzw.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY`: (from your project settings)

---

## Quick Test After Deployment

Run this PowerShell script to test:

```powershell
.\test-edge-function.ps1
```

You should see "SUCCESS!" instead of "404 NOT FOUND".

---

## Files Involved
- Edge Function: `supabase/functions/send-contact-email/index.ts`
- Contact Form: `src/pages/Contact.tsx`
- Homepage Form: `src/pages/Index.tsx`
- Test Script: `test-edge-function.ps1`




