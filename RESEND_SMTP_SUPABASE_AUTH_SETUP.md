# Configure Resend SMTP for Supabase Auth Emails

This guide will help you configure Resend as the SMTP provider for Supabase authentication emails. This will:
- ✅ Eliminate rate limits
- ✅ Use StreetCredRX branding (sender name)
- ✅ Send from noreply@streetcredrx.com
- ✅ Use your existing Resend account

## 🎯 Your Current Setup

- **Resend API Key:** `re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha`
- **Verified Domain:** `streetcredrx.com`
- **Sender Email:** `noreply@streetcredrx.com`

## 📋 Step-by-Step Configuration

### Step 1: Go to Supabase Auth Settings

**Direct Link:** https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/auth

**Or navigate:**
1. Go to your Supabase Dashboard
2. Select your project
3. Click **"Project Settings"** (gear icon)
4. Click **"Authentication"** tab
5. Scroll down to **"SMTP Settings"** section

### Step 2: Enable Custom SMTP

1. Find the **"SMTP Settings"** section
2. Toggle **"Enable Custom SMTP"** to **ON**

### Step 3: Enter Resend SMTP Credentials

Fill in these **exact** values:

```
✅ Sender Name: StreetCredRX
✅ Sender Email: noreply@streetcredrx.com

✅ SMTP Host: smtp.resend.com
✅ SMTP Port: 587
✅ SMTP User: resend
✅ SMTP Password: re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha
```

**Important Notes:**
- **SMTP User** is always `resend` (not your email or API key)
- **SMTP Password** is your Resend API key (starts with `re_`)
- **Port 587** uses STARTTLS (recommended)
- If 587 doesn't work, try **Port 465** with SSL enabled

### Step 4: Save Settings

1. Click **"Save"** button
2. Wait for confirmation message
3. Test by triggering a password reset or signup

## ✅ What This Enables

After configuration, all Supabase authentication emails will:
- **From Name:** StreetCredRX
- **From Email:** noreply@streetcredrx.com
- **Provider:** Resend (no rate limits)
- **Templates:** Use your custom HTML templates (if configured)

## 📧 Email Types Affected

- ✅ Email confirmation (signup)
- ✅ Password reset
- ✅ Magic link (passwordless login)
- ✅ Email change confirmation
- ✅ Email changed notification

## 🧪 Test the Configuration

After saving:

1. **Trigger a test email:**
   - Go to: https://scred.netlify.app/auth
   - Click "Forgot your password?"
   - Enter a test email address
   - Click "Send reset link"

2. **Check the email:**
   - Should arrive within seconds
   - **From:** StreetCredRX <noreply@streetcredrx.com>
   - **Subject:** Reset your StreetCredRX password
   - Should use your custom HTML template

## 🔧 Troubleshooting

### Port 587 doesn't work?

Try **Port 465** with:
- ✅ SSL/TLS enabled
- Same credentials otherwise

### Still seeing rate limit errors?

1. Verify SMTP settings are saved correctly
2. Check that "Enable Custom SMTP" is ON
3. Wait 1-2 minutes for changes to propagate
4. Try sending another test email

### Email not arriving?

1. Check spam folder
2. Verify Resend domain status: https://resend.com/domains
3. Check Supabase logs: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/logs/auth

## 📊 Verify Resend Configuration

Check your Resend dashboard:
- **Domains:** https://resend.com/domains
  - Should show `streetcredrx.com` as verified
- **API Keys:** https://resend.com/api-keys
  - Should show your active API key
- **Emails:** https://resend.com/emails
  - Should show sent emails after testing

## 🎉 Success!

Once configured, you'll have:
- ✅ No more rate limit errors
- ✅ Professional branding (StreetCredRX)
- ✅ Reliable email delivery via Resend
- ✅ Custom HTML email templates
- ✅ Single email provider (Resend) for everything

---

**Quick Reference:**
- Supabase Auth Settings: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/auth
- Resend Dashboard: https://resend.com/emails
- Your API Key: `re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha` (keep this secure!)

