# 🚀 Quick Email Notifications Setup

## TL;DR - What You Need to Do

1. **Get Resend API Key** (5 minutes)
2. **Add it to Supabase** (2 minutes)
3. **Deploy Functions** (optional, if using CLI)
4. **Test** (2 minutes)

---

## Step 1: Get Resend API Key (Free)

1. Go to: **https://resend.com/signup**
2. Sign up (it's free!)
3. Once logged in, go to: **https://resend.com/api-keys**
4. Click **"Create API Key"**
5. Name it: `StreetCredRX`
6. Copy the key (starts with `re_`)

**Example key**: `re_123abc456def789ghi012jkl345mno`

---

## Step 2: Add Key to Supabase

### Option A: Via Dashboard (Easiest!)

1. Go to: **https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions**
2. Scroll down to **"Secrets"** section
3. Click **"Add new secret"**
4. Name: `RESEND_API_KEY`
5. Value: Paste your Resend API key
6. Click **"Save"**

✅ Done! Functions will automatically use this key.

### Option B: Via CLI (If you have it installed)

```powershell
supabase secrets set RESEND_API_KEY=re_your_key_here --project-ref tvqyozyjqcswojsbduzw
```

---

## Step 3: Verify Functions are Deployed

Your functions should already be deployed. Check here:
**https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions**

You should see:
- ✅ `send-email`
- ✅ `process-message-notifications`
- ✅ `process-notification-engine`
- ✅ `send-contact-email`

If any are missing, you can deploy them via the Supabase dashboard by uploading the function code.

---

## Step 4: Test It!

### Quick Test via Browser Console

1. Open your app: **https://streetcredrx1.fly.dev**
2. Open browser console (F12)
3. Paste and run:

```javascript
// Test email sending
fetch('https://tvqyozyjqcswojsbduzw.supabase.co/functions/v1/send-email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cXlvenlqcWNzd29qc2JkdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDU2MjIsImV4cCI6MjA0ODQ4MTYyMn0.f3pTfJsm94Rj0CDLSmKvmP-s30CQ0LQh7s5s1dopvwI',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'welcome',
    to: 'your-email@example.com',  // <-- Change this to your email
    firstName: 'Test'
  })
})
.then(r => r.json())
.then(d => console.log('✅ Success:', d))
.catch(e => console.error('❌ Error:', e));
```

4. Check your email inbox!

---

## What Gets Email Notifications Now?

Once set up, these actions trigger emails:

1. **✉️ New developer message** → Admins get notified
2. **👤 User invited** → New user gets invitation email
3. **🔑 Password reset** → User gets reset link
4. **✅ Email verification** → New signups get verification
5. **📋 Contact form** → Admin gets notification
6. **🎭 Role change** → User gets notified of new role

---

## Troubleshooting

### "No email received"

**Check 1**: Is the API key set in Supabase?
- Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions
- Look for `RESEND_API_KEY` in secrets

**Check 2**: Is the API key valid?
- Test it at: https://resend.com/api-keys
- Make sure it has "Sending access"

**Check 3**: Check spam folder
- Emails from `noreply@resend.dev` often go to spam initially

**Check 4**: View function logs
- Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions
- Click on `send-email`
- Click "Logs" tab
- Look for errors

### "Function errors"

Run this SQL to see errors:

```sql
SELECT 
  timestamp,
  level,
  message,
  metadata,
  error_stack
FROM application_logs
WHERE level IN ('error', 'fatal')
ORDER BY timestamp DESC
LIMIT 20;
```

Run it here: **https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/editor**

---

## Optional: Set Up Custom Domain

To send from `noreply@streetcredrx.com` instead of `noreply@resend.dev`:

1. Go to: **https://resend.com/domains**
2. Click **"Add Domain"**
3. Enter: `streetcredrx.com`
4. Add the DNS records they show you
5. Wait for verification (usually 5-15 minutes)
6. Update `send-email` function line 246 to:
   ```typescript
   from: "StreetCredRX <noreply@streetcredrx.com>",
   ```

---

## Status Check

After setup, verify everything:

```sql
-- Check recent notifications
SELECT 
  notification_type,
  status,
  COUNT(*) as count
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY notification_type, status;

-- Check for errors
SELECT * FROM application_logs
WHERE level = 'error'
  AND component LIKE '%email%'
ORDER BY timestamp DESC
LIMIT 10;
```

---

## Next Steps

1. ✅ Set up Resend account
2. ✅ Add API key to Supabase
3. ✅ Test email sending
4. 📧 Send test developer message
5. ✅ Verify emails are delivered
6. 🎉 You're done!

---

**Need help?** Check the full guide: `EMAIL_NOTIFICATIONS_SETUP.md`

**Quick links**:
- Resend: https://resend.com
- Supabase Functions: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions
- SQL Editor: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/editor
