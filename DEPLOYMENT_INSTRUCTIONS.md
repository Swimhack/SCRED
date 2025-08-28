# 🚀 StreetCredRx Questionnaire Deployment Instructions

## ✅ What's Ready for Deployment

Your questionnaire implementation is complete and ready for deployment to https://streetcred.fly.dev/

### 📋 New Features Added:
- **Pharmacist Questionnaire** - Multi-step form with 7 sections
- **Facility Questionnaire** - Multi-step form with 11 sections  
- **Database Schema** - Complete migration ready to run
- **Navigation Updates** - Added questionnaire links to sidebar
- **TypeScript Types** - Full type safety for new questionnaires
- **Form Validation** - Comprehensive Zod schemas
- **Auto-save Drafts** - Forms save progress automatically

## 🔧 Pre-Deployment Steps

### 1. Database Migration
You need to run the SQL migration in Supabase first:

```sql
-- File: supabase/migrations/20250828-questionnaires.sql
-- Run this in your Supabase SQL Editor or via CLI
```

**To run the migration:**
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/sctzykgcfkhadowyqcrj
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250828-questionnaires.sql`
4. Click "Run"

### 2. Build Verification
The build has been tested and is successful:
```bash
npm run build
# ✓ built in 34.02s
# dist/ directory contains 4.4M of production assets
```

## 🚀 Deployment Options

### Option A: Fly CLI Deployment (Recommended)
```bash
# Install Fly CLI if not already installed
curl -L https://fly.io/install.sh | sh

# Authenticate with your token
fly auth login

# Deploy to production
fly deploy --app streetcred
```

### Option B: Manual Docker Deployment
```bash
# Build Docker image
docker build -t streetcred .

# Tag for Fly registry
docker tag streetcred registry.fly.io/streetcred

# Push to Fly
docker push registry.fly.io/streetcred

# Deploy
fly deploy --image registry.fly.io/streetcred
```

### Option C: GitHub Actions (Automated)
Set up automated deployment by adding your Fly token to GitHub secrets and using the provided workflow.

## 📁 Files Modified/Added

### Database:
- `supabase/migrations/20250828-questionnaires.sql` - New tables and RLS policies

### Components:
- `src/components/PharmacistQuestionnaire.tsx` - Individual questionnaire form
- `src/components/FacilityQuestionnaire.tsx` - Facility questionnaire form

### Pages:
- `src/pages/PharmacistQuestionnaire.tsx` - Pharmacist questionnaire page
- `src/pages/FacilityQuestionnaire.tsx` - Facility questionnaire page

### Routes:
- `src/App.tsx` - Added new routes for questionnaires

### Navigation:
- `src/components/PharmacistSidebar.tsx` - Added questionnaire links

### Types:
- `src/integrations/supabase/types.ts` - Added questionnaire table types

## 🔐 Security Features

- **Row Level Security (RLS)** - Users can only access their own questionnaires
- **Role-based Access** - Facility questionnaire restricted to admins
- **Form Validation** - Client and server-side validation
- **Data Sanitization** - Proper handling of sensitive data (SSN last 4 digits)

## 🧪 Testing After Deployment

### 1. Pharmacist Questionnaire (All Users)
- Navigate to `/questionnaire/pharmacist`
- Test form validation
- Test auto-save functionality
- Test submission

### 2. Facility Questionnaire (Admin Only)
- Login as admin user
- Navigate to `/questionnaire/facility`
- Test all 11 sections
- Verify admin-only access

### 3. Database Verification
- Check that data is being saved to Supabase
- Verify RLS policies are working
- Test questionnaire status updates

## 🌐 Production URLs

After deployment, questionnaires will be available at:
- **Pharmacist**: https://streetcred.fly.dev/questionnaire/pharmacist
- **Facility**: https://streetcred.fly.dev/questionnaire/facility

## 📊 Monitoring

Monitor the deployment:
- **Fly Dashboard**: https://fly.io/dashboard
- **Application Logs**: `fly logs --app streetcred`
- **Status**: `fly status --app streetcred`

## 🐛 Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure Supabase migration ran successfully
2. **Authentication**: Check that existing auth is working
3. **Build Errors**: Run `npm run build` locally to test
4. **Permissions**: Verify user roles and RLS policies

### Build Info:
- **Bundle Size**: 887.73 kB (253.25 kB gzipped)
- **Assets**: 4.4M total including images
- **No Critical Errors**: Build completed successfully

---

## ✅ Ready for Production

The implementation is production-ready with:
- ✅ Comprehensive forms with all major credentialing fields
- ✅ Secure database schema with RLS
- ✅ Type-safe implementation
- ✅ Responsive design
- ✅ Auto-save functionality
- ✅ Role-based access control
- ✅ Build verification completed

**Next step**: Run the Supabase migration, then deploy using one of the options above!