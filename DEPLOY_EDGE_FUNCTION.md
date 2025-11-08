# Deploy Neon + Resend Edge Function

## Status
✅ **Frontend deployed**: https://scred.netlify.app
⚠️ **Edge function needs manual deployment** (requires Supabase login)

## What's Ready
The edge function code is already updated to use:
- **Neon Database** for storing contact submissions
- **Resend** for sending email notifications

File: `supabase/functions/send-contact-email/index.ts`

## Deploy the Edge Function

### Option 1: Using Supabase CLI (Recommended)

1. **Login to Supabase**:
   ```bash
   npx supabase login
   ```

2. **Set Environment Variables** (if not already set):
   ```bash
   npx supabase secrets set NEON_DATABASE_URL="postgresql://neondb_owner:npg_1GEjV8oCAUNZ@ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" --project-ref tvqyozyjqcswojsbduzw
   
   npx supabase secrets set RESEND_API_KEY="your-resend-api-key" --project-ref tvqyozyjqcswojsbduzw
   ```

3. **Deploy the Function**:
   ```bash
   npx supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw
   ```

### Option 2: Using the Deployment Script

Run the automated deployment script:
```bash
deploy-neondb-edge-function.bat
```

This script will:
- Backup the current function
- Set environment variables
- Deploy the function
- Optionally test it

### Option 3: Via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions
2. Select `send-contact-email` function
3. Update the code from `supabase/functions/send-contact-email/index.ts`
4. Set environment variables in Settings > Edge Functions:
   - `NEON_DATABASE_URL`
   - `RESEND_API_KEY`
5. Deploy

## Required Environment Variables

### NEON_DATABASE_URL
```
postgresql://neondb_owner:npg_1GEjV8oCAUNZ@ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### RESEND_API_KEY
Get your API key from: https://resend.com/api-keys

## Test the Function

After deployment, test with:
```bash
curl -X POST "https://tvqyozyjqcswojsbduzw.supabase.co/functions/v1/send-contact-email" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cXlvenlqcWNzd29qc2JkdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzIyMzUsImV4cCI6MjA2MzEwODIzNX0.MJl1EtbDCjzT5PvBxoA7j4_4iM_FtX_1IjcDexcwz9Y" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Testing Neon + Resend integration","source":"test"}'
```

## Verify

1. **Check Neon Database**: Verify submission appears in `contact_submissions` table
2. **Check Email**: Verify email arrives at aj@streetcredrx.com and james@ekaty.com
3. **Check Logs**: 
   ```bash
   npx supabase functions logs send-contact-email --project-ref tvqyozyjqcswojsbduzw
   ```

## What Changed

### Before (Supabase)
- Used Supabase database for storage
- Used Supabase email service

### After (Neon + Resend)
- ✅ Uses **Neon PostgreSQL** for contact submissions
- ✅ Uses **Resend** for email delivery
- ✅ Stores submissions with metadata (IP, user agent, referrer)
- ✅ Logs to `application_logs` table
- ✅ Tracks email delivery status

## Cost Optimization

- **Neon**: Free tier includes 0.5 GB storage, 3 compute hours/month
- **Resend**: Free tier includes 100 emails/day, 3,000/month
- **Token usage**: Minimal - only edge function invocation

## Security Notes

⚠️ **Database credentials are hardcoded in the deployment script**. After deployment:
1. Rotate the Neon database password
2. Update the `NEON_DATABASE_URL` secret
3. Remove credentials from any scripts

## Support

If issues occur:
1. Check edge function logs
2. Verify environment variables are set
3. Test database connection from Neon console
4. Verify Resend API key is valid
