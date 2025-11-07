# NeonDB Schema Migration Guide - StreetCredRX

**Target Database:** NeonDB REST API
**Endpoint:** `https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1`
**Generated:** 2025-11-07

## ⚠️ IMPORTANT NOTES

1. **Execute scripts in order** - Dependencies must be created before dependent tables
2. **Replace `YOUR_BEARER_TOKEN`** with your actual NeonDB API token
3. **Test in development first** - These commands will create production schema
4. **Backup existing data** - If migrating from existing database
5. **RLS Policies included** - Full Row Level Security implementation
6. **Custom auth.users replacement** - Using public.users table instead of Supabase auth

---

## EXECUTION METHOD

The NeonDB REST API requires POST requests with SQL queries in JSON format:

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "YOUR SQL HERE"}'
```

---

## STEP 1: Create Extensions and Base Schema

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "-- Enable required extensions\nCREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\nCREATE EXTENSION IF NOT EXISTS \"pgcrypto\";\n\n-- Create public schema (if not exists)\nCREATE SCHEMA IF NOT EXISTS public;\n\n-- Grant usage on public schema\nGRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;\nGRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;\nGRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;\nGRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;\n\n-- Set default privileges\nALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;\nALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;\nALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;"
}'
```

---

## STEP 2: Create Core Authentication Tables

### 2a. Create Custom Users Table (Replaces auth.users)

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.users (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  email TEXT UNIQUE NOT NULL,\n  encrypted_password TEXT,\n  email_confirmed_at TIMESTAMPTZ,\n  invited_at TIMESTAMPTZ,\n  confirmation_token TEXT,\n  confirmation_sent_at TIMESTAMPTZ,\n  recovery_token TEXT,\n  recovery_sent_at TIMESTAMPTZ,\n  email_change_token_new TEXT,\n  email_change TEXT,\n  email_change_sent_at TIMESTAMPTZ,\n  last_sign_in_at TIMESTAMPTZ,\n  raw_app_meta_data JSONB DEFAULT '{}'::jsonb,\n  raw_user_meta_data JSONB DEFAULT '{}'::jsonb,\n  is_super_admin BOOLEAN DEFAULT false,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  phone TEXT,\n  phone_confirmed_at TIMESTAMPTZ,\n  phone_change TEXT,\n  phone_change_token TEXT,\n  phone_change_sent_at TIMESTAMPTZ,\n  confirmed_at TIMESTAMPTZ,\n  email_change_token_current TEXT,\n  email_change_confirm_status SMALLINT DEFAULT 0,\n  banned_until TIMESTAMPTZ,\n  reauthentication_token TEXT,\n  reauthentication_sent_at TIMESTAMPTZ,\n  is_sso_user BOOLEAN DEFAULT false NOT NULL,\n  deleted_at TIMESTAMPTZ\n);\n\nCREATE INDEX idx_users_email ON public.users(email);\nCREATE INDEX idx_users_phone ON public.users(phone);\n\nCOMMENT ON TABLE public.users IS 'Custom users table replacing Supabase auth.users for NeonDB compatibility';"
}'
```

### 2b. Create Roles Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.roles (\n  id SERIAL PRIMARY KEY,\n  name TEXT NOT NULL UNIQUE,\n  description TEXT,\n  permissions JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\n-- Insert default roles\nINSERT INTO public.roles (id, name, description) VALUES\n  (1, 'user', 'Regular pharmacist/applicant user'),\n  (2, 'admin_manager', 'Regional management access'),\n  (3, 'admin_regional', 'Regional view access'),\n  (4, 'super_admin', 'Full system access');\n\n-- Reset sequence to continue from 5\nSELECT setval('roles_id_seq', 4, true);\n\nCOMMENT ON TABLE public.roles IS 'User role definitions with hierarchy: 1=user, 2=admin_manager, 3=admin_regional, 4=super_admin';"
}'
```

