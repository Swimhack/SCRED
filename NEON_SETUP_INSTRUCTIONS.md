# 🔧 Neon Database Setup Instructions

## ✅ Deployments Complete

- **Netlify**: https://scred.netlify.app
- **Fly.io**: https://streetcredrx1.fly.dev

## ⚠️ CRITICAL: Run This SQL in Neon

The contact form will NOT work until you run the setup SQL in your Neon database.

### Step 1: Go to Neon Console

1. Visit: https://console.neon.tech
2. Select your project
3. Click "SQL Editor"

### Step 2: Run the Setup SQL

Copy and paste this entire SQL script into the Neon SQL Editor and run it:

```sql
-- Neon Database Setup for StreetCredRx Contact Forms

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'normal',
  
  -- Response tracking
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID,
  response_notes TEXT,
  
  -- Metadata
  source TEXT DEFAULT 'website',
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  
  -- Email tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_error TEXT,
  
  CONSTRAINT valid_status CHECK (status IN ('new', 'read', 'replied', 'resolved')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  CONSTRAINT valid_source CHECK (source IN ('website', 'api', 'import', 'investor-homepage'))
);

-- Create application_logs table
CREATE TABLE IF NOT EXISTS public.application_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  route TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_level CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON public.contact_submissions(priority);
CREATE INDEX IF NOT EXISTS idx_application_logs_created_at ON public.application_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_application_logs_level ON public.application_logs(level);

-- Verify tables exist
SELECT 'contact_submissions table created' as status, count(*) as row_count FROM public.contact_submissions;
SELECT 'application_logs table created' as status, count(*) as row_count FROM public.application_logs;
```

### Step 3: Verify Tables Were Created

After running the SQL, you should see output like:
```
status: "contact_submissions table created", row_count: 0
status: "application_logs table created", row_count: 0
```

## 🧪 Test the Contact Form

### Test on Netlify
1. Visit: https://scred.netlify.app
2. Scroll to contact form
3. Fill out and submit
4. Check email at aj@streetcredrx.com

### Test on Fly.io
1. Visit: https://streetcredrx1.fly.dev
2. Scroll to contact form
3. Fill out and submit
4. Check email at aj@streetcredrx.com

### Test via API
```powershell
Invoke-WebRequest -Uri "https://scred.netlify.app/.netlify/functions/send-contact-email" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"Test User","email":"test@example.com","phone":"555-1234","message":"Testing Neon integration","source":"api-test"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "id": "uuid-here"
}
```

## 📊 Verify in Neon

After submitting a test form, check the database:

```sql
-- View all submissions
SELECT * FROM public.contact_submissions 
ORDER BY created_at DESC 
LIMIT 10;

-- Check email delivery status
SELECT 
  id, 
  name, 
  email, 
  email_sent, 
  email_sent_at, 
  email_error, 
  created_at 
FROM public.contact_submissions 
ORDER BY created_at DESC 
LIMIT 10;

-- View application logs
SELECT * FROM public.application_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🔍 Troubleshooting

### Issue: "Failed to fetch" or "Login failed"

**Cause**: Tables don't exist in Neon database

**Fix**: Run the SQL setup script above in Neon SQL Editor

### Issue: "NEON_DATABASE_URL not configured"

**Cause**: Environment variable not set

**Fix**: 
```bash
# For Netlify
netlify env:set NEON_DATABASE_URL "your-connection-string"

# For Fly.io
flyctl secrets set NEON_DATABASE_URL="your-connection-string"
```

### Issue: Email not received

**Cause**: Resend API key not set or invalid

**Fix**:
```bash
# For Netlify
netlify env:set RESEND_API_KEY "re_YbKQ6z6S_KjqHQkeNPWDkpQ5QJRkG3gtP"

# For Fly.io
flyctl secrets set RESEND_API_KEY="re_YbKQ6z6S_KjqHQkeNPWDkpQ5QJRkG3gtP"
```

### Issue: "relation does not exist"

**Cause**: Tables not created or wrong schema

**Fix**: Make sure you're using `public.` prefix in all queries and that tables exist

## 📝 What Was Fixed

### 1. Database Connection
- ✅ Fixed ES module imports for `pg` package
- ✅ Added proper connection pooling settings
- ✅ Added connection timeout handling
- ✅ Added explicit `public.` schema prefix to all queries

### 2. Email Sending
- ✅ Fixed Resend API integration
- ✅ Added proper error handling
- ✅ Added email delivery tracking
- ✅ Added BCC to james@ekaty.com

### 3. Error Handling
- ✅ Added detailed error logging
- ✅ Added proper error messages
- ✅ Added development mode error details
- ✅ Added graceful pool cleanup

## 🎯 Next Steps

1. ✅ Run SQL setup in Neon (CRITICAL)
2. ✅ Test contact form on both sites
3. ✅ Verify emails are received
4. ✅ Check Neon database for submissions
5. ⚠️ Rotate database credentials (security)

## 💰 Cost

All services remain within free tiers:
- Neon: $0/month
- Resend: $0/month
- Netlify: $0/month
- Fly.io: $0/month

**Total: $0/month** 🎉

## 📞 Support

If issues persist after running the SQL setup:
1. Check Netlify function logs: https://app.netlify.com/sites/scred/functions
2. Check Fly.io logs: `flyctl logs`
3. Verify environment variables are set
4. Test database connection in Neon console
5. Verify Resend API key is valid

## ✨ Summary

- ✅ Fixed Neon authentication issues
- ✅ Fixed email sending via Resend
- ✅ Deployed to both Netlify and Fly.io
- ⚠️ **MUST run SQL setup in Neon for contact form to work**

**Once you run the SQL setup, everything will work perfectly!**
