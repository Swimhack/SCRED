# Quick Update: Change Email From Name to StreetCredRX

## 🎯 Goal
Change the sender name from "supabase auth" to "StreetCredRX" for all authentication emails.

## ⚡ Quick Steps (2 minutes)

1. **Go to Email Templates Settings:**
   - Direct link: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/auth/templates
   - Or navigate: Dashboard → Authentication → Email Templates → Settings tab

2. **Update Email Settings:**
   - Find the **"From Name"** field
   - Change it from: `supabase auth` (or whatever it currently says)
   - To: `StreetCredRX`
   
3. **Update From Email (optional but recommended):**
   - Set **"From Email"** to: `noreply@streetcredrx.com`
   - (Make sure this domain is verified in your email provider)

4. **Click "Save"**

## ✅ Done!

All future authentication emails will show:
- **From:** StreetCredRX <noreply@streetcredrx.com>

## 📧 Test It

After saving, trigger a test email:
- Sign up with a test email, OR
- Request a password reset

Check the email - it should now show "StreetCredRX" as the sender name!

## 🔧 Alternative: Using Custom SMTP

If you want more control, you can configure custom SMTP:

1. Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/auth
2. Scroll to **"SMTP Settings"**
3. Enable **"Enable Custom SMTP"**
4. Set:
   - **Sender Name:** `StreetCredRX`
   - **Sender Email:** `noreply@streetcredrx.com`
   - Configure your SMTP server details (if using Resend, use their SMTP settings)