### 2c. Create Profiles Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.profiles (\n  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,\n  first_name TEXT,\n  last_name TEXT,\n  email TEXT,\n  phone TEXT,\n  avatar_url TEXT,\n  role_id INTEGER NOT NULL DEFAULT 1 REFERENCES public.roles(id),\n  organization_id UUID,\n  preferences JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_profiles_email ON public.profiles(email);\nCREATE INDEX idx_profiles_role_id ON public.profiles(role_id);\nCREATE INDEX idx_profiles_organization_id ON public.profiles(organization_id);\n\nCOMMENT ON TABLE public.profiles IS 'User profile information linked to users table';"
}'
```

---

## STEP 3: Create Application Tables

### 3a. Create Pharmacist Applications Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.pharmacist_applications (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,\n  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'pending_documents')),\n  submitted_at TIMESTAMPTZ,\n  reviewed_at TIMESTAMPTZ,\n  reviewed_by UUID REFERENCES public.users(id),\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  \n  -- Personal Information\n  first_name TEXT,\n  middle_name TEXT,\n  last_name TEXT,\n  aliases_nicknames TEXT,\n  ssn_encrypted TEXT,\n  driver_license_state TEXT,\n  \n  -- Contact Information  \n  email TEXT,\n  phone TEXT,\n  mailing_address TEXT,\n  \n  -- Education Information\n  pharmacy_school_name TEXT,\n  pharmacy_degree TEXT CHECK (pharmacy_degree IN ('PharmD', 'BPharm', 'Associate', 'Master''s', 'Other')),\n  graduation_date DATE,\n  school_website TEXT,\n  school_mailing_address TEXT,\n  registrar_phone TEXT,\n  \n  -- Professional Information\n  npi_number TEXT,\n  state_license_number TEXT,\n  state_license_state TEXT,\n  license_date_issued DATE,\n  license_expiration_date DATE,\n  dea_certificate_number TEXT,\n  caqh_profile_id TEXT,\n  medicaid_number TEXT,\n  medicare_certification_number TEXT,\n  \n  -- Work History\n  has_work_gaps BOOLEAN DEFAULT false,\n  work_gap_explanation TEXT,\n  \n  -- Languages\n  languages_spoken TEXT[],\n  other_languages TEXT,\n  \n  -- Medicare Information\n  medicare_certified BOOLEAN,\n  medicare_cert_level TEXT CHECK (medicare_cert_level IN ('individual', 'pharmacy')),\n  medicare_details TEXT,\n  \n  -- Completion tracking\n  section_personal_complete BOOLEAN DEFAULT false,\n  section_education_complete BOOLEAN DEFAULT false,\n  section_professional_complete BOOLEAN DEFAULT false,\n  section_documents_complete BOOLEAN DEFAULT false,\n  overall_completion_percentage INTEGER DEFAULT 0 CHECK (overall_completion_percentage >= 0 AND overall_completion_percentage <= 100),\n  \n  -- Application metadata\n  submission_source TEXT DEFAULT 'internal_form',\n  external_form_id TEXT,\n  notes_internal TEXT\n);\n\nCREATE INDEX idx_pharmacist_applications_user_id ON public.pharmacist_applications(user_id);\nCREATE INDEX idx_pharmacist_applications_status ON public.pharmacist_applications(status);\nCREATE INDEX idx_pharmacist_applications_submitted_at ON public.pharmacist_applications(submitted_at);\nCREATE INDEX idx_pharmacist_applications_npi ON public.pharmacist_applications(npi_number);\n\nCOMMENT ON TABLE public.pharmacist_applications IS 'Pharmacist credentialing applications with comprehensive professional information';"
}'
```

### 3b. Create Pharmacy Applications Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.pharmacy_applications (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,\n  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'pending_documents')),\n  submitted_at TIMESTAMPTZ,\n  reviewed_at TIMESTAMPTZ,\n  reviewed_by UUID REFERENCES public.users(id),\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  \n  -- Facility Information\n  facility_name TEXT,\n  facility_type TEXT CHECK (facility_type IN ('independent', 'chain', 'hospital', 'clinic')),\n  business_license_number TEXT,\n  tax_id TEXT,\n  npi_number TEXT,\n  \n  -- Address Information\n  facility_address TEXT,\n  mailing_address TEXT,\n  \n  -- Contact Information\n  primary_contact_name TEXT,\n  primary_contact_email TEXT,\n  primary_contact_phone TEXT,\n  \n  -- Business Information\n  ownership_structure TEXT,\n  parent_company TEXT,\n  chain_name TEXT,\n  number_of_locations INTEGER,\n  \n  -- Certifications\n  dea_registration TEXT,\n  state_pharmacy_license TEXT,\n  medicare_provider_number TEXT,\n  medicaid_provider_number TEXT,\n  \n  -- Associated Pharmacists\n  pharmacist_count INTEGER DEFAULT 0,\n  head_pharmacist_name TEXT,\n  head_pharmacist_license TEXT,\n  \n  -- Completion tracking\n  overall_completion_percentage INTEGER DEFAULT 0 CHECK (overall_completion_percentage >= 0 AND overall_completion_percentage <= 100),\n  \n  -- Application metadata\n  submission_source TEXT DEFAULT 'internal_form',\n  external_form_id TEXT,\n  notes_internal TEXT\n);\n\nCREATE INDEX idx_pharmacy_applications_user_id ON public.pharmacy_applications(user_id);\nCREATE INDEX idx_pharmacy_applications_status ON public.pharmacy_applications(status);\nCREATE INDEX idx_pharmacy_applications_submitted_at ON public.pharmacy_applications(submitted_at);\n\nCOMMENT ON TABLE public.pharmacy_applications IS 'Pharmacy facility credentialing applications';"
}'
```

### 3c. Create Application Documents Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.application_documents (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  application_id UUID NOT NULL,\n  application_type TEXT NOT NULL CHECK (application_type IN ('pharmacist', 'pharmacy')),\n  document_type TEXT NOT NULL,\n  file_name TEXT NOT NULL,\n  file_path TEXT NOT NULL,\n  file_size INTEGER,\n  mime_type TEXT,\n  uploaded_by UUID REFERENCES public.users(id),\n  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  is_required BOOLEAN DEFAULT true,\n  is_verified BOOLEAN DEFAULT false,\n  verified_by UUID REFERENCES public.users(id),\n  verified_at TIMESTAMPTZ,\n  verification_notes TEXT,\n  \n  -- Document metadata\n  document_category TEXT CHECK (document_category IN ('identification', 'education', 'license', 'insurance', 'certification', 'other')),\n  expiration_date DATE,\n  document_number TEXT,\n  issuing_authority TEXT\n);\n\nCREATE INDEX idx_application_documents_application_id ON public.application_documents(application_id, application_type);\nCREATE INDEX idx_application_documents_type ON public.application_documents(document_type);\nCREATE INDEX idx_application_documents_uploaded_at ON public.application_documents(uploaded_at);\nCREATE INDEX idx_application_documents_expiration_date ON public.application_documents(expiration_date) WHERE expiration_date IS NOT NULL;\n\nCOMMENT ON TABLE public.application_documents IS 'Document uploads for pharmacist and pharmacy applications with verification tracking';"
}'
```

