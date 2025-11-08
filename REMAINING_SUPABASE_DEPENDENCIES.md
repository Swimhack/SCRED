# Remaining Supabase Dependencies

## ✅ Completed - Contact Forms
- [x] Homepage contact form (`src/pages/Index.tsx`)
- [x] Contact page form (`src/pages/Contact.tsx`)
- [x] Netlify Function created (`netlify/functions/send-contact-email.ts`)

## ⚠️ Still Using Supabase

The following files still use Supabase and will need migration if you want to fully remove Supabase:

### Authentication & User Management
1. **`src/pages/Auth.tsx`** - User authentication
2. **`src/pages/AuthCallback.tsx`** - OAuth callback (Scalekit integration)
3. **`src/hooks/useAuth.tsx`** - Auth state management
4. **`src/hooks/useUserManagement.tsx`** - User CRUD operations
5. **`src/hooks/useUserInvitation.tsx`** - User invitations

### Messaging System
6. **`src/hooks/useMessages.tsx`** - Message notifications & AI analysis

### Notifications
7. **`src/components/NotificationSettings.tsx`** - SMS verification

### Other Edge Functions Still Referenced
- `scalekit-auth-callback` - OAuth handling
- `send-email` - General email sending
- `sync-user-emails` - Email synchronization
- `process-message-notifications` - Message notifications
- `analyze-message-with-ai` - AI message analysis
- `send-sms-verification` - SMS verification

## 🎯 Migration Strategy (If Needed)

### Phase 1: Contact Forms ✅ DONE
- [x] Replace Supabase edge functions with Netlify Functions
- [x] Use Neon for database
- [x] Use Resend for email

### Phase 2: Authentication (Optional)
If you want to remove Supabase auth:
- Option A: Use **Clerk** (https://clerk.com)
- Option B: Use **Auth0** (https://auth0.com)
- Option C: Use **Scalekit** directly (you already have it)
- Option D: Build custom auth with Neon + JWT

### Phase 3: Database Operations (Optional)
Replace Supabase client queries with direct Neon queries:
- Create Netlify Functions for each operation
- Use `pg` library to connect to Neon
- Implement RLS (Row Level Security) in application logic

### Phase 4: Edge Functions (Optional)
Migrate remaining edge functions to Netlify Functions:
- `send-email` → Netlify Function + Resend
- `sync-user-emails` → Netlify Function + Neon
- `process-message-notifications` → Netlify Function + Neon
- `analyze-message-with-ai` → Netlify Function + OpenAI/Anthropic
- `send-sms-verification` → Netlify Function + Twilio

## 💡 Recommendation

**For Now**: Keep Supabase for auth and user management
- Contact forms are now independent ✅
- Auth is complex and Supabase handles it well
- You can migrate auth later if needed

**Cost Impact**:
- Supabase Free Tier: 500 MB database, 50,000 monthly active users
- If you're within limits, no cost to keep it

## 📊 Current Architecture

```
Frontend (React)
    ├── Contact Forms → Netlify Functions → Neon + Resend ✅
    ├── Authentication → Supabase Auth
    ├── User Management → Supabase Database
    ├── Messaging → Supabase Database + Edge Functions
    └── Notifications → Supabase Edge Functions
```

## 🔄 Fully Migrated Architecture (Future)

```
Frontend (React)
    ├── Contact Forms → Netlify Functions → Neon + Resend ✅
    ├── Authentication → Clerk/Auth0/Custom
    ├── User Management → Netlify Functions → Neon
    ├── Messaging → Netlify Functions → Neon
    └── Notifications → Netlify Functions → Twilio + Resend
```

## ⚡ Quick Wins

If you want to remove more Supabase dependencies quickly:

1. **Email sending** - Already have Resend, just create Netlify Function
2. **SMS verification** - Add Twilio, create Netlify Function
3. **User sync** - Create Netlify Function with Neon queries

## 🎯 Decision Point

**Do you want to**:
- A) Keep Supabase for auth/users (recommended for now)
- B) Fully migrate everything away from Supabase
- C) Migrate specific features only

Let me know and I can help with the next phase!
