# Update Supabase Email From Name Programmatically

This guide shows how to programmatically update the email "from name" for Supabase authentication emails to "StreetCredRX".

## 🎯 Goal

Change the sender name on all Supabase authentication emails (signup, password reset, etc.) from the default to **"StreetCredRX"**.

## 📋 Methods

### Method 1: Via Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/auth/templates
2. Click the **"Settings"** tab (or gear icon)
3. Set **"From Name"** to: `StreetCredRX`
4. Set **"From Email"** to: `noreply@streetcredrx.com`
5. Click **"Save"**

**✅ Done!** All future authentication emails will use this sender name.

---

### Method 2: Via Supabase Management API (Programmatic)

#### Prerequisites

1. Get your Supabase Access Token:
   - Go to: https://supabase.com/dashboard/account/tokens
   - Click **"Generate new token"**
   - Copy the token (starts with `sbp_`)

2. Set environment variable:
   ```bash
   export SUPABASE_ACCESS_TOKEN=your_token_here
   ```

#### Option A: Using Deno Script

```bash
cd streetcredrx1/supabase/scripts
deno run --allow-net --allow-env update-email-from-name.ts
```

#### Option B: Using Bash Script

```bash
cd streetcredrx1/supabase/scripts
chmod +x update-email-from-name.sh
./update-email-from-name.sh
```

#### Option C: Using cURL Directly

```bash
curl -X PATCH \
  "https://api.supabase.com/v1/projects/tvqyozyjqcswojsbduzw/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mailer_from_name": "StreetCredRX",
    "mailer_from_email": "noreply@streetcredrx.com"
  }'
```

---

### Method 3: Via Supabase CLI (If Self-Hosted)

If you're running self-hosted Supabase, update `config.toml`:

```toml
[auth.email]
mailer_from_name = "StreetCredRX"
mailer_from_email = "noreply@streetcredrx.com"
```

Then restart Supabase:
```bash
supabase stop
supabase start
```

---

## ✅ Verification

After updating, test by:

1. **Trigger a test email:**
   - Sign up with a test email, OR
   - Request a password reset

2. **Check the email:**
   - The "From" field should show: **StreetCredRX <noreply@streetcredrx.com>**
   - Subject lines will use the custom templates we created

---

## 📧 Email Types Affected

All authentication emails will use the new from name:
- ✅ Email confirmation (signup)
- ✅ Password reset
- ✅ Magic link (passwordless login)
- ✅ Email change confirmation
- ✅ Email changed notification

---

## 🔧 Troubleshooting

### API returns 401 Unauthorized
- Check that your access token is valid
- Ensure token has project access permissions

### API returns 404 Not Found
- Verify project ref is correct: `tvqyozyjqcswojsbduzw`
- Check that you're using the Management API endpoint

### Changes not appearing
- Wait a few minutes for changes to propagate
- Check Supabase Dashboard to verify settings saved
- Trigger a new test email

---

## 📞 Support

If you encounter issues:
- Check Supabase logs: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/logs
- Review API docs: https://supabase.com/docs/reference/api/introduction