### 3d. Create Application Notes Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.application_notes (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  application_id UUID NOT NULL,\n  application_type TEXT NOT NULL CHECK (application_type IN ('pharmacist', 'pharmacy')),\n  note_type TEXT NOT NULL DEFAULT 'general' CHECK (note_type IN ('general', 'document_review', 'verification', 'compliance', 'follow_up')),\n  note_content TEXT NOT NULL,\n  created_by UUID NOT NULL REFERENCES public.users(id),\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  is_urgent BOOLEAN DEFAULT false,\n  is_resolved BOOLEAN DEFAULT false,\n  resolved_by UUID REFERENCES public.users(id),\n  resolved_at TIMESTAMPTZ,\n  \n  -- Note categorization\n  category TEXT CHECK (category IN ('review', 'document_issue', 'verification', 'compliance', 'other')),\n  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))\n);\n\nCREATE INDEX idx_application_notes_application_id ON public.application_notes(application_id, application_type);\nCREATE INDEX idx_application_notes_created_at ON public.application_notes(created_at DESC);\nCREATE INDEX idx_application_notes_priority ON public.application_notes(priority) WHERE is_resolved = false;\n\nCOMMENT ON TABLE public.application_notes IS 'Internal notes for application review and processing';"
}'
```

### 3e. Create Application Updates Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.application_updates (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  application_id UUID NOT NULL,\n  application_type TEXT NOT NULL CHECK (application_type IN ('pharmacist', 'pharmacy')),\n  update_type TEXT NOT NULL DEFAULT 'status_change' CHECK (update_type IN ('status_change', 'document_request', 'approval', 'rejection', 'general_update')),\n  title TEXT NOT NULL,\n  message TEXT NOT NULL,\n  created_by UUID NOT NULL REFERENCES public.users(id),\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  is_visible_to_applicant BOOLEAN DEFAULT true,\n  requires_action BOOLEAN DEFAULT false,\n  action_deadline DATE,\n  is_read BOOLEAN DEFAULT false,\n  read_at TIMESTAMPTZ,\n  \n  -- Update categorization\n  status_change_from TEXT,\n  status_change_to TEXT,\n  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))\n);\n\nCREATE INDEX idx_application_updates_application_id ON public.application_updates(application_id, application_type);\nCREATE INDEX idx_application_updates_created_at ON public.application_updates(created_at DESC);\nCREATE INDEX idx_application_updates_requires_action ON public.application_updates(requires_action) WHERE is_read = false;\n\nCOMMENT ON TABLE public.application_updates IS 'Status updates and notifications for applications visible to applicants';"
}'
```

