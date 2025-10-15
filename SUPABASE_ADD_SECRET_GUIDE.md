# How to Add RESEND_API_KEY to Supabase Vault

## Visual Walkthrough

### 1. Navigate to Supabase Vault
```
🌐 Open: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw

Left Sidebar:
├─ 📊 Database
├─ 🔐 Authentication  
├─ 📦 Storage
├─ ⚡ Edge Functions
├─ ...
└─ ⚙️  Project Settings  ← CLICK HERE
    └─ In submenu, click "Vault"
```

### 2. Add New Secret
Once in Vault section, you'll see a table of secrets (currently empty).

**Click the "New Secret" or "+ New Secret" button**

### 3. Fill in the Form
```
┌─────────────────────────────────────────┐
│  Create New Secret                      │
├─────────────────────────────────────────┤
│                                         │
│  Name: *                                │
│  ┌─────────────────────────────────┐   │
│  │ RESEND_API_KEY                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Secret: *                              │
│  ┌─────────────────────────────────┐   │
│  │ re_Voo9XZgj_LuUZDm7d7Kz2tJX... │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Description: (optional)                │
│  ┌─────────────────────────────────┐   │
│  │ API key for Resend email service│   │
│  └─────────────────────────────────┘   │
│                                         │
│     [Cancel]      [Create Secret]      │
│                                         │
└─────────────────────────────────────────┘
```

**Enter:**
- **Name:** `RESEND_API_KEY` (exactly as shown, case-sensitive!)
- **Secret:** `re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha`
- **Description:** `API key for Resend email service` (optional)

**Click "Create Secret"**

### 4. Verify Secret Was Created
You should now see your secret in the table:

```
┌──────────────────┬─────────────┬─────────────────────┐
│ Name             │ Description │ Created             │
├──────────────────┼─────────────┼─────────────────────┤
│ RESEND_API_KEY   │ API key... │ 2 minutes ago       │
└──────────────────┴─────────────┴─────────────────────┘
```

✅ **Secret added successfully!**

---

## Alternative: Add Secret via SQL

If you prefer using SQL Editor:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this query:

```sql
-- Add Resend API key to vault
SELECT vault.create_secret(
  'RESEND_API_KEY',
  're_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha',
  'API key for Resend email service'
);

-- Verify it was added
SELECT name, description, created_at 
FROM vault.secrets 
WHERE name = 'RESEND_API_KEY';
```

Expected result:
```
name            | description              | created_at
----------------|--------------------------|--------------------------
RESEND_API_KEY  | API key for Resend...   | 2025-01-15 00:54:32+00
```

---

## Important: Redeploy Edge Function

⚠️ **CRITICAL STEP:** After adding the secret, you MUST redeploy your Edge Function!

The Edge Function reads secrets on startup, so it won't see the new key until redeployed.

### Method 1: Using Supabase CLI
```powershell
supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw
```

### Method 2: Using Dashboard
1. Go to **Edge Functions** in left sidebar
2. Click on `send-contact-email` function
3. Click **"Deploy"** button in top right
4. Wait for deployment to complete (usually 10-30 seconds)

---

## Troubleshooting

### "Secret already exists" error
If you get this error, the secret might already exist but with wrong value. Update it:

```sql
-- View existing secret
SELECT name FROM vault.secrets WHERE name = 'RESEND_API_KEY';

-- Update the secret
UPDATE vault.secrets 
SET secret = 're_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha'
WHERE name = 'RESEND_API_KEY';
```

### Edge Function still says "Resend API key not configured"
- ✅ Check secret name is exactly `RESEND_API_KEY` (case-sensitive)
- ✅ Ensure you redeployed the Edge Function after adding secret
- ✅ Check function logs: `supabase functions logs send-contact-email`
- ✅ Wait 30-60 seconds after redeploying before testing

### Emails still not sending
Check the sandbox domain limitation:
- Resend sandbox (`@resend.dev`) can only send to **verified email addresses**
- To send to `contact@streetcredrx.com`, you need to either:
  1. Verify that email in Resend dashboard, OR
  2. Add custom domain `streetcredrx.com` to Resend

---

## Next Steps After Adding Secret

1. ✅ **Redeploy Edge Function** (critical!)
2. ✅ **Test email sending** via contact form
3. ✅ **Check Resend dashboard** for delivery status
4. 🔄 **Consider adding custom domain** for production use
5. 🧹 **Delete files with API key** (FIX_RESEND_NOW.md, this file)

---

## Quick Links

- 🔐 **Supabase Vault:** https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/vault
- ⚡ **Edge Functions:** https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions
- 📧 **Resend Dashboard:** https://resend.com/emails
- 🌐 **Add Domain to Resend:** https://resend.com/domains

---

**Your Resend API Key:**
```
re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha
```

**⚠️ SECURITY:** Delete this file after setup!
