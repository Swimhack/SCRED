#!/usr/bin/env python3
"""
NeonDB Schema Migration Script
Migrates StreetCredRX database schema to NeonDB PostgreSQL
"""

import psycopg2
import sys
from datetime import datetime

# Connection string
CONN_STRING = 'postgresql://neondb_owner:npg_1GEjV8oCAUNZ@ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'

def log(message):
    """Print timestamped log message"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] {message}")

def execute_sql(conn, sql, description):
    """Execute SQL and handle errors"""
    try:
        log(f"Executing: {description}")
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
        cur.close()
        log(f"SUCCESS: {description}")
        return True
    except Exception as e:
        conn.rollback()
        log(f"ERROR: {description}")
        log(f"Error details: {str(e)}")
        return False

def main():
    log("Starting NeonDB Schema Migration")
    log("="*60)

    try:
        # Connect to database
        log("Connecting to NeonDB...")
        conn = psycopg2.connect(CONN_STRING)
        log("Connected successfully!")

        # Step 1: Create extensions
        log("\n=== STEP 1: Creating Extensions ===")
        execute_sql(conn, '''
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        ''', "Create PostgreSQL extensions")

        # Step 2: Create roles table
        log("\n=== STEP 2: Creating Roles Table ===")
        execute_sql(conn, '''
            CREATE TABLE IF NOT EXISTS public.roles (
              id SERIAL PRIMARY KEY,
              name TEXT NOT NULL UNIQUE,
              description TEXT,
              permissions JSONB DEFAULT '{}'::jsonb,
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );

            -- Insert default roles
            INSERT INTO public.roles (id, name, description) VALUES
              (1, 'user', 'Regular pharmacist/applicant user'),
              (2, 'admin_manager', 'Regional management access'),
              (3, 'admin_regional', 'Regional view access'),
              (4, 'super_admin', 'Full system access')
            ON CONFLICT (id) DO NOTHING;

            SELECT setval('roles_id_seq', 4, true);
        ''', "Create roles table with default roles")

        # Step 3: Create users table (replaces auth.users)
        log("\n=== STEP 3: Creating Users Table ===")
        execute_sql(conn, '''
            CREATE TABLE IF NOT EXISTS public.users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              email TEXT UNIQUE NOT NULL,
              encrypted_password TEXT,
              email_confirmed_at TIMESTAMPTZ,
              invited_at TIMESTAMPTZ,
              confirmation_token TEXT,
              confirmation_sent_at TIMESTAMPTZ,
              recovery_token TEXT,
              recovery_sent_at TIMESTAMPTZ,
              email_change_token_new TEXT,
              email_change TEXT,
              email_change_sent_at TIMESTAMPTZ,
              last_sign_in_at TIMESTAMPTZ,
              raw_app_meta_data JSONB DEFAULT '{}'::jsonb,
              raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
              is_super_admin BOOLEAN DEFAULT false,
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              phone TEXT,
              phone_confirmed_at TIMESTAMPTZ,
              phone_change TEXT,
              phone_change_token TEXT,
              phone_change_sent_at TIMESTAMPTZ,
              confirmed_at TIMESTAMPTZ,
              email_change_token_current TEXT,
              email_change_confirm_status SMALLINT DEFAULT 0,
              banned_until TIMESTAMPTZ,
              reauthentication_token TEXT,
              reauthentication_sent_at TIMESTAMPTZ,
              is_sso_user BOOLEAN DEFAULT false NOT NULL,
              deleted_at TIMESTAMPTZ
            );

            CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
            CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
        ''', "Create users table")

        # Step 4: Create profiles table
        log("\n=== STEP 4: Creating Profiles Table ===")
        execute_sql(conn, '''
            CREATE TABLE IF NOT EXISTS public.profiles (
              id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
              first_name TEXT,
              last_name TEXT,
              email TEXT,
              phone TEXT,
              avatar_url TEXT,
              role_id INTEGER NOT NULL DEFAULT 1 REFERENCES public.roles(id),
              organization_id UUID,
              preferences JSONB DEFAULT '{}'::jsonb,
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );

            CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
            CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
            CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
        ''', "Create profiles table")

        # Step 5: Create pharmacist_applications table
        log("\n=== STEP 5: Creating Pharmacist Applications Table ===")
        execute_sql(conn, '''
            CREATE TABLE IF NOT EXISTS public.pharmacist_applications (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
              status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'pending_documents')),
              submitted_at TIMESTAMPTZ,
              reviewed_at TIMESTAMPTZ,
              reviewed_by UUID REFERENCES public.users(id),
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

              first_name TEXT,
              middle_name TEXT,
              last_name TEXT,
              aliases_nicknames TEXT,
              ssn_encrypted TEXT,
              driver_license_state TEXT,

              email TEXT,
              phone TEXT,
              mailing_address TEXT,

              pharmacy_school_name TEXT,
              pharmacy_degree TEXT CHECK (pharmacy_degree IN ('PharmD', 'BPharm', 'Associate', 'Master''s', 'Other')),
              graduation_date DATE,
              school_website TEXT,
              school_mailing_address TEXT,
              registrar_phone TEXT,

              npi_number TEXT,
              state_license_number TEXT,
              state_license_state TEXT,
              license_date_issued DATE,
              license_expiration_date DATE,
              dea_certificate_number TEXT,
              caqh_profile_id TEXT,
              medicaid_number TEXT,
              medicare_certification_number TEXT,

              has_work_gaps BOOLEAN DEFAULT false,
              work_gap_explanation TEXT,

              languages_spoken TEXT[],
              other_languages TEXT,

              medicare_certified BOOLEAN,
              medicare_cert_level TEXT CHECK (medicare_cert_level IN ('individual', 'pharmacy')),
              medicare_details TEXT,

              section_personal_complete BOOLEAN DEFAULT false,
              section_education_complete BOOLEAN DEFAULT false,
              section_professional_complete BOOLEAN DEFAULT false,
              section_documents_complete BOOLEAN DEFAULT false,
              overall_completion_percentage INTEGER DEFAULT 0 CHECK (overall_completion_percentage >= 0 AND overall_completion_percentage <= 100),

              submission_source TEXT DEFAULT 'internal_form',
              external_form_id TEXT,
              notes_internal TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_pharmacist_applications_user_id ON public.pharmacist_applications(user_id);
            CREATE INDEX IF NOT EXISTS idx_pharmacist_applications_status ON public.pharmacist_applications(status);
            CREATE INDEX IF NOT EXISTS idx_pharmacist_applications_submitted_at ON public.pharmacist_applications(submitted_at);
            CREATE INDEX IF NOT EXISTS idx_pharmacist_applications_npi ON public.pharmacist_applications(npi_number);
        ''', "Create pharmacist_applications table")

        # Step 6: Create pharmacy_applications table
        log("\n=== STEP 6: Creating Pharmacy Applications Table ===")
        execute_sql(conn, '''
            CREATE TABLE IF NOT EXISTS public.pharmacy_applications (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
              status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'pending_documents')),
              submitted_at TIMESTAMPTZ,
              reviewed_at TIMESTAMPTZ,
              reviewed_by UUID REFERENCES public.users(id),
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

              facility_name TEXT,
              facility_type TEXT CHECK (facility_type IN ('independent', 'chain', 'hospital', 'clinic')),
              business_license_number TEXT,
              tax_id TEXT,
              npi_number TEXT,

              facility_address TEXT,
              mailing_address TEXT,

              primary_contact_name TEXT,
              primary_contact_email TEXT,
              primary_contact_phone TEXT,

              ownership_structure TEXT,
              parent_company TEXT,
              chain_name TEXT,
              number_of_locations INTEGER,

              dea_registration TEXT,
              state_pharmacy_license TEXT,
              medicare_provider_number TEXT,
              medicaid_provider_number TEXT,

              pharmacist_count INTEGER DEFAULT 0,
              head_pharmacist_name TEXT,
              head_pharmacist_license TEXT,

              overall_completion_percentage INTEGER DEFAULT 0 CHECK (overall_completion_percentage >= 0 AND overall_completion_percentage <= 100),

              submission_source TEXT DEFAULT 'internal_form',
              external_form_id TEXT,
              notes_internal TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_pharmacy_applications_user_id ON public.pharmacy_applications(user_id);
            CREATE INDEX IF NOT EXISTS idx_pharmacy_applications_status ON public.pharmacy_applications(status);
            CREATE INDEX IF NOT EXISTS idx_pharmacy_applications_submitted_at ON public.pharmacy_applications(submitted_at);
        ''', "Create pharmacy_applications table")

        # Step 7: Create application_documents table
        log("\n=== STEP 7: Creating Application Documents Table ===")
        execute_sql(conn, '''
            CREATE TABLE IF NOT EXISTS public.application_documents (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              application_id UUID NOT NULL,
              application_type TEXT NOT NULL CHECK (application_type IN ('pharmacist', 'pharmacy')),
              document_type TEXT NOT NULL,
              file_name TEXT NOT NULL,
              file_path TEXT NOT NULL,
              file_size INTEGER,
              mime_type TEXT,
              uploaded_by UUID REFERENCES public.users(id),
              uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              is_required BOOLEAN DEFAULT true,
              is_verified BOOLEAN DEFAULT false,
              verified_by UUID REFERENCES public.users(id),
              verified_at TIMESTAMPTZ,
              verification_notes TEXT,

              document_category TEXT CHECK (document_category IN ('identification', 'education', 'license', 'insurance', 'certification', 'other')),
              expiration_date DATE,
              document_number TEXT,
              issuing_authority TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_application_documents_application_id ON public.application_documents(application_id, application_type);
            CREATE INDEX IF NOT EXISTS idx_application_documents_type ON public.application_documents(document_type);
            CREATE INDEX IF NOT EXISTS idx_application_documents_uploaded_at ON public.application_documents(uploaded_at);
        ''', "Create application_documents table")

        # Step 8: Create application_notes table
        log("\n=== STEP 8: Creating Application Notes Table ===")
        execute_sql(conn, '''
            CREATE TABLE IF NOT EXISTS public.application_notes (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              application_id UUID NOT NULL,
              application_type TEXT NOT NULL CHECK (application_type IN ('pharmacist', 'pharmacy')),
              note_type TEXT NOT NULL DEFAULT 'general' CHECK (note_type IN ('general', 'document_review', 'verification', 'compliance', 'follow_up')),
              note_content TEXT NOT NULL,
              created_by UUID NOT NULL REFERENCES public.users(id),
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              is_urgent BOOLEAN DEFAULT false,
              is_resolved BOOLEAN DEFAULT false,
              resolved_by UUID REFERENCES public.users(id),
              resolved_at TIMESTAMPTZ,

              category TEXT CHECK (category IN ('review', 'document_issue', 'verification', 'compliance', 'other')),
              priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
            );

            CREATE INDEX IF NOT EXISTS idx_application_notes_application_id ON public.application_notes(application_id, application_type);
            CREATE INDEX IF NOT EXISTS idx_application_notes_created_at ON public.application_notes(created_at DESC);
        ''', "Create application_notes table")

        # Step 9: Create application_updates table
        log("\n=== STEP 9: Creating Application Updates Table ===")
        execute_sql(conn, '''
            CREATE TABLE IF NOT EXISTS public.application_updates (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              application_id UUID NOT NULL,
              application_type TEXT NOT NULL CHECK (application_type IN ('pharmacist', 'pharmacy')),
              update_type TEXT NOT NULL DEFAULT 'status_change' CHECK (update_type IN ('status_change', 'document_request', 'approval', 'rejection', 'general_update')),
              title TEXT NOT NULL,
              message TEXT NOT NULL,
              created_by UUID NOT NULL REFERENCES public.users(id),
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              is_visible_to_applicant BOOLEAN DEFAULT true,
              requires_action BOOLEAN DEFAULT false,
              action_deadline DATE,
              is_read BOOLEAN DEFAULT false,
              read_at TIMESTAMPTZ,

              status_change_from TEXT,
              status_change_to TEXT,
              priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
            );

            CREATE INDEX IF NOT EXISTS idx_application_updates_application_id ON public.application_updates(application_id, application_type);
            CREATE INDEX IF NOT EXISTS idx_application_updates_created_at ON public.application_updates(created_at DESC);
        ''', "Create application_updates table")

        # Step 10: Create pharmacist_pharmacy_associations table
        log("\n=== STEP 10: Creating Associations Table ===")
        execute_sql(conn, '''
            CREATE TABLE IF NOT EXISTS public.pharmacist_pharmacy_associations (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              pharmacist_application_id UUID NOT NULL REFERENCES public.pharmacist_applications(id) ON DELETE CASCADE,
              pharmacy_application_id UUID NOT NULL REFERENCES public.pharmacy_applications(id) ON DELETE CASCADE,
              association_type TEXT NOT NULL CHECK (association_type IN ('employee', 'owner', 'contractor', 'consultant')),
              start_date DATE,
              end_date DATE,
              is_primary_location BOOLEAN DEFAULT false,
              employment_status TEXT CHECK (employment_status IN ('active', 'inactive', 'terminated')),
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

              UNIQUE(pharmacist_application_id, pharmacy_application_id)
            );

            CREATE INDEX IF NOT EXISTS idx_associations_pharmacist_id ON public.pharmacist_pharmacy_associations(pharmacist_application_id);
            CREATE INDEX IF NOT EXISTS idx_associations_pharmacy_id ON public.pharmacist_pharmacy_associations(pharmacy_application_id);
        ''', "Create pharmacist_pharmacy_associations table")

        # Step 11: Create contact_submissions table
        log("\n=== STEP 11: Creating Contact Submissions Table ===")
        execute_sql(conn, '''
            CREATE TABLE IF NOT EXISTS public.contact_submissions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL,
              email TEXT NOT NULL,
              phone TEXT,
              message TEXT NOT NULL,
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

              status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'resolved')),
              priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

              responded_at TIMESTAMPTZ,
              responded_by UUID REFERENCES public.users(id),
              response_notes TEXT,

              source TEXT DEFAULT 'website' CHECK (source IN ('website', 'api', 'import')),
              user_agent TEXT,
              ip_address INET,
              referrer TEXT,

              email_sent BOOLEAN DEFAULT false,
              email_sent_at TIMESTAMPTZ,
              email_error TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
            CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
        ''', "Create contact_submissions table")

        # Step 12: Create application_logs table
        log("\n=== STEP 12: Creating Application Logs Table ===")
        execute_sql(conn, '''
            CREATE TABLE IF NOT EXISTS public.application_logs (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
              level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
              message TEXT NOT NULL,
              metadata JSONB DEFAULT '{}'::jsonb,
              user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
              session_id TEXT,
              request_id TEXT,
              user_agent TEXT,
              ip_address INET,
              route TEXT,
              component TEXT,
              error_stack TEXT,
              created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );

            CREATE INDEX IF NOT EXISTS idx_application_logs_timestamp ON public.application_logs(timestamp DESC);
            CREATE INDEX IF NOT EXISTS idx_application_logs_level ON public.application_logs(level);
            CREATE INDEX IF NOT EXISTS idx_application_logs_user_id ON public.application_logs(user_id);
        ''', "Create application_logs table")

        # Step 13: Create helper function
        log("\n=== STEP 13: Creating Helper Functions ===")
        execute_sql(conn, '''
            CREATE OR REPLACE FUNCTION public.update_updated_at_column()
            RETURNS TRIGGER
            LANGUAGE plpgsql
            AS $$
            BEGIN
              NEW.updated_at = NOW();
              RETURN NEW;
            END;
            $$;
        ''', "Create update_updated_at_column function")

        # Step 14: Create triggers
        log("\n=== STEP 14: Creating Triggers ===")
        execute_sql(conn, '''
            DROP TRIGGER IF EXISTS update_roles_timestamp ON public.roles;
            CREATE TRIGGER update_roles_timestamp
              BEFORE UPDATE ON public.roles
              FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

            DROP TRIGGER IF EXISTS update_profiles_timestamp ON public.profiles;
            CREATE TRIGGER update_profiles_timestamp
              BEFORE UPDATE ON public.profiles
              FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

            DROP TRIGGER IF EXISTS update_pharmacist_applications_timestamp ON public.pharmacist_applications;
            CREATE TRIGGER update_pharmacist_applications_timestamp
              BEFORE UPDATE ON public.pharmacist_applications
              FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

            DROP TRIGGER IF EXISTS update_pharmacy_applications_timestamp ON public.pharmacy_applications;
            CREATE TRIGGER update_pharmacy_applications_timestamp
              BEFORE UPDATE ON public.pharmacy_applications
              FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

            DROP TRIGGER IF EXISTS update_application_notes_timestamp ON public.application_notes;
            CREATE TRIGGER update_application_notes_timestamp
              BEFORE UPDATE ON public.application_notes
              FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

            DROP TRIGGER IF EXISTS update_associations_timestamp ON public.pharmacist_pharmacy_associations;
            CREATE TRIGGER update_associations_timestamp
              BEFORE UPDATE ON public.pharmacist_pharmacy_associations
              FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

            DROP TRIGGER IF EXISTS update_contact_submissions_timestamp ON public.contact_submissions;
            CREATE TRIGGER update_contact_submissions_timestamp
              BEFORE UPDATE ON public.contact_submissions
              FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        ''', "Create update triggers")

        # Step 15: Enable RLS
        log("\n=== STEP 15: Enabling Row Level Security ===")
        execute_sql(conn, '''
            ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.pharmacist_applications ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.pharmacy_applications ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.application_updates ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.pharmacist_pharmacy_associations ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;
        ''', "Enable RLS on all tables")

        # Verification
        log("\n=== VERIFICATION ===")
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';")
        table_count = cur.fetchone()[0]
        log(f"Total tables created: {table_count}")

        cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;")
        tables = cur.fetchall()
        log("Tables created:")
        for table in tables:
            log(f"  - {table[0]}")

        cur.execute("SELECT COUNT(*) FROM public.roles;")
        role_count = cur.fetchone()[0]
        log(f"\nDefault roles inserted: {role_count}")

        cur.close()
        conn.close()

        log("\n" + "="*60)
        log("MIGRATION COMPLETED SUCCESSFULLY!")
        log("="*60)

    except Exception as e:
        log(f"\nFATAL ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