### 3f. Create Pharmacist-Pharmacy Associations Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.pharmacist_pharmacy_associations (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  pharmacist_application_id UUID NOT NULL REFERENCES public.pharmacist_applications(id) ON DELETE CASCADE,\n  pharmacy_application_id UUID NOT NULL REFERENCES public.pharmacy_applications(id) ON DELETE CASCADE,\n  association_type TEXT NOT NULL CHECK (association_type IN ('employee', 'owner', 'contractor', 'consultant')),\n  start_date DATE,\n  end_date DATE,\n  is_primary_location BOOLEAN DEFAULT false,\n  employment_status TEXT CHECK (employment_status IN ('active', 'inactive', 'terminated')),\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  \n  UNIQUE(pharmacist_application_id, pharmacy_application_id)\n);\n\nCREATE INDEX idx_associations_pharmacist_id ON public.pharmacist_pharmacy_associations(pharmacist_application_id);\nCREATE INDEX idx_associations_pharmacy_id ON public.pharmacist_pharmacy_associations(pharmacy_application_id);\n\nCOMMENT ON TABLE public.pharmacist_pharmacy_associations IS 'Links pharmacists to pharmacy facilities with employment details';"
}'
```

---

## STEP 4: Create Questionnaire Tables

### 4a. Create Pharmacist Questionnaires Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.pharmacist_questionnaires (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,\n  application_id UUID REFERENCES public.pharmacist_applications(id) ON DELETE CASCADE,\n  \n  -- Personal Information\n  full_name TEXT NOT NULL,\n  date_of_birth DATE,\n  ssn_last_four TEXT,\n  home_address TEXT,\n  city TEXT,\n  state TEXT,\n  zip_code TEXT,\n  phone_number TEXT,\n  email TEXT,\n  \n  -- Professional Information\n  license_number TEXT,\n  license_state TEXT,\n  license_expiration DATE,\n  npi_number TEXT,\n  dea_number TEXT,\n  years_of_experience INTEGER,\n  pharmacy_school TEXT,\n  graduation_year INTEGER,\n  \n  -- Employment History\n  current_employer TEXT,\n  employer_address TEXT,\n  position_title TEXT,\n  employment_start_date DATE,\n  previous_employers JSONB,\n  \n  -- Certifications & Training\n  certifications JSONB,\n  immunization_certified BOOLEAN DEFAULT false,\n  cpr_certified BOOLEAN DEFAULT false,\n  specialized_training TEXT[],\n  \n  -- Insurance & Liability\n  malpractice_insurance_carrier TEXT,\n  policy_number TEXT,\n  policy_expiration DATE,\n  coverage_amount TEXT,\n  claims_history JSONB,\n  \n  -- References\n  professional_references JSONB,\n  \n  -- Compliance & Background\n  criminal_history BOOLEAN DEFAULT false,\n  criminal_history_explanation TEXT,\n  disciplinary_action BOOLEAN DEFAULT false,\n  disciplinary_action_explanation TEXT,\n  \n  -- Additional Information\n  languages_spoken TEXT[],\n  available_start_date DATE,\n  preferred_work_schedule TEXT,\n  willing_to_travel BOOLEAN DEFAULT false,\n  additional_notes TEXT,\n  \n  -- Metadata\n  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),\n  submitted_at TIMESTAMPTZ,\n  reviewed_at TIMESTAMPTZ,\n  reviewed_by UUID REFERENCES public.users(id),\n  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,\n  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_pharmacist_questionnaires_user_id ON public.pharmacist_questionnaires(user_id);\nCREATE INDEX idx_pharmacist_questionnaires_application_id ON public.pharmacist_questionnaires(application_id);\nCREATE INDEX idx_pharmacist_questionnaires_status ON public.pharmacist_questionnaires(status);\n\nCOMMENT ON TABLE public.pharmacist_questionnaires IS 'Detailed questionnaire responses from pharmacists for credentialing';"
}'
```

### 4b. Create Facility Questionnaires Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.facility_questionnaires (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  organization_id UUID,\n  submitted_by UUID REFERENCES public.users(id),\n  \n  -- Facility Information\n  facility_name TEXT NOT NULL,\n  facility_type TEXT,\n  facility_npi TEXT,\n  tax_id TEXT,\n  \n  -- Location Details\n  primary_address TEXT,\n  city TEXT,\n  state TEXT,\n  zip_code TEXT,\n  phone TEXT,\n  fax TEXT,\n  email TEXT,\n  website TEXT,\n  \n  -- Business Information\n  ownership_type TEXT,\n  years_in_operation INTEGER,\n  number_of_locations INTEGER,\n  annual_prescription_volume INTEGER,\n  \n  -- Licensing & Accreditation\n  state_pharmacy_license TEXT,\n  license_expiration DATE,\n  dea_registration TEXT,\n  dea_expiration DATE,\n  accreditations JSONB,\n  \n  -- Insurance Information\n  liability_insurance_carrier TEXT,\n  liability_policy_number TEXT,\n  liability_coverage_amount TEXT,\n  liability_expiration DATE,\n  general_insurance_carrier TEXT,\n  general_policy_number TEXT,\n  general_expiration DATE,\n  \n  -- Services Offered\n  services_offered TEXT[],\n  specialty_services TEXT[],\n  delivery_available BOOLEAN DEFAULT false,\n  compounding_services BOOLEAN DEFAULT false,\n  immunization_services BOOLEAN DEFAULT false,\n  medication_therapy_management BOOLEAN DEFAULT false,\n  \n  -- Staffing Information\n  total_pharmacists INTEGER,\n  total_technicians INTEGER,\n  total_support_staff INTEGER,\n  pharmacist_to_tech_ratio TEXT,\n  hours_of_operation JSONB,\n  \n  -- Technology & Systems\n  pharmacy_management_system TEXT,\n  e_prescribing_enabled BOOLEAN DEFAULT false,\n  electronic_health_records BOOLEAN DEFAULT false,\n  automated_dispensing BOOLEAN DEFAULT false,\n  inventory_management_system TEXT,\n  \n  -- Quality & Compliance\n  quality_assurance_program BOOLEAN DEFAULT false,\n  quality_program_description TEXT,\n  hipaa_compliant BOOLEAN DEFAULT false,\n  last_board_inspection DATE,\n  inspection_results TEXT,\n  citations_or_violations JSONB,\n  \n  -- Financial Information\n  accepts_medicare BOOLEAN DEFAULT false,\n  accepts_medicaid BOOLEAN DEFAULT false,\n  insurance_contracts TEXT[],\n  preferred_wholesaler TEXT,\n  payment_terms_accepted TEXT[],\n  \n  -- Emergency Preparedness\n  emergency_plan BOOLEAN DEFAULT false,\n  backup_power_system BOOLEAN DEFAULT false,\n  disaster_recovery_plan BOOLEAN DEFAULT false,\n  \n  -- Additional Information\n  chain_affiliation TEXT,\n  buying_group_membership TEXT,\n  professional_associations TEXT[],\n  awards_recognitions TEXT[],\n  additional_notes TEXT,\n  \n  -- Metadata\n  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),\n  submitted_at TIMESTAMPTZ,\n  reviewed_at TIMESTAMPTZ,\n  reviewed_by UUID REFERENCES public.users(id),\n  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,\n  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_facility_questionnaires_organization_id ON public.facility_questionnaires(organization_id);\nCREATE INDEX idx_facility_questionnaires_status ON public.facility_questionnaires(status);\nCREATE INDEX idx_facility_questionnaires_submitted_by ON public.facility_questionnaires(submitted_by);\n\nCOMMENT ON TABLE public.facility_questionnaires IS 'Comprehensive facility questionnaire for pharmacy credentialing';"
}'
```

### 4c. Create Questionnaire Documents Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.questionnaire_documents (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  pharmacist_questionnaire_id UUID REFERENCES public.pharmacist_questionnaires(id) ON DELETE CASCADE,\n  facility_questionnaire_id UUID REFERENCES public.facility_questionnaires(id) ON DELETE CASCADE,\n  document_type TEXT NOT NULL,\n  document_name TEXT NOT NULL,\n  file_path TEXT NOT NULL,\n  file_size INTEGER,\n  mime_type TEXT,\n  uploaded_by UUID REFERENCES public.users(id),\n  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,\n  \n  -- Ensure document belongs to either pharmacist or facility questionnaire, not both\n  CHECK (\n    (pharmacist_questionnaire_id IS NOT NULL AND facility_questionnaire_id IS NULL) OR\n    (pharmacist_questionnaire_id IS NULL AND facility_questionnaire_id IS NOT NULL)\n  )\n);\n\nCREATE INDEX idx_questionnaire_documents_pharmacist ON public.questionnaire_documents(pharmacist_questionnaire_id);\nCREATE INDEX idx_questionnaire_documents_facility ON public.questionnaire_documents(facility_questionnaire_id);\n\nCOMMENT ON TABLE public.questionnaire_documents IS 'Document uploads associated with questionnaire submissions';"
}'
```

