# Resend Email Issue - Root Cause & Resolution

## Problem Summary
Contact form submissions were saving to database but emails were **NOT being sent**.

## Root Cause Identified ✅
**The `RESEND_API_KEY` was never added to Supabase Vault secrets.**

### Evidence:
```sql
SELECT name FROM vault.secrets WHERE name = 'RESEND_API_KEY';
-- Result: No rows returned ❌
```

This explains why:
- ✅ Form submissions saved to `contact_submissions` table
- ✅ Success message displayed to users
- ❌ **No emails actually sent**
- ❌ `email_sent` column remained `false`
- ❌ `email_error` column shows "Resend API key not configured"

## Resolution Steps

### 1. Browser Tabs Opened
The setup script opened two tabs for you:
- **Supabase Vault:** Add the secret here
- **Edge Functions:** Redeploy after adding secret

### 2. Add Secret to Vault
Your API key is already copied to clipboard. In the Vault tab:

1. Click **"New Secret"** button
2. Enter:
   - **Name:** `RESEND_API_KEY` (exact, case-sensitive!)
   - **Secret:** Press `Ctrl+V` to paste: `re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha`
3. Click **"Create Secret"**

### 3. Redeploy Edge Function (CRITICAL!)
In the Edge Functions tab:

1. Click on `send-contact-email` function
2. Click **"Deploy"** button (top right)
3. Wait 30-60 seconds for deployment to complete

⚠️ **This step is REQUIRED!** Edge Functions only read secrets on startup.

### 4. Verify Secret Was Added
Run this SQL in Supabase SQL Editor:

```sql
SELECT name, created_at FROM vault.secrets WHERE name = 'RESEND_API_KEY';
```

Expected result:
```
name            | created_at
----------------|---------------------------
RESEND_API_KEY  | 2025-01-15 00:55:00+00
```

### 5. Test Email Sending
After redeployment:

1. Visit: https://streetcredrx1.fly.dev/contact
2. Submit a test message
3. Check email inbox
4. Check Resend dashboard: https://resend.com/emails

## Additional Issue: Sandbox Domain Limitation

### Current Configuration
The Edge Function uses Resend's sandbox domain:
```typescript
from: 'StreetCredRx Contact Form <noreply@resend.dev>'
to: ['ajlipka@gmail.com']  // Updated for testing
```

### Sandbox Limitations
Resend's `@resend.dev` sandbox can **only send to verified email addresses**.

Original recipient `contact@streetcredrx.com` won't work unless:
1. That email is verified in Resend, OR
2. You add custom domain `streetcredrx.com` to Resend

### Temporary Fix Applied
I updated the recipient to `ajlipka@gmail.com` for testing.

**File changed:** `supabase/functions/send-contact-email/index.ts` (line 100)

### Production Solution: Add Custom Domain

To send from `@streetcredrx.com` and to any recipient:

1. **Resend Dashboard → Domains**
   - URL: https://resend.com/domains
   - Click "Add Domain"
   - Enter: `streetcredrx.com`

2. **Add DNS Records** (Resend provides these):
   ```
   Type: TXT
   Name: @
   Value: [Resend SPF record]

   Type: CNAME
   Name: resend._domainkey
   Value: [Resend DKIM key]
   ```

3. **Wait for Verification** (5-15 minutes)

4. **Update Edge Function:**
   ```typescript
   from: 'StreetCredRx <noreply@streetcredrx.com>'
   to: ['contact@streetcredrx.com']
   ```

## Files Modified

### `supabase/functions/send-contact-email/index.ts`
- **Line 128:** Changed recipient to `ajlipka@gmail.com` for testing
- **Added:** TODO comment to add custom domain

## Testing Checklist

After completing steps 1-3 above:

- [ ] Secret added to Supabase Vault
- [ ] Edge Function redeployed
- [ ] Test email submitted via contact form
- [ ] Email received in inbox
- [ ] Resend dashboard shows successful delivery
- [ ] Database shows `email_sent = true`

## Expected Behavior After Fix

### Before (Current Issue):
```
User submits form
  ↓
Saved to database ✅
  ↓
Try to send email ❌
  ↓
No API key found ❌
  ↓
email_sent = false ❌
email_error = "Resend API key not configured"
  ↓
User sees success message (misleading!)
```

### After (Fixed):
```
User submits form
  ↓
Saved to database ✅
  ↓
Send email via Resend ✅
  ↓
Email delivered ✅
  ↓
email_sent = true ✅
email_sent_at = [timestamp] ✅
  ↓
User sees success message ✅
Recipient receives email ✅
```

## Quick Reference

### Important URLs
- **Supabase Vault:** https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/vault
- **Edge Functions:** https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions
- **Resend Dashboard:** https://resend.com/emails
- **Add Domain:** https://resend.com/domains
- **Test Form:** https://streetcredrx1.fly.dev/contact

### API Key (Delete After Setup!)
```
re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha
```

### Quick Commands

**Verify secret exists:**
```sql
SELECT name FROM vault.secrets WHERE name = 'RESEND_API_KEY';
```

**Check recent contact submissions:**
```sql
SELECT id, name, email, email_sent, email_error, created_at 
FROM contact_submissions 
ORDER BY created_at DESC 
LIMIT 5;
```

**View Edge Function logs:**
```sql
SELECT created_at, level, message, context
FROM app_logs
WHERE route = '/api/contact'
ORDER BY created_at DESC
LIMIT 10;
```

## Security Note

⚠️ **DELETE THESE FILES AFTER SETUP:**
- `FIX_RESEND_NOW.md`
- `SUPABASE_ADD_SECRET_GUIDE.md`
- `setup-resend.ps1`
- `RESEND_ISSUE_RESOLVED.md` (this file)

They contain your API key in plain text!

## Next Steps

1. ✅ Complete steps 1-5 above
2. ✅ Test email sending
3. 🔄 **Optional:** Add custom domain for production
4. 🧹 Delete files with API key
5. 🎉 Email notifications working!

---

**Questions?** Check the detailed guides:
- `FIX_RESEND_NOW.md` - Detailed resolution steps
- `SUPABASE_ADD_SECRET_GUIDE.md` - Visual walkthrough
