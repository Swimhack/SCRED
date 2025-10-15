# Deploy Fixed Edge Function

## What Was Fixed
The Edge Function validation was failing because it wasn't properly handling empty strings and trimming values.

### Changes Made:
1. ✅ Added detailed logging to see what data is received
2. ✅ Fixed validation to properly trim and check values
3. ✅ Added detailed error messages showing which fields are missing
4. ✅ Updated all references to use trimmed values consistently

## How to Deploy

### Option 1: Via Supabase Dashboard (Easiest)

1. **Open Edge Functions in Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions

2. **Click on `send-contact-email` function**

3. **Update the function code**
   - You may need to copy the updated code from:
     `supabase/functions/send-contact-email/index.ts`
   - Paste it into the dashboard editor

4. **Click "Deploy"** button

5. **Wait for deployment** (30-60 seconds)

### Option 2: Via Supabase CLI (If Installed)

```powershell
# Navigate to project directory (already there)
cd "C:\STRICKLAND\Strickland Technology Marketing\streetcredrx.com\streetcredrx1"

# Deploy the function
supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw
```

### Option 3: Install Supabase CLI and Deploy

If you don't have Supabase CLI:

```powershell
# Install Supabase CLI via npm
npm install -g supabase

# OR via Scoop (if you have it)
scoop install supabase

# Then deploy
supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw
```

## What Changed in the Code

### Before:
```typescript
// Simple validation that didn't handle empty strings well
if (!name || !email || !message) {
  return error
}
```

### After:
```typescript
// Proper validation with trimming and detailed logging
const trimmedName = name?.trim()
const trimmedEmail = email?.trim()
const trimmedMessage = message?.trim()

console.log('Validation check:', {
  name: trimmedName,
  email: trimmedEmail,
  message: trimmedMessage ? trimmedMessage.substring(0, 50) : null,
  hasName: !!trimmedName,
  hasEmail: !!trimmedEmail,
  hasMessage: !!trimmedMessage
})

if (!trimmedName || !trimmedEmail || !trimmedMessage) {
  console.error('Validation failed:', {
    name: !trimmedName ? 'missing' : 'ok',
    email: !trimmedEmail ? 'missing' : 'ok',
    message: !trimmedMessage ? 'missing' : 'ok'
  })
  return new Response(
    JSON.stringify({ 
      error: 'Missing required fields',
      details: {
        name: !trimmedName ? 'Name is required' : undefined,
        email: !trimmedEmail ? 'Email is required' : undefined,
        message: !trimmedMessage ? 'Message is required' : undefined
      }
    })
  )
}
```

## After Deployment

### Test the Contact Form
1. Visit: https://streetcredrx1.fly.dev/contact
2. Fill out the form:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Message:** This is a test message
3. Click "Send Message"

### Expected Result
✅ Success message appears
✅ Email arrives at `james@stricklandtm.com`
✅ Submission saved to database

### Check Logs
To see the detailed logging in Supabase:

1. Go to **Edge Functions** → `send-contact-email`
2. Click **"Logs"** tab
3. You'll see:
   ```
   Received request body: {...}
   Validation check: {...}
   Email sent successfully: {...}
   ```

### If It Still Fails
Check the logs for:
- What data was received
- Which validation failed
- Any database or email errors

The new detailed logging will show exactly what's happening!

## Troubleshooting

### "Function not found" or deployment fails
- Make sure you're logged in to Supabase CLI: `supabase login`
- Check project ref is correct: `tvqyozyjqcswojsbduzw`

### Still getting 400 error after deployment
1. Check Edge Function logs for detailed error info
2. Make sure the RESEND_API_KEY secret was added (from previous step)
3. Verify the function was actually redeployed (check timestamp in dashboard)

### Email not sending but form submits
- Check that RESEND_API_KEY is in Supabase Vault
- Check Resend dashboard for bounces: https://resend.com/emails
- Verify recipient email is correct: `james@stricklandtm.com`

## Next Steps After Successful Deployment

1. ✅ **Test the form** multiple times
2. ✅ **Check emails arrive** at james@stricklandtm.com
3. ✅ **Verify database entries** in `contact_submissions` table
4. 🔄 **Optional: Add custom domain** to Resend for production
5. 🔄 **Update recipient** back to `contact@streetcredrx.com` after adding domain

---

**Quick Links:**
- 🎛️ **Edge Functions:** https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions
- 📊 **Database:** https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/editor
- 📧 **Resend Dashboard:** https://resend.com/emails
- 🧪 **Test Form:** https://streetcredrx1.fly.dev/contact
