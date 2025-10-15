# 📧 Complete Resend Email Setup for StreetCredRx

## 🎯 Overview

This guide will help you set up Resend to handle **ALL** emails in your StreetCredRx application, including:
- ✉️ Contact form submissions
- 👤 User invitations
- 🔐 Password reset emails
- ✅ Email verification
- 💬 Developer messages
- 🎭 Role change notifications
- 📢 Admin notifications

---

## ✅ Setup Checklist

### Step 1: Create Resend Account (5 minutes)

- [ ] Go to [https://resend.com/signup](https://resend.com/signup)
- [ ] Sign up with your email (free tier includes 100 emails/day, 3,000/month)
- [ ] Verify your email address
- [ ] Complete account setup

### Step 2: Generate API Key (2 minutes)

- [ ] Log in to [https://resend.com/api-keys](https://resend.com/api-keys)
- [ ] Click **"Create API Key"**
- [ ] Name: `StreetCredRx Production`
- [ ] Permission: **"Sending access"**
- [ ] Click **"Create"**
- [ ] **Copy the API key** (it starts with `re_` and you'll only see it once!)
- [ ] Store it securely (you'll need it in the next step)

**Example API Key Format:** `re_ABC123xyz456def789ghi012jkl345mno`

---

### Step 3: Add API Key to Supabase (3 minutes)

#### Option A: Via Supabase Dashboard (Recommended)

1. [ ] Go to your Supabase project: [https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions](https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions)

2. [ ] Scroll down to **"Secrets"** section

3. [ ] Click **"Add new secret"**

4. [ ] Enter:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_your_actual_api_key_here` (paste your copied key)

5. [ ] Click **"Save"**

6. [ ] Verify the secret appears in the list

#### Option B: Via Supabase CLI (If installed)

```powershell
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here --project-ref tvqyozyjqcswojsbduzw
```

---

### Step 4: Verify Edge Functions are Deployed (2 minutes)

- [ ] Go to [https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions](https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions)

You should see these functions listed:

| Function Name | Status | Purpose |
|--------------|--------|---------|
| `send-email` | ✅ Deployed | Main email sending (invitations, password reset, verification, role changes, developer messages) |
| `send-contact-email` | ✅ Deployed | Contact form submissions |
| `process-message-notifications` | ✅ Deployed | Developer message notifications |
| `process-notification-engine` | ✅ Deployed | Notification processing engine |

**If any are missing:**
- [ ] You'll need to deploy them manually (see "Deploy Functions Manually" section below)

---

### Step 5: Test Email Sending (5 minutes)

#### Test 1: Simple Email Test

1. [ ] Open [https://streetcredrx1.fly.dev](https://streetcredrx1.fly.dev) in your browser
2. [ ] Open Developer Console (Press F12, then click "Console" tab)
3. [ ] Paste this code and replace `YOUR_EMAIL@example.com` with your actual email:

```javascript
fetch('https://tvqyozyjqcswojsbduzw.supabase.co/functions/v1/send-email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cXlvenlqcWNzd29qc2JkdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDU2MjIsImV4cCI6MjA0ODQ4MTYyMn0.f3pTfJsm94Rj0CDLSmKvmP-s30CQ0LQh7s5s1dopvwI',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'welcome',
    to: 'YOUR_EMAIL@example.com',
    firstName: 'Test User'
  })
})
.then(r => r.json())
.then(d => console.log('✅ Email Sent Successfully:', d))
.catch(e => console.error('❌ Error:', e));
```

4. [ ] Press Enter to run
5. [ ] Check your email inbox (and spam folder!)
6. [ ] You should receive a "Welcome to StreetCredRX!" email

#### Test 2: Contact Form Test

1. [ ] Go to [https://streetcredrx1.fly.dev/contact](https://streetcredrx1.fly.dev/contact)
2. [ ] Fill out the contact form
3. [ ] Submit the form
4. [ ] Check `contact@streetcredrx.com` inbox for the notification email

---

### Step 6: Configure Custom Domain (Optional but Recommended - 15 minutes)

Using a custom domain makes emails look more professional and improves deliverability.

#### Benefits:
- Emails from `noreply@streetcredrx.com` instead of `noreply@resend.dev`
- Better email deliverability
- Professional branding
- Reduced spam filtering

#### Steps:

1. [ ] Go to [https://resend.com/domains](https://resend.com/domains)
2. [ ] Click **"Add Domain"**
3. [ ] Enter: `streetcredrx.com`
4. [ ] Resend will show you DNS records to add
5. [ ] Add these DNS records to your domain registrar:
   - TXT record for SPF
   - DKIM record (CNAME)
   - DMARC record (TXT)
6. [ ] Wait for DNS propagation (5-30 minutes)
7. [ ] Resend will automatically verify the domain
8. [ ] Update the Edge Functions to use custom domain

---

### Step 7: Update Edge Functions with Custom Domain (If configured)

Once your custom domain is verified in Resend:

#### Update `send-email` function:

File: `supabase/functions/send-email/index.ts`

Change line 246 from:
```typescript
from: "StreetCredRX <noreply@resend.dev>",
```

To:
```typescript
from: "StreetCredRX <noreply@streetcredrx.com>",
```

#### Update `send-contact-email` function:

File: `supabase/functions/send-contact-email/index.ts`

Change line 175 from:
```typescript
from: 'StreetCredRx Contact Form <noreply@resend.dev>',
```

To:
```typescript
from: 'StreetCredRx Contact Form <noreply@streetcredrx.com>',
```

#### Redeploy Functions:

If you have Supabase CLI installed:
```powershell
supabase functions deploy send-email --project-ref tvqyozyjqcswojsbduzw
supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw
```

Or deploy via Supabase Dashboard (see "Deploy Functions Manually" below).

---

## 🔧 Deploy Functions Manually (If needed)

If any functions are not deployed, you can deploy them via the Supabase Dashboard:

1. [ ] Go to [https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions](https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions)
2. [ ] Click **"Create a new function"** or **"Deploy function"**
3. [ ] Upload the function code:
   - Function Name: `send-email` or `send-contact-email`
   - Runtime: Deno
   - Code: Copy/paste from `supabase/functions/[function-name]/index.ts`
4. [ ] Click **"Deploy"**
5. [ ] Wait for deployment to complete
6. [ ] Verify function appears as "Active"

---

## 📊 Monitoring & Troubleshooting

### Check Email Delivery Status

#### View Function Logs:
1. [ ] Go to [https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions](https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions)
2. [ ] Click on function name (e.g., `send-email`)
3. [ ] Click **"Logs"** tab
4. [ ] Look for success/error messages

#### Check Resend Dashboard:
1. [ ] Go to [https://resend.com/emails](https://resend.com/emails)
2. [ ] View all sent emails
3. [ ] Check delivery status
4. [ ] View bounce/complaint rates

#### Check Contact Submissions Database:
Run this SQL in Supabase SQL Editor:
```sql
SELECT 
  id,
  name,
  email,
  message,
  email_sent,
  email_sent_at,
  email_error,
  created_at
FROM contact_submissions
ORDER BY created_at DESC
LIMIT 20;
```

### Common Issues & Solutions

#### Issue: "No email received"

**Solution 1: Check Spam Folder**
- Emails from new domains often land in spam initially
- Mark as "Not Spam" to train filters

**Solution 2: Verify API Key**
- Go to [https://resend.com/api-keys](https://resend.com/api-keys)
- Ensure key status is "Active"
- Ensure key has "Sending access" permission

**Solution 3: Check Function Logs**
- Look for errors in Supabase function logs
- Common errors:
  - "Resend API key not configured" → API key not set in Supabase secrets
  - "401 Unauthorized" → Invalid API key
  - "429 Too Many Requests" → Rate limit exceeded (upgrade plan)

**Solution 4: Verify Secrets are Set**
```sql
-- Run this in Supabase SQL Editor to check secrets
SELECT * FROM vault.secrets WHERE name = 'RESEND_API_KEY';
```

#### Issue: "Function errors or timeouts"

**Check Function Logs:**
```sql
SELECT 
  timestamp,
  level,
  component,
  message,
  metadata,
  error_stack
FROM application_logs
WHERE level IN ('error', 'fatal')
  AND component LIKE '%email%'
ORDER BY timestamp DESC
LIMIT 20;
```

**Solution:**
- Ensure function has proper permissions
- Check for syntax errors in function code
- Verify all environment variables are set
- Restart function if stuck

#### Issue: "Emails not sending from Contact Form"

1. Check `contact_submissions` table for error messages
2. Verify `RESEND_API_KEY` secret is set
3. Check function logs for `send-contact-email`
4. Test function directly in browser console

---

## 🎯 Email Types & Usage

### 1. Welcome Emails
**Function:** `send-email`  
**Type:** `welcome`  
**Triggered by:** New user signup  
**Recipient:** New user

### 2. Email Verification
**Function:** `send-email`  
**Type:** `verification`  
**Triggered by:** New user signup  
**Recipient:** New user  
**Contains:** Verification link

### 3. Password Reset
**Function:** `send-email`  
**Type:** `password-reset`  
**Triggered by:** User requests password reset  
**Recipient:** User  
**Contains:** Reset link (expires in 1 hour)

### 4. User Invitation
**Function:** `send-email`  
**Type:** `user-invitation`  
**Triggered by:** Admin invites new user  
**Recipient:** Invited user  
**Contains:** Invitation link with token

### 5. Role Change Notification
**Function:** `send-email`  
**Type:** `role-change`  
**Triggered by:** Admin changes user role  
**Recipient:** User whose role changed  
**Contains:** New role information

### 6. Developer Messages
**Function:** `send-email`  
**Type:** `developer-message`  
**Triggered by:** Developer sends message via dev console  
**Recipient:** Admin users  
**Contains:** Message content and link to view

### 7. Contact Form Submissions
**Function:** `send-contact-email`  
**Triggered by:** User submits contact form  
**Recipient:** `contact@streetcredrx.com`  
**Contains:** Full submission details

---

## 📈 Resend Free Tier Limits

- **Daily limit:** 100 emails/day
- **Monthly limit:** 3,000 emails/month
- **Rate limit:** 10 requests/second
- **Email size:** 40 MB max

### Upgrade Options:
- **Pro Plan:** $20/month → 50,000 emails/month
- **Business Plan:** Custom pricing for higher volumes

---

## 🎉 Final Verification Checklist

After completing all steps above, verify everything is working:

- [ ] Resend account created and verified
- [ ] API key generated and securely stored
- [ ] API key added to Supabase secrets as `RESEND_API_KEY`
- [ ] All Edge Functions are deployed and active
- [ ] Test email sent successfully (welcome email test)
- [ ] Contact form test email received at `contact@streetcredrx.com`
- [ ] Custom domain configured (optional but recommended)
- [ ] Edge Functions updated with custom domain (if configured)
- [ ] Function logs show successful email sends
- [ ] Resend dashboard shows delivered emails
- [ ] Spam folder checked and emails marked as "Not Spam"

---

## 📞 Support & Resources

### Resend Resources:
- **Dashboard:** [https://resend.com](https://resend.com)
- **API Keys:** [https://resend.com/api-keys](https://resend.com/api-keys)
- **Emails:** [https://resend.com/emails](https://resend.com/emails)
- **Domains:** [https://resend.com/domains](https://resend.com/domains)
- **Documentation:** [https://resend.com/docs](https://resend.com/docs)

### Supabase Resources:
- **Project Dashboard:** [https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw](https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw)
- **Edge Functions:** [https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions](https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions)
- **SQL Editor:** [https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/editor](https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/editor)

### Quick Test Scripts:
All test scripts are in `QUICK_EMAIL_SETUP.md`

---

## 🚀 Next Steps

Once Resend is fully set up:

1. [ ] Test all email types (welcome, reset, verification, invitation, contact)
2. [ ] Configure email templates with your branding
3. [ ] Set up custom domain for professional emails
4. [ ] Monitor email delivery rates
5. [ ] Set up email forwarding for `contact@streetcredrx.com`
6. [ ] Add DMARC policy to improve deliverability
7. [ ] Consider upgrading to Resend Pro if you exceed free tier limits

---

**Status:** Ready to deploy! 🎉

**Estimated Setup Time:** 15-30 minutes (excluding custom domain DNS propagation)

**Questions?** Check the troubleshooting section or contact support.
