# 🚀 Quick Start: Supabase Data Migration

## TL;DR - Run These Commands

```powershell
# 1. Get your service role key from:
# https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/api

# 2. Check if schema exists (OPTIONAL but recommended)
$env:NEW_SUPABASE_SERVICE_KEY="paste-your-service-key-here"
node check-new-supabase-schema.js

# 3. If schema missing, apply migrations:
supabase link --project-ref tvqyozyjqcswojsbduzw
supabase db push

# 4. Run the migration
$env:NEW_SUPABASE_SERVICE_KEY="paste-your-service-key-here"
node migrate-supabase-data.js
```

## What You Need

1. **Service Role Key** from new Supabase (get it from dashboard)
2. **@supabase/supabase-js** npm package (already installed)
3. **5-10 minutes** for the migration to complete

## Files Created

- ✅ `migrate-supabase-data.js` - Main migration script
- ✅ `check-new-supabase-schema.js` - Schema checker (optional)
- ✅ `MIGRATION_GUIDE.md` - Detailed documentation
- ✅ `MIGRATION_QUICKSTART.md` - This file

## Migration Details

**FROM:** `https://sctzykgcfkhadowyqcrj.supabase.co` (old)  
**TO:** `https://tvqyozyjqcswojsbduzw.supabase.co` (new - already in `.env.mvp`)

## What Gets Migrated

✅ All user accounts and profiles  
✅ All pharmacist applications  
✅ All questionnaire responses  
✅ All messages and notifications  
✅ All logs and activity history  
✅ All contact form submissions  

## Important Notes

⚠️ **The service role key is SECRET** - don't share it or commit it to git  
⚠️ **Keep the old Supabase running** for a week as backup  
⚠️ **Test thoroughly** after migration before going live  

## After Migration

1. Test login with your existing credentials
2. Verify all applications are visible
3. Check that PharmacistDetailModal shows full data
4. Test all features (messages, notifications, etc.)
5. Deploy with confidence!

## Need Help?

Read the full `MIGRATION_GUIDE.md` for troubleshooting and detailed instructions.
