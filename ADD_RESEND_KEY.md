# 🔑 Add Resend API Key to Supabase

## Your API Key
```
re_CdxV7v5W_EdfkcGcZpNNDQESnktuHuKAF
```

---

## 📋 Step-by-Step Instructions (2 minutes)

### 1. Open Supabase Dashboard
Click this link to go directly to your project's Edge Functions settings:

**[Open Supabase Edge Functions Settings →](https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions)**

### 2. Scroll to "Secrets" Section
- Once the page loads, scroll down until you see a section titled **"Secrets"**
- This is where you'll add environment variables for your Edge Functions

### 3. Add the Secret
1. Click the button **"Add new secret"**
2. A form will appear with two fields:

   **Field 1 - Name:**
   ```
   RESEND_API_KEY
   ```
   
   **Field 2 - Value:**
   ```
   re_CdxV7v5W_EdfkcGcZpNNDQESnktuHuKAF
   ```

3. Click **"Save"** or **"Create"** button

### 4. Verify the Secret was Added
- The secret `RESEND_API_KEY` should now appear in your secrets list
- The value will be hidden (showing asterisks for security)

---

## ✅ That's It!

Your Resend API key is now configured and all Edge Functions will automatically use it.

---

## 🧪 Next Step: Test Your Setup

### Option 1: Use the Test Page (Recommended)
1. Open `test-resend.html` in your browser (double-click the file)
2. Enter your email address in any test
3. Click the button to send a test email
4. Check your inbox (and spam folder)

### Option 2: Quick Browser Console Test
1. Go to your live site: https://streetcredrx1.fly.dev
2. Press `F12` to open Developer Console
3. Click the "Console" tab
4. Paste this code (replace YOUR_EMAIL with your actual email):

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
    firstName: 'Test'
  })
})
.then(r => r.json())
.then(d => console.log('✅ Success:', d))
.catch(e => console.error('❌ Error:', e));
```

5. Press Enter
6. Check your email inbox (and spam folder!)

---

## 📧 Emails You'll Receive

Once configured, these emails will be automated:

| Email Type | Trigger | Recipient |
|-----------|---------|-----------|
| **Contact Form** | User submits contact form | `contact@streetcredrx.com` |
| **Welcome** | New user signs up | New user |
| **Email Verification** | New user signs up | New user |
| **Password Reset** | User requests reset | User |
| **User Invitation** | Admin invites user | Invited user |
| **Role Change** | Admin changes user role | User |
| **Developer Message** | Dev console message sent | Admin users |

---

## 🔍 Troubleshooting

### "I added the key but emails aren't sending"

**Check 1:** Verify the secret name is exactly `RESEND_API_KEY` (case-sensitive)

**Check 2:** View function logs for errors:
1. Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions
2. Click on `send-email` or `send-contact-email`
3. Click "Logs" tab
4. Look for error messages

**Check 3:** Check your spam folder - emails from new domains often land there

**Check 4:** Run this SQL in Supabase SQL Editor to verify the secret exists:
```sql
SELECT name FROM vault.secrets WHERE name = 'RESEND_API_KEY';
```

### "Getting 401 Unauthorized error"

This means the API key is invalid or not set correctly:
- Double-check you copied the entire key: `re_CdxV7v5W_EdfkcGcZpNNDQESnktuHuKAF`
- Make sure there are no extra spaces before or after the key
- Delete and re-add the secret if needed

### "Function not found error"

The Edge Functions may not be deployed. Check:
https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions

You should see:
- ✅ `send-email`
- ✅ `send-contact-email`
- ✅ `process-message-notifications`
- ✅ `process-notification-engine`

---

## 📞 Need Help?

- **Full Setup Guide:** See `RESEND_SETUP_COMPLETE.md`
- **Quick Reference:** See `RESEND_QUICK_START.md`
- **Test Page:** Open `test-resend.html` in browser
- **Resend Dashboard:** https://resend.com
- **Supabase Functions:** https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions

---

## 🚀 Ready to Go!

Once you've added the secret to Supabase:
1. ✅ All email functionality will be live
2. ✅ Contact form submissions will notify admin
3. ✅ User invitations will work
4. ✅ Password resets will work
5. ✅ Email verification will work

**Next:** Run a test to verify everything works!
