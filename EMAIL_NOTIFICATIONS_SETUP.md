# 📧 Email Notifications Setup Guide

## Overview

This guide will help you set up email notifications for StreetCredRX using Resend.com, deploy the necessary Edge Functions, and use application logs for troubleshooting.

## 🎯 What Gets Notifications

1. **Developer Messages** - When admins/developers send messages
2. **User Invitations** - When new users are invited to the platform
3. **Role Changes** - When user roles are updated
4. **Password Resets** - When users request password resets
5. **Email Verification** - When new users sign up
6. **Welcome Emails** - When users complete registration

## 📋 Prerequisites

- [x] Supabase project set up (`tvqyozyjqcswojsbduzw`)
- [ ] Resend.com account (free tier works great)
- [ ] Supabase CLI installed
- [ ] Access to Supabase dashboard

---

## Step 1: Get Resend API Key

### 1.1 Create Resend Account

1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email address

### 1.2 Get API Key

1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: `StreetCredRX Production`
4. Permission: "Sending access"
5. Click "Create"
6. **Copy the API key** (starts with `re_`)

### 1.3 Set Domain (Optional but Recommended)

1. Go to https://resend.com/domains
2. Add your domain: `streetcredrx.com`
3. Add the DNS records they provide
4. Once verified, emails will come from `noreply@streetcredrx.com` instead of `noreply@resend.dev`

---

## Step 2: Configure Supabase Secrets

### 2.1 Add RESEND_API_KEY

```powershell
# Using Supabase CLI
supabase secrets set RESEND_API_KEY=re_your_actual_key_here --project-ref tvqyozyjqcswojsbduzw

# Or via Dashboard:
# 1. Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions
# 2. Scroll to "Secrets"
# 3. Add secret: RESEND_API_KEY = re_your_actual_key_here
```

### 2.2 Verify Environment Variables

The Edge Functions need these environment variables (auto-set by Supabase):
- ✅ `SUPABASE_URL` - Auto-set
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Auto-set
- ⚠️  `RESEND_API_KEY` - You must set this

---

## Step 3: Deploy Edge Functions

### 3.1 Deploy Notification Functions

```powershell
# Navigate to project root
cd "C:\STRICKLAND\Strickland Technology Marketing\streetcredrx.com\streetcredrx1"

# Deploy all notification functions
supabase functions deploy send-email --project-ref tvqyozyjqcswojsbduzw
supabase functions deploy process-message-notifications --project-ref tvqyozyjqcswojsbduzw
supabase functions deploy process-notification-engine --project-ref tvqyozyjqcswojsbduzw
supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw
```

### 3.2 Verify Deployment

```powershell
# List deployed functions
supabase functions list --project-ref tvqyozyjqcswojsbduzw
```

You should see:
- ✅ `send-email`
- ✅ `process-message-notifications`
- ✅ `process-notification-engine`
- ✅ `send-contact-email`

---

## Step 4: Test Email Notifications

### 4.1 Test Send-Email Function

Create a test script `test-email.ps1`:

```powershell
$url = "https://tvqyozyjqcswojsbduzw.supabase.co/functions/v1/send-email"
$headers = @{
    "Authorization" = "Bearer YOUR_ANON_KEY_HERE"
    "Content-Type" = "application/json"
}
$body = @{
    type = "welcome"
    to = "your-email@example.com"
    firstName = "Test User"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
Write-Host "✅ Email sent successfully!"
Write-Host ($response | ConvertTo-Json -Depth 5)
```

Run it:
```powershell
.\test-email.ps1
```

### 4.2 Check Email Delivery

1. Check your email inbox
2. Look for email from `noreply@resend.dev` or `noreply@streetcredrx.com`
3. If not in inbox, check spam folder

---

## Step 5: Enable Application Logging

### 5.1 Verify Logs Table Exists

Already exists from migrations! The `application_logs` table captures:
- Message send attempts
- Email delivery status
- Function errors
- API call logs

### 5.2 Query Logs for Troubleshooting