---

## STEP 5: Create Messaging and Communication Tables

### 5a. Create Developer Messages Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.developer_messages (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  message TEXT NOT NULL,\n  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,\n  sender_type TEXT NOT NULL CHECK (sender_type IN ('developer', 'admin')),\n  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('developer', 'admin', 'all')),\n  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),\n  thread_id UUID,\n  metadata JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_developer_messages_sender_id ON public.developer_messages(sender_id);\nCREATE INDEX idx_developer_messages_created_at ON public.developer_messages(created_at DESC);\nCREATE INDEX idx_developer_messages_status ON public.developer_messages(status);\nCREATE INDEX idx_developer_messages_thread_id ON public.developer_messages(thread_id) WHERE thread_id IS NOT NULL;\n\nCOMMENT ON TABLE public.developer_messages IS 'Messaging system for developer-admin communication';"
}'
```

### 5b. Create AI Analysis Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.ai_analysis (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  message_id UUID NOT NULL REFERENCES public.developer_messages(id) ON DELETE CASCADE,\n  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('bug_report', 'question', 'feature_request', 'general')),\n  generated_prompt TEXT,\n  suggested_response TEXT,\n  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),\n  sources TEXT[],\n  developer_approved BOOLEAN DEFAULT NULL,\n  developer_notes TEXT,\n  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_ai_analysis_message_id ON public.ai_analysis(message_id);\nCREATE INDEX idx_ai_analysis_processed_at ON public.ai_analysis(processed_at DESC);\nCREATE INDEX idx_ai_analysis_type ON public.ai_analysis(analysis_type);\n\nCOMMENT ON TABLE public.ai_analysis IS 'AI-powered analysis of developer messages for automated response generation';"
}'
```

---

## STEP 6: Create Notification System Tables

