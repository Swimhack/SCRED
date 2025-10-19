# Quick Fix: Deploy Edge Function

Your contact form is showing this error:
> **Error: Email service error: Failed to send a request to the Edge Function**

This is because the `send-contact-email` Edge Function is not deployed to Supabase.

## 🚀 Quick Fix (2 minutes)

### Method 1: PowerShell Script (Easiest)

1. Run this script:
   ```powershell
   .\deploy-edge-function.ps1
   ```

2. When prompted, get your Supabase Access Token:
   - The script will open https://supabase.com/dashboard/account/tokens
   - Click "Generate New Token"
   - Copy the token
   - Paste it back in the terminal

3. The script will deploy and test automatically

---

### Method 2: Manual Command

```powershell
# Replace YOUR_TOKEN_HERE with your actual token from:
# https://supabase.com/dashboard/account/tokens

npx supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw --token YOUR_TOKEN_HERE
```

After deployment, test with:
```powershell
.\test-edge-function.ps1
```

---

### Method 3: Supabase Dashboard (No CLI needed)

If the CLI isn't working, you can deploy directly in the dashboard:

1. **Go to Functions Dashboard:**
   - Visit: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions

2. **Check if function exists:**
   - Look for `send-contact-email` in the list
   - If it exists but isn't working, redeploy it
   - If it doesn't exist, create it

3. **Create/Update the function:**
   - Click "Create a new function" or select existing
   - Name: `send-contact-email`
   - Copy the code from: `supabase/functions/send-contact-email/index.ts`
   - Paste into the editor
   - Click "Deploy function"

4. **Set Environment Variables:**
   - Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions
   - Under "Edge Function Secrets", add:
     - `RESEND_API_KEY`: (your Resend API key)
     - `SUPABASE_URL`: `https://tvqyozyjqcswojsbduzw.supabase.co`
     - `SUPABASE_SERVICE_ROLE_KEY`: (from Settings → API)

---

## ✅ Verify It's Working

1. **Test the function directly:**
   ```powershell
   .\test-edge-function.ps1
   ```
   Should show "SUCCESS!" instead of "404 NOT FOUND"

2. **Test the contact form:**
   - Visit: https://streetcredrx1.fly.dev/contact
   - Fill out the form
   - Submit
   - Should see "Message sent!" ✅
   - NOT "Opening email client..." ❌

3. **Check Resend Dashboard:**
   - Visit: https://resend.com/emails
   - You should see the test email

---

## 🔍 Troubleshooting

### If you still get errors after deploying:

**Check Supabase Function Logs:**
```
https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions/send-contact-email/logs
```

**Verify Resend API Key is set:**
```
https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions
```

**Check browser console:**
- Press F12 on the contact page
- Look for errors in Console tab
- Check Network tab for the Edge Function request

---

## 📋 What This Will Fix

- ✅ Contact form on `/contact` page will send emails via Resend
- ✅ Investor inquiry form on homepage will send emails via Resend
- ✅ Emails will go to `contact@streetcredrx.com`
- ✅ Submissions saved to `contact_submissions` database table
- ✅ No more "Opening email client..." messages

---

## Need Help?

The Edge Function code is ready and working - it just needs to be deployed to Supabase. Once deployed, everything will work automatically!

**Files:**
- Edge Function: `supabase/functions/send-contact-email/index.ts`
- Test Script: `test-edge-function.ps1`
- Deploy Script: `deploy-edge-function.ps1`