```sql
-- View recent email logs
SELECT 
  timestamp,
  level,
  message,
  metadata->>'email' as recipient_email,
  metadata->>'type' as email_type,
  metadata->>'error' as error_message
FROM application_logs
WHERE component = 'email-notifications'
ORDER BY timestamp DESC
LIMIT 50;

-- View message notification logs
SELECT 
  timestamp,
  level,
  message,
  metadata->>'messageId' as message_id,
  metadata->>'recipient' as recipient,
  metadata->>'status' as status
FROM application_logs
WHERE component = 'message-notifications'
ORDER BY timestamp DESC
LIMIT 50;

-- View all errors in last 24 hours
SELECT 
  timestamp,
  level,
  component,
  message,
  error_stack
FROM application_logs
WHERE level IN ('error', 'fatal')
  AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

---

## Step 6: Monitor Notification Logs Table

### 6.1 Query Notification Status

```sql
-- Check notification delivery status
SELECT 
  nl.id,
  nl.notification_type,
  nl.status,
  nl.sent_at,
  nl.delivered_at,
  nl.error_message,
  p.email as recipient_email,
  dm.message as message_content
FROM notification_logs nl
LEFT JOIN profiles p ON nl.user_id = p.id
LEFT JOIN developer_messages dm ON nl.message_id = dm.id
ORDER BY nl.created_at DESC
LIMIT 50;

-- Count notifications by status
SELECT 
  notification_type,
  status,
  COUNT(*) as count
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY notification_type, status
ORDER BY notification_type, status;
```

---

## Troubleshooting Guide

### Issue: "No emails being sent"

**Check:**
1. Is RESEND_API_KEY set correctly?
   ```powershell
   supabase secrets list --project-ref tvqyozyjqcswojsbduzw
   ```

2. Are functions deployed?
   ```powershell
   supabase functions list --project-ref tvqyozyjqcswojsbduzw
   ```

3. Check function logs:
   ```powershell
   supabase functions logs send-email --project-ref tvqyozyjqcswojsbduzw
   ```

### Issue: "Emails going to spam"

**Solutions:**
1. Set up custom domain in Resend
2. Add SPF, DKIM, and DMARC records
3. Warm up your sending domain gradually

### Issue: "Function timeout errors"

**Check:**
1. Application logs for specific errors
2. Resend API status: https://resend.com/status
3. Network connectivity from Supabase Edge Functions

---

## Quick Reference Commands

### View Edge Function Logs

```powershell
# Real-time logs
supabase functions logs send-email --project-ref tvqyozyjqcswojsbduzw --tail

# Last 100 entries
supabase functions logs send-email --project-ref tvqyozyjqcswojsbduzw --limit 100
```

### Query Application Logs

```sql
-- Recent activity
SELECT * FROM application_logs 
ORDER BY timestamp DESC 
LIMIT 100;

-- Filter by component
SELECT * FROM application_logs 
WHERE component = 'email-notifications'
ORDER BY timestamp DESC;

-- Search by message
SELECT * FROM application_logs 
WHERE message ILIKE '%email%'
ORDER BY timestamp DESC;
```

### Test Message Notifications

```powershell
# Send a test developer message via the UI
# Then check if notification was created:
```

```sql
SELECT * FROM notification_logs 
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

---

## Configuration Files

### Functions That Send Emails

1. **send-email** - Base email sending function
   - Path: `supabase/functions/send-email/index.ts`
   - Supports: welcome, password-reset, verification, user-invitation, role-change, developer-message

2. **process-message-notifications** - Developer message notifications
   - Path: `supabase/functions/process-message-notifications/index.ts`
   - Triggered when messages are sent

3. **send-contact-email** - Contact form emails
   - Path: `supabase/functions/send-contact-email/index.ts`
   - Sends contact form submissions to admin

4. **process-notification-engine** - Multi-channel notification router
   - Path: `supabase/functions/process-notification-engine/index.ts`
   - Routes notifications to email, SMS, push

---

## Next Steps

After setup:

1. ✅ Test all email types
2. ✅ Monitor logs for errors
3. ✅ Set up custom domain for better deliverability
4. ✅ Configure notification preferences for users
5. ✅ Set up alerts for failed deliveries

---

## Support

- **Resend Docs**: https://resend.com/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Application Logs**: Query `application_logs` table
- **Function Logs**: Use `supabase functions logs` command

---

**Created**: 2025-10-09  
**Status**: Ready for setup  
**Maintenance**: Review logs weekly