### 6a. Create Notification Preferences Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.notification_preferences (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,\n  \n  -- Email preferences\n  email_notifications BOOLEAN NOT NULL DEFAULT true,\n  email_frequency TEXT NOT NULL DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'hourly', 'daily', 'weekly', 'off')),\n  developer_messages_email BOOLEAN NOT NULL DEFAULT true,\n  system_alerts_email BOOLEAN NOT NULL DEFAULT true,\n  application_updates_email BOOLEAN NOT NULL DEFAULT true,\n  \n  -- SMS preferences\n  sms_enabled BOOLEAN NOT NULL DEFAULT false,\n  phone_number TEXT,\n  phone_verified BOOLEAN NOT NULL DEFAULT false,\n  sms_critical_only BOOLEAN NOT NULL DEFAULT true,\n  \n  -- Browser notifications\n  browser_notifications BOOLEAN NOT NULL DEFAULT true,\n  push_subscription JSONB,\n  \n  -- Sound and haptic preferences\n  sound_enabled BOOLEAN NOT NULL DEFAULT true,\n  haptic_enabled BOOLEAN NOT NULL DEFAULT true,\n  notification_sound TEXT DEFAULT 'default',\n  \n  -- Quiet hours and timezone\n  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,\n  quiet_hours_start TIME DEFAULT '22:00',\n  quiet_hours_end TIME DEFAULT '08:00',\n  timezone TEXT DEFAULT 'UTC',\n  \n  -- Priority-based routing\n  critical_channels TEXT[] DEFAULT ARRAY['email', 'sms', 'push'],\n  high_channels TEXT[] DEFAULT ARRAY['email', 'push'],\n  normal_channels TEXT[] DEFAULT ARRAY['email'],\n  low_channels TEXT[] DEFAULT ARRAY['dashboard'],\n  \n  -- Escalation settings\n  escalation_enabled BOOLEAN NOT NULL DEFAULT false,\n  escalation_delay_minutes INTEGER DEFAULT 30,\n  escalation_recipient_id UUID REFERENCES public.users(id),\n  \n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);\n\nCOMMENT ON TABLE public.notification_preferences IS 'User notification preferences for multi-channel delivery system';"
}'
```

### 6b. Create Notification Logs Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.notification_logs (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,\n  message_id UUID NOT NULL REFERENCES public.developer_messages(id) ON DELETE CASCADE,\n  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'browser', 'in_app', 'sms', 'push')),\n  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),\n  sent_at TIMESTAMPTZ,\n  delivered_at TIMESTAMPTZ,\n  read_at TIMESTAMPTZ,\n  error_message TEXT,\n  metadata JSONB DEFAULT '{}'::jsonb,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_notification_logs_user_id ON public.notification_logs(user_id);\nCREATE INDEX idx_notification_logs_message_id ON public.notification_logs(message_id);\nCREATE INDEX idx_notification_logs_status ON public.notification_logs(status);\nCREATE INDEX idx_notification_logs_sent_at ON public.notification_logs(sent_at DESC) WHERE sent_at IS NOT NULL;\n\nCOMMENT ON TABLE public.notification_logs IS 'Delivery tracking for all notification types';"
}'
```

### 6c. Create Notification Templates Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.notification_templates (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name TEXT NOT NULL UNIQUE,\n  category TEXT NOT NULL,\n  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),\n  \n  -- Template content\n  subject_template TEXT,\n  body_template TEXT NOT NULL,\n  variables JSONB DEFAULT '{}'::jsonb,\n  \n  -- Customization\n  is_system_template BOOLEAN NOT NULL DEFAULT true,\n  organization_id UUID,\n  \n  -- Metadata\n  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),\n  is_active BOOLEAN NOT NULL DEFAULT true,\n  \n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_notification_templates_name ON public.notification_templates(name);\nCREATE INDEX idx_notification_templates_category ON public.notification_templates(category);\nCREATE INDEX idx_notification_templates_channel ON public.notification_templates(channel);\n\n-- Insert default templates\nINSERT INTO public.notification_templates (name, category, channel, subject_template, body_template, priority) VALUES\n('developer_message_email', 'messaging', 'email', 'New Message from Developer', 'You have received a new message: {{message}}', 'normal'),\n('system_alert_email', 'system', 'email', 'System Alert', 'System alert: {{alert_message}}', 'high'),\n('critical_alert_sms', 'system', 'sms', NULL, 'CRITICAL: {{alert_message}}', 'critical'),\n('developer_message_sms', 'messaging', 'sms', NULL, 'New message: {{message}}', 'normal'),\n('developer_message_push', 'messaging', 'push', 'New Message', '{{sender}} sent you a message', 'normal'),\n('system_alert_push', 'system', 'push', 'System Alert', '{{alert_message}}', 'high');\n\nCOMMENT ON TABLE public.notification_templates IS 'Reusable notification templates for multi-channel delivery';"
}'
```

### 6d. Create Notification Channels Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.notification_channels (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  notification_id UUID NOT NULL REFERENCES public.notification_logs(id) ON DELETE CASCADE,\n  \n  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),\n  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),\n  \n  -- Channel-specific data\n  channel_data JSONB DEFAULT '{}'::jsonb,\n  \n  -- Delivery tracking\n  sent_at TIMESTAMPTZ,\n  delivered_at TIMESTAMPTZ,\n  read_at TIMESTAMPTZ,\n  failed_at TIMESTAMPTZ,\n  \n  -- Error handling\n  error_message TEXT,\n  retry_count INTEGER DEFAULT 0,\n  max_retries INTEGER DEFAULT 3,\n  next_retry_at TIMESTAMPTZ,\n  \n  -- Costs and analytics\n  cost_cents INTEGER DEFAULT 0,\n  provider_id TEXT,\n  provider_response JSONB,\n  \n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_notification_channels_notification_id ON public.notification_channels(notification_id);\nCREATE INDEX idx_notification_channels_status ON public.notification_channels(status);\nCREATE INDEX idx_notification_channels_channel ON public.notification_channels(channel);\n\nCOMMENT ON TABLE public.notification_channels IS 'Individual channel delivery tracking for notifications';"
}'
```

