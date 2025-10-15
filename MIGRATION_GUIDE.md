# Supabase Data Migration Guide

This guide will help you migrate all data from your old Supabase instance to the new one.

## Overview

**Old Supabase:** `https://sctzykgcfkhadowyqcrj.supabase.co`  
**New Supabase:** `https://tvqyozyjqcswojsbduzw.supabase.co` (already configured in `.env.mvp`)

## Prerequisites

1. **Node.js** installed (you already have this)
2. **@supabase/supabase-js** package installed
3. **Service Role Key** for the new Supabase instance

## Step 1: Get the New Supabase Service Role Key

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/api
2. Scroll down to "Project API keys"
3. Find the **service_role** key (marked as "secret" - ⚠️ DO NOT expose this publicly)
4. Click "Copy" to copy the key
5. Keep it ready for the next step

## Step 2: Ensure Schema is Ready

The new Supabase instance should have the same schema as the old one. You can apply all migrations by running:

```powershell
# If using Supabase CLI
supabase db push

# Or manually apply migrations from supabase/migrations/ folder
```

## Step 3: Run the Migration Script

Open PowerShell in this directory and run:

```powershell
$env:NEW_SUPABASE_SERVICE_KEY="your-service-role-key-here"
node migrate-supabase-data.js
```

**Replace `your-service-role-key-here` with the actual service role key you copied in Step 1.**

### Alternative: One-line command

```powershell
$env:NEW_SUPABASE_SERVICE_KEY="your-service-role-key-here"; node migrate-supabase-data.js
```

## What Gets Migrated

The script will migrate the following tables in dependency order:

1. ✅ `roles` - User role definitions
2. ✅ `profiles` - User profiles
3. ✅ `pharmacist_applications` - All pharmacist applications
4. ✅ `pharmacist_questionnaires` - Questionnaire responses
5. ✅ `developer_messages` - Message history
6. ✅ `ai_analysis` - AI analysis records
7. ✅ `notification_preferences` - User notification settings
8. ✅ `notification_logs` - Notification history
9. ✅ `user_invitations` - Pending invitations
10. ✅ `user_activity_logs` - Activity logs
11. ✅ `application_logs` - Application logs
12. ✅ `contact_submissions` - Contact form submissions

## What to Expect

The migration script will:
- ✅ Test connections to both databases
- 📥 Fetch all data from the old database in batches
- 📤 Insert data into the new database in batches
- 🔄 Use `upsert` to handle conflicts (prevents duplicates)
- 📊 Show real-time progress for each table
- 📈 Display a comprehensive summary at the end

### Sample Output

```
🚀 Starting Supabase Data Migration
====================================

OLD: https://sctzykgcfkhadowyqcrj.supabase.co
NEW: https://tvqyozyjqcswojsbduzw.supabase.co

Testing connections...

✅ Old Supabase connection successful
✅ New Supabase connection successful

✅ Both connections successful. Starting migration...

============================================================
📊 Migrating table: profiles
============================================================
📥 Fetching data from profiles...
   Fetched 5 rows (total: 5)
📤 Inserting 5 rows into profiles...
   ✅ Inserted batch 0-5 (5/5)

... (continues for each table)

============================================================
📊 MIGRATION SUMMARY
============================================================

✅ Successful: 8
   - roles: 4 rows migrated
   - profiles: 5 rows migrated
   - pharmacist_applications: 12 rows migrated
   - contact_submissions: 3 rows migrated
   ...

📈 Total: 150 rows migrated successfully

✅ Migration complete!
```

## Troubleshooting

### Error: "NEW_SUPABASE_SERVICE_KEY environment variable is required"
**Solution:** Make sure you set the environment variable before running the script:
```powershell
$env:NEW_SUPABASE_SERVICE_KEY="your-key-here"
```

### Error: "Connection test failed"
**Solution:** 
- Verify your service role key is correct
- Check that both Supabase instances are accessible
- Ensure you have network connectivity

### Error: "Table does not exist"
**Solution:** The table doesn't exist in the source database - this is normal if you haven't used certain features yet. The script will skip these tables.

### Error: "Batch insertion failed"
**Solution:** 
- Check that the target database schema matches the source
- Verify that all migrations have been applied to the new database
- Look at the specific error message for more details

## Post-Migration Steps

After successful migration:

1. **Verify Data:**
   - Log into your application using the new Supabase
   - Check that all applications are visible
   - Verify user profiles are intact
   - Test that messages and other features work

2. **Update Environment Variables:**
   - Your `.env.mvp` is already configured with the new Supabase URL
   - Ensure any production `.env` files are updated

3. **Test Authentication:**
   - Try logging in with existing credentials
   - Test password reset functionality
   - Verify OAuth logins if applicable

4. **Update DNS/Deployment:**
   - Update your production environment to use `.env.mvp` or equivalent
   - Redeploy your application if needed

## Rollback Plan

If something goes wrong, you can always revert to the old Supabase by:

1. Updating `.env.mvp` to point back to the old URL:
   ```
   VITE_SUPABASE_URL=https://sctzykgcfkhadowyqcrj.supabase.co
   ```

2. Rebuilding and redeploying your application

## Security Notes

⚠️ **IMPORTANT:** 
- Never commit your service role key to version control
- The service role key has full admin access to your database
- After migration, you can safely delete or revoke the key if needed
- Keep the old Supabase instance running for a few days as a backup

## Need Help?

If you encounter any issues during migration:
1. Check the error messages in the script output
2. Verify your service role key is correct
3. Ensure all migrations are applied to the new database
4. Contact support if needed

## Clean Up

After verifying the migration is successful and everything works:

1. Keep the old Supabase instance for 7-30 days as a backup
2. Monitor the new instance for any issues
3. Once confident, you can pause/delete the old Supabase project to save costs

---

**Migration Script:** `migrate-supabase-data.js`  
**Created:** 2025-10-09  
**Status:** Ready to run
