# Fix Resend Email Sending - Action Required

## Problem Identified ✅
The `RESEND_API_KEY` is **NOT stored in Supabase secrets**. This is why emails show as "sent" but never actually deliver.

**SQL Query Result:**
```sql
SELECT name FROM vault.secrets WHERE name = 'RESEND_API_KEY';
-- Success. No rows returned ❌
```

## Solution: Add Resend API Key to Supabase Vault

### Step 1: Access Supabase Vault Settings
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw
2. Navigate to **Project Settings** (gear icon in sidebar)
3. Click on **Vault** in the left menu

### Step 2: Add the Secret
1. Click **"New Secret"** button
2. Fill in the form:
   - **Name:** `RESEND_API_KEY`
   - **Secret:** Your Resend API key (starts with `re_`)
3. Click **"Create Secret"**

### Step 3: Verify the Secret Was Added
Run this SQL query in the SQL Editor:
```sql
SELECT name FROM vault.secrets WHERE name = 'RESEND_API_KEY';
```

**Expected Result:**
```
name
----------------
RESEND_API_KEY
```

### Step 4: Redeploy Edge Function (Important!)
After adding the secret, you MUST redeploy the Edge Function for it to pick up the new secret:

```powershell
# Deploy the contact email function
supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw

# Or deploy all functions
supabase functions deploy --project-ref tvqyozyjqcswojsbduzw
```

**OR** Use the Supabase Dashboard:
1. Go to **Edge Functions** in the sidebar
2. Find `send-contact-email`
3. Click the **"Deploy"** button

### Step 5: Test Email Sending
After redeploying, submit a test through your contact form at:
https://streetcredrx1.fly.dev/contact

Check:
1. ✅ Email arrives in inbox
2. ✅ Resend Dashboard shows delivery: https://resend.com/emails
3. ✅ Supabase `contact_submissions` table shows `email_sent = true`

---

## Important Notes

### About Resend Sandbox Domain
The Edge Function currently uses `noreply@resend.dev` as the sender. This sandbox domain has limitations:
- ✅ Can send emails to **verified email addresses only**
- ❌ Cannot send to arbitrary recipients like `contact@streetcredrx.com`

### Current Code (Line 189):
```typescript
from: 'StreetCredRx Contact Form <noreply@resend.dev>',
to: ['contact@streetcredrx.com'],  // This won't work with sandbox!
```

### Two Options:

#### Option A: Quick Fix - Use Your Verified Email (Testing)
Change line 100 to use your verified Resend email:
```typescript
const recipientEmail = 'james@stricklandtm.com' // Your verified email
```

#### Option B: Production Fix - Add Custom Domain
To send from `@streetcredrx.com` and to any recipient:

1. **Add Domain in Resend Dashboard**
   - Go to: https://resend.com/domains
   - Click **"Add Domain"**
   - Enter: `streetcredrx.com`

2. **Add DNS Records** (provided by Resend)
   - SPF Record
   - DKIM Records
   - DMARC Record (optional but recommended)

3. **Wait for Verification** (usually 5-15 minutes)

4. **Update Edge Function Code:**
   ```typescript
   from: 'StreetCredRx <noreply@streetcredrx.com>',
   to: ['contact@streetcredrx.com'],
   ```

---

## Quick Commands Reference

### Check if Secret Exists
```sql
SELECT name FROM vault.secrets WHERE name = 'RESEND_API_KEY';
```

### Deploy Edge Function
```powershell
supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw
```

### View Function Logs
```powershell
supabase functions logs send-contact-email --project-ref tvqyozyjqcswojsbduzw
```

---

## Your Resend API Key
```
re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha
```

**⚠️ SECURITY NOTE:** Delete this file after setup or remove the API key from it!

---

## Next Steps

1. ✅ Add `RESEND_API_KEY` to Supabase Vault (see Step 2 above)
2. ✅ Redeploy the Edge Function (see Step 4 above)
3. ✅ Test email sending
4. 🔄 Decide: Keep using verified email for testing OR add custom domain for production
5. 🧹 Delete this file or remove the API key from it

**Need help?** Let me know if you encounter any issues with these steps!