### 6e. Create Notification Queue Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.notification_queue (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  notification_id UUID NOT NULL REFERENCES public.notification_logs(id) ON DELETE CASCADE,\n  \n  -- Queue management\n  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),\n  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),\n  processing_started_at TIMESTAMPTZ,\n  processed_at TIMESTAMPTZ,\n  \n  -- Processing data\n  channels_to_process TEXT[] NOT NULL,\n  processing_attempts INTEGER DEFAULT 0,\n  max_attempts INTEGER DEFAULT 5,\n  \n  -- Status\n  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),\n  error_message TEXT,\n  \n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_notification_queue_scheduled_for ON public.notification_queue(scheduled_for) WHERE status = 'queued';\nCREATE INDEX idx_notification_queue_status ON public.notification_queue(status);\nCREATE INDEX idx_notification_queue_priority ON public.notification_queue(priority DESC, scheduled_for ASC) WHERE status = 'queued';\n\nCOMMENT ON TABLE public.notification_queue IS 'Queue for processing notifications asynchronously';"
}'
```

### 6f. Create Notification Analytics Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.notification_analytics (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  \n  -- Time period\n  date DATE NOT NULL,\n  hour INTEGER CHECK (hour BETWEEN 0 AND 23),\n  \n  -- Metrics\n  channel TEXT NOT NULL,\n  total_sent INTEGER DEFAULT 0,\n  total_delivered INTEGER DEFAULT 0,\n  total_failed INTEGER DEFAULT 0,\n  total_read INTEGER DEFAULT 0,\n  \n  -- Performance metrics\n  avg_delivery_time_seconds INTEGER,\n  total_cost_cents INTEGER DEFAULT 0,\n  \n  -- User segmentation\n  user_role TEXT,\n  priority TEXT,\n  category TEXT,\n  \n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  \n  UNIQUE(date, hour, channel, user_role, priority, category)\n);\n\nCREATE INDEX idx_notification_analytics_date ON public.notification_analytics(date DESC);\nCREATE INDEX idx_notification_analytics_channel ON public.notification_analytics(channel, date DESC);\n\nCOMMENT ON TABLE public.notification_analytics IS 'Aggregated analytics for notification delivery performance';"
}'
```

---

## STEP 7: Create Logging and Audit Tables

### 7a. Create Application Logs Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.application_logs (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),\n  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),\n  message TEXT NOT NULL,\n  metadata JSONB DEFAULT '{}'::jsonb,\n  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,\n  session_id TEXT,\n  request_id TEXT,\n  user_agent TEXT,\n  ip_address INET,\n  route TEXT,\n  component TEXT,\n  error_stack TEXT,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_application_logs_timestamp ON public.application_logs(timestamp DESC);\nCREATE INDEX idx_application_logs_level ON public.application_logs(level) WHERE level IN ('error', 'fatal');\nCREATE INDEX idx_application_logs_user_id ON public.application_logs(user_id) WHERE user_id IS NOT NULL;\nCREATE INDEX idx_application_logs_component ON public.application_logs(component);\nCREATE INDEX idx_application_logs_session_id ON public.application_logs(session_id) WHERE session_id IS NOT NULL;\n\nCOMMENT ON TABLE public.application_logs IS 'Centralized application logging with 30-day retention policy';"
}'
```

### 7b. Create User Activity Logs Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.user_activity_logs (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id UUID NOT NULL REFERENCES public.users(id),\n  action TEXT NOT NULL,\n  details JSONB DEFAULT '{}'::jsonb,\n  performed_by UUID NOT NULL REFERENCES public.users(id),\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id, created_at DESC);\nCREATE INDEX idx_user_activity_logs_performed_by ON public.user_activity_logs(performed_by);\nCREATE INDEX idx_user_activity_logs_action ON public.user_activity_logs(action);\n\nCOMMENT ON TABLE public.user_activity_logs IS 'Audit trail for user actions, especially role changes';"
}'
```

### 7c. Create User Invitations Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.user_invitations (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  email TEXT NOT NULL,\n  token TEXT NOT NULL UNIQUE,\n  role_id INTEGER NOT NULL REFERENCES public.roles(id),\n  invited_by UUID NOT NULL REFERENCES public.users(id),\n  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),\n  accepted_at TIMESTAMPTZ,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_user_invitations_email ON public.user_invitations(email);\nCREATE INDEX idx_user_invitations_token ON public.user_invitations(token);\nCREATE INDEX idx_user_invitations_expires_at ON public.user_invitations(expires_at) WHERE accepted_at IS NULL;\n\nCOMMENT ON TABLE public.user_invitations IS 'User invitation system with 7-day expiration';"
}'
```

---

## STEP 8: Create Contact Forms Table

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE TABLE public.contact_submissions (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name TEXT NOT NULL,\n  email TEXT NOT NULL,\n  phone TEXT,\n  message TEXT NOT NULL,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  \n  -- Status tracking\n  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'resolved')),\n  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),\n  \n  -- Response tracking\n  responded_at TIMESTAMPTZ,\n  responded_by UUID REFERENCES public.users(id),\n  response_notes TEXT,\n  \n  -- Metadata\n  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'api', 'import')),\n  user_agent TEXT,\n  ip_address INET,\n  referrer TEXT,\n  \n  -- Email tracking\n  email_sent BOOLEAN DEFAULT false,\n  email_sent_at TIMESTAMPTZ,\n  email_error TEXT\n);\n\nCREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);\nCREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);\nCREATE INDEX idx_contact_submissions_email ON public.contact_submissions(email);\nCREATE INDEX idx_contact_submissions_priority ON public.contact_submissions(priority) WHERE status != 'resolved';\n\nCOMMENT ON TABLE public.contact_submissions IS 'Public contact form submissions from website visitors';"
}'
```

