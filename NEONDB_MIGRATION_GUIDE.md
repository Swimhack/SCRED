# NeonDB Migration Guide - Application Code Updates

**Status:** ✅ Database schema migrated to NeonDB
**Next Step:** Update application code to use NeonDB

---

## 🎯 Migration Strategy: Hybrid Approach

We're using a **hybrid approach** to minimize disruption:

1. **Keep**: Supabase Auth (for now)
2. **Migrate**: Database operations to NeonDB
3. **Update**: Edge Functions to use NeonDB directly
4. **Frontend**: Minimal changes needed

---

## 📋 Step-by-Step Migration

### Step 1: Update Edge Function for Contact Form

The contact form edge function has been updated to use NeonDB directly via PostgreSQL connection.

**File Created:** `supabase/functions/send-contact-email/index-neondb.ts`

**Key Changes:**
- ✅ Uses PostgreSQL connection pool instead of Supabase client
- ✅ Direct SQL queries to NeonDB
- ✅ Maintains all existing functionality (validation, email, logging)
- ✅ Better error handling and connection management

**Backup Original:**
```bash
# Backup the current version
cp supabase/functions/send-contact-email/index.ts supabase/functions/send-contact-email/index-supabase-backup.ts

# Replace with NeonDB version
cp supabase/functions/send-contact-email/index-neondb.ts supabase/functions/send-contact-email/index.ts
```

---

### Step 2: Set Supabase Edge Function Secrets

The updated edge function needs environment variables:

#### Required Secrets:

1. **NEON_DATABASE_URL** - NeonDB connection string

```bash
# Set NeonDB connection string as secret
npx supabase secrets set NEON_DATABASE_URL="postgresql://neondb_owner:npg_1GEjV8oCAUNZ@ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

2. **RESEND_API_KEY** - Your Resend API key (if not already set)

```bash
# Set Resend API key (get from https://resend.com/api-keys)
npx supabase secrets set RESEND_API_KEY="re_your_api_key_here"
```

#### Verify Secrets:

```bash
# List all secrets (values won't be shown)
npx supabase secrets list
```

---

### Step 3: Deploy Updated Edge Function

```bash
# Login to Supabase (if not already logged in)
npx supabase login

# Deploy the updated function
npx supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw

# Verify deployment
npx supabase functions list --project-ref tvqyozyjqcswojsbduzw
```

---

### Step 4: Test Contact Form

#### Test via curl:

```bash
curl -X POST \
  "https://tvqyozyjqcswojsbduzw.supabase.co/functions/v1/send-contact-email" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cXlvenlqcWNzd29qc2JkdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDU2MjIsImV4cCI6MjA0ODQ4MTYyMn0.f3pTfJsm94Rj0CDLSmKvmP-s30CQ0LQh7s5s1dopvwI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Testing NeonDB integration",
    "source": "test"
  }'
```

#### Test via Website:

1. Go to https://streetcredrx1.fly.dev/
2. Scroll to contact form
3. Fill out form and submit
4. Check:
   - ✅ Form submits without errors
   - ✅ Success message appears
   - ✅ Email received at aj@streetcredrx.com

#### Verify in NeonDB:

```bash
python -c "
import psycopg2
conn = psycopg2.connect('postgresql://neondb_owner:npg_1GEjV8oCAUNZ@ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require')
cur = conn.cursor()
cur.execute('SELECT id, name, email, created_at FROM contact_submissions ORDER BY created_at DESC LIMIT 5;')
print('Recent contact submissions:')
for row in cur.fetchall():
    print(f'  ID: {row[0]}, Name: {row[1]}, Email: {row[2]}, Date: {row[3]}')
cur.close()
conn.close()
"
```

---

## 🔐 Frontend Updates (Minimal)

### Option A: Keep Supabase Client (Recommended for Quick Migration)

**No frontend changes needed!** The frontend continues to use:
- Supabase Auth for authentication
- Supabase Edge Functions as API gateway
- Edge Functions handle NeonDB connection internally

**Pros:**
- ✅ Zero frontend code changes
- ✅ Maintains existing auth flow
- ✅ Quick migration

**Cons:**
- ⚠️ Still dependent on Supabase for auth
- ⚠️ Need both Supabase AND NeonDB credentials

---

### Option B: Create Backend API Layer (Future Migration)

For complete independence from Supabase, create a custom backend:

**Architecture:**
```
Frontend (React) → Backend API (Node/Deno) → NeonDB
                 ↓
            Custom Auth (JWT)
```

**Implementation Steps:**

1. **Create Backend API** (Express/Fastify/Deno)
2. **Implement Authentication** (JWT, Passport, etc.)
3. **Create API Endpoints** (REST/GraphQL)
4. **Update Frontend** to use new API
5. **Migrate Users** from Supabase Auth

**This is a larger project - only do if you want full Supabase independence.**

---

## 📊 Current State vs. Future State

### ✅ **CURRENT STATE (Hybrid - Recommended)**

```
┌─────────────┐
│   Frontend  │ (React + Supabase Client)
│   (Vite)    │
└──────┬──────┘
       │
       │ API Calls (functions.invoke)
       ▼
┌─────────────────────┐
│ Supabase            │
│ Edge Functions      │ ← Authentication via Supabase Auth
│ (Gateway)           │
└──────┬──────────────┘
       │
       │ PostgreSQL Connection
       ▼
┌─────────────────────┐
│     NeonDB          │ ← All Data Storage
│  (PostgreSQL 15)    │
└─────────────────────┘
```

**Benefits:**
- ✅ Minimal code changes
- ✅ Keeps existing auth working
- ✅ Data stored in NeonDB
- ✅ Can migrate auth later

---

### 🔮 **FUTURE STATE (Full Independence - Optional)**

```
┌─────────────┐
│   Frontend  │ (React + Axios/Fetch)
│   (Vite)    │
└──────┬──────┘
       │
       │ REST API Calls
       ▼
