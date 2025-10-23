# Create Database Table for Contact Form

## Quick Fix (2 minutes)

The Edge Function is deployed ✅ but the database table doesn't exist yet.

### Step 1: Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/sql/new

### Step 2: Run the SQL Script

1. Copy the entire contents of `create-contact-table.sql`
2. Paste it into the SQL Editor
3. Click "Run" or press Ctrl+Enter

The script will:
- Create the `contact_submissions` table
- Add all necessary indexes
- Set proper permissions for the Edge Function
- Disable RLS so the Edge Function can write to it

### Step 3: Test the Contact Form

```powershell
.\test-edge-function.ps1
```

Should now show SUCCESS instead of "Failed to save submission"!

### Step 4: Test on the Live Site

Visit: https://streetcredrx1.fly.dev/contact

Fill out and submit the form - you should see:
- ✅ "Message sent!" toast notification
- ✅ Email sent to contact@streetcredrx.com
- ✅ Submission saved in database

---

## Alternative: Check if Table Already Exists

Before creating the table, you can check if it exists:

1. Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/editor
2. Look for `contact_submissions` table in the left sidebar
3. If it exists, the problem might be permissions

### If Table Exists - Fix Permissions:

Run this SQL:

```sql
-- Disable RLS or grant service role access
ALTER TABLE public.contact_submissions DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.contact_submissions TO service_role;
GRANT ALL ON public.contact_submissions TO postgres;
```

---

## Verify It's Working

After creating the table:

1. **Test the Edge Function:**
   ```powershell
   .\test-edge-function.ps1
   ```
   Should show: `{"success":true,"message":"Contact form submitted successfully","id":"..."}`

2. **Check the Database:**
   - Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/editor
   - Click on `contact_submissions` table
   - You should see the test submission

3. **Check Resend Dashboard:**
   - Go to: https://resend.com/emails
   - You should see the test email

4. **Test the Live Form:**
   - Visit: https://streetcredrx1.fly.dev/contact
   - Submit a test message
   - Should work perfectly! ✅

---

## What This Fixes

- ✅ Edge Function can save submissions to database
- ✅ Contact form sends emails via Resend
- ✅ All contact form data is stored
- ✅ No more "Failed to save submission" errors

---

##Next Steps After Table Creation

Once the table is created, everything should work:
1. Contact form on `/contact` page  ✅
2. Investor inquiry form on homepage ✅
3. Emails sent via Resend ✅
4. Submissions tracked in database ✅