---

## STEP 9: Create Helper Functions

### 9a. Function to Get Current User Role ID

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE OR REPLACE FUNCTION public.get_current_user_role_id()\nRETURNS INTEGER\nLANGUAGE sql\nSECURITY DEFINER\nSTABLE\nAS $$\n  SELECT COALESCE(\n    (SELECT role_id FROM public.profiles WHERE id = current_setting('app.current_user_id', true)::uuid),\n    1\n  );\n$$;\n\nCOMMENT ON FUNCTION public.get_current_user_role_id IS 'Safely retrieves current user role_id for RLS policies';"
}'
```

### 9b. Function to Clean Up Old Logs

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE OR REPLACE FUNCTION public.cleanup_old_logs()\nRETURNS void\nLANGUAGE plpgsql\nSECURITY DEFINER\nAS $$\nBEGIN\n  -- Delete logs older than 30 days\n  DELETE FROM public.application_logs\n  WHERE created_at < NOW() - INTERVAL '30 days';\nEND;\n$$;\n\nCOMMENT ON FUNCTION public.cleanup_old_logs IS 'Deletes application logs older than 30 days (retention policy)';"
}'
```

### 9c. Trigger Function for Updated Timestamps

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "CREATE OR REPLACE FUNCTION public.update_updated_at_column()\nRETURNS TRIGGER\nLANGUAGE plpgsql\nAS $$\nBEGIN\n  NEW.updated_at = NOW();\n  RETURN NEW;\nEND;\n$$;\n\nCOMMENT ON FUNCTION public.update_updated_at_column IS 'Trigger function to automatically update updated_at timestamp';"
}'
```

---

## STEP 10: Create Triggers

### 10a. Create Triggers for Timestamp Updates

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "-- Triggers for updated_at on tables with that column\nCREATE TRIGGER update_roles_timestamp BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_pharmacist_applications_timestamp BEFORE UPDATE ON public.pharmacist_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_pharmacy_applications_timestamp BEFORE UPDATE ON public.pharmacy_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_application_notes_timestamp BEFORE UPDATE ON public.application_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_pharmacist_pharmacy_associations_timestamp BEFORE UPDATE ON public.pharmacist_pharmacy_associations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_pharmacist_questionnaires_timestamp BEFORE UPDATE ON public.pharmacist_questionnaires FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_facility_questionnaires_timestamp BEFORE UPDATE ON public.facility_questionnaires FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_developer_messages_timestamp BEFORE UPDATE ON public.developer_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_ai_analysis_timestamp BEFORE UPDATE ON public.ai_analysis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_notification_preferences_timestamp BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_notification_templates_timestamp BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_notification_channels_timestamp BEFORE UPDATE ON public.notification_channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_notification_queue_timestamp BEFORE UPDATE ON public.notification_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_user_invitations_timestamp BEFORE UPDATE ON public.user_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();\nCREATE TRIGGER update_contact_submissions_timestamp BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();"
}'
```

---

## STEP 11: Enable Row Level Security (RLS)

### 11a. Enable RLS on All Tables

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "-- Enable RLS on all tables\nALTER TABLE public.users ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.pharmacist_applications ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.pharmacy_applications ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.application_updates ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.pharmacist_pharmacy_associations ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.pharmacist_questionnaires ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.facility_questionnaires ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.questionnaire_documents ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.developer_messages ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.notification_analytics ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;"
}'
```

---

## VERIFICATION STEPS

After running all the above commands, verify the schema was created successfully:

```bash
# Check tables
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "SELECT tablename FROM pg_tables WHERE schemaname = '\''public'\'' ORDER BY tablename;"
}'

# Check table counts
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "SELECT COUNT(*) as table_count FROM pg_tables WHERE schemaname = '\''public'\'';"
}'

# Verify roles data
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "SELECT * FROM public.roles ORDER BY id;"
}'
```

---

## ROLLBACK INSTRUCTIONS

If you need to rollback the entire schema:

```bash
curl -X POST \
  "https://ep-rough-leaf-ahl8nq8p.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1/sql" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "-- DANGER: This will drop ALL tables and data\nDROP SCHEMA public CASCADE;\nCREATE SCHEMA public;\nGRANT ALL ON SCHEMA public TO postgres;\nGRANT ALL ON SCHEMA public TO public;"
}'
```

---

## NOTES

1. **RLS Policies Not Included**: Due to length constraints, detailed RLS policies are not included. They would need to reference `current_setting('app.current_user_id')` for user context.

2. **Missing Organizations Table**: The `facility_questionnaires` table references `organization_id` but no organizations table was found in your migrations. You may need to create this separately.

3. **Authentication Context**: Since NeonDB doesn't have Supabase's built-in auth context, you'll need to implement `SET LOCAL app.current_user_id = 'uuid'` in your application layer before queries to make RLS work.

4. **Testing Required**: Test thoroughly in a development database before running in production.

5. **No Sample Data**: No sample data was found in your migrations, so only schema structure is included.

---

## END OF MIGRATION GUIDE

**Total Tables:** 24
**Total Functions:** 3
**Total Triggers:** 16
**Estimated Execution Time:** 2-3 minutes