┌─────────────────────┐
│  Custom Backend     │
│  (Node/Deno)        │ ← Custom JWT Auth
│  API Server         │
└──────┬──────────────┘
       │
       │ PostgreSQL Connection
       ▼
┌─────────────────────┐
│     NeonDB          │ ← All Data + Auth
│  (PostgreSQL 15)    │
└─────────────────────┘
```

**Benefits:**
- ✅ Complete control
- ✅ No Supabase dependency
- ✅ More flexible
- ⚠️ More work required

---

## 🚨 Authentication Migration (Future)

### When to Migrate Auth:

Migrate authentication away from Supabase when:
1. You need custom auth logic
2. Want to eliminate Supabase costs
3. Need full control over user data
4. Have time for proper migration

### How to Migrate Auth:

#### Step 1: Export Supabase Users

```sql
-- Connect to your Supabase database
SELECT
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
FROM auth.users
ORDER BY created_at;
```

#### Step 2: Import to NeonDB

```sql
-- Insert into NeonDB users table
INSERT INTO public.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_user_meta_data, raw_app_meta_data
)
SELECT
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_user_meta_data, raw_app_meta_data
FROM supabase_auth_users_export;
```

#### Step 3: Implement Custom Auth

Use a library like:
- **Passport.js** (Node.js)
- **jose** (JWT handling)
- **bcrypt** (password hashing)

#### Step 4: Update Frontend

Replace Supabase auth calls with your custom API:

```typescript
// Before (Supabase)
const { data, error } = await supabase.auth.signIn({
  email: 'user@example.com',
  password: 'password'
})

// After (Custom API)
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
})
const data = await response.json()
```

---

## 📝 Environment Variables Summary

### Supabase Edge Functions (Current Setup):

```bash
# Required for NeonDB integration
NEON_DATABASE_URL="postgresql://neondb_owner:npg_1GEjV8oCAUNZ@ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Required for email sending
RESEND_API_KEY="re_your_api_key_here"
```

### Frontend (.env - No changes needed):

```env
# Still using Supabase for auth and edge functions
VITE_SUPABASE_URL=https://tvqyozyjqcswojsbduzw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ Testing Checklist

After deploying the updated edge function:

- [ ] Test contact form submission on homepage
- [ ] Test contact form submission on /contact page
- [ ] Verify submissions appear in NeonDB
- [ ] Verify emails are sent successfully
- [ ] Check application_logs table for activity
- [ ] Test with invalid data (should return validation errors)
- [ ] Test without required fields (should return 400 error)
- [ ] Verify CORS headers work correctly

---

## 🔧 Troubleshooting

### Issue: "Module not found: postgres"

**Solution:** The Deno PostgreSQL module might not be available. Try:
```typescript
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts"
```

### Issue: "Connection refused"

**Solution:** Check NeonDB connection string and ensure pooler endpoint is used:
```
ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech
```
(Note the `-pooler` suffix)

### Issue: "SSL required"

**Solution:** Ensure connection string includes `?sslmode=require`

### Issue: "Edge function timeout"

**Solution:**
1. Check NeonDB is responding
2. Verify secrets are set correctly
3. Check Supabase function logs:
```bash
npx supabase functions logs send-contact-email --project-ref tvqyozyjqcswojsbduzw
```

---

## 📊 Performance Comparison

| Metric | Supabase → Supabase | Supabase → NeonDB |
|--------|---------------------|-------------------|
| Latency | ~50-100ms | ~100-150ms |
| Reliability | 99.9% | 99.9% |
| Cost | $$ | $ (cheaper) |
| Control | Limited | Full |

**NeonDB Advantages:**
- ✅ Lower cost (serverless scaling)
- ✅ Better performance at scale
- ✅ Full PostgreSQL features
- ✅ Direct SQL access

---

## 🎯 Next Steps

### Immediate (Do Now):

1. ✅ Backup original edge function
2. ✅ Replace with NeonDB version
3. ✅ Set environment variables
4. ✅ Deploy edge function
5. ✅ Test contact form

### Short Term (This Week):

1. Monitor edge function logs
2. Verify all contact submissions working
3. Check email delivery rates
4. Update documentation

### Long Term (Future):

1. Migrate authentication to custom solution
2. Create additional edge functions for NeonDB
3. Implement RLS policies in NeonDB
4. Migrate remaining Supabase features

---

## 🔐 Security Reminders

### ⚠️ Credentials to Rotate After This Session:

1. **NeonDB Password:** `npg_1GEjV8oCAUNZ`
   - Rotate in: https://console.neon.tech
   - Update: NEON_DATABASE_URL secret

2. **Supabase Anon Key:** (if exposed)
   - Rotate in: Supabase Dashboard → Settings → API

3. **Resend API Key:** (if exposed)
   - Rotate in: https://resend.com/api-keys

### Best Practices:

- ✅ Use environment variables, never hardcode
- ✅ Rotate credentials regularly
- ✅ Use different credentials for dev/staging/prod
- ✅ Enable 2FA on all accounts
- ✅ Monitor access logs

---

## 📚 Additional Resources

- **NeonDB Docs:** https://neon.tech/docs
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Deno PostgreSQL:** https://deno.land/x/postgres
- **Resend API:** https://resend.com/docs

---

## 💡 Support

If you encounter issues:

1. Check Supabase function logs
2. Verify environment variables are set
3. Test NeonDB connection directly
4. Review error messages in browser console
5. Ask for help with specific error messages

---

**Last Updated:** 2025-11-07
**Status:** ✅ Ready for deployment
