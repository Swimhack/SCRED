-- Apply missing table migrations to new Supabase
-- Tables: pharmacist_questionnaires, contact_submissions

-- ============================================================
-- PHARMACIST QUESTIONNAIRES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS pharmacist_questionnaires (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES pharmacist_applications(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  ssn_last_four TEXT,
  home_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone_number TEXT,
  email TEXT,
  
  -- Professional Information
  license_number TEXT,
  license_state TEXT,
  license_expiration DATE,
  npi_number TEXT,
  dea_number TEXT,
  years_of_experience INTEGER,
  pharmacy_school TEXT,
  graduation_year INTEGER,
  
  -- Employment History
  current_employer TEXT,
  employer_address TEXT,
  position_title TEXT,
  employment_start_date DATE,
  previous_employers JSONB,
  
  -- Certifications & Training
  certifications JSONB,
  immunization_certified BOOLEAN DEFAULT false,
  cpr_certified BOOLEAN DEFAULT false,
  specialized_training TEXT[],
  
  -- Insurance & Liability
  malpractice_insurance_carrier TEXT,
  policy_number TEXT,
  policy_expiration DATE,
  coverage_amount TEXT,
  claims_history JSONB,
  
  -- References
  professional_references JSONB,
  
  -- Compliance & Background
  criminal_history BOOLEAN DEFAULT false,
  criminal_history_explanation TEXT,
  disciplinary_action BOOLEAN DEFAULT false,
  disciplinary_action_explanation TEXT,
  
  -- Additional Information
  languages_spoken TEXT[],
  available_start_date DATE,
  preferred_work_schedule TEXT,
  willing_to_travel BOOLEAN DEFAULT false,
  additional_notes TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE pharmacist_questionnaires ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pharmacist_questionnaires_user_id ON pharmacist_questionnaires(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacist_questionnaires_application_id ON pharmacist_questionnaires(application_id);
CREATE INDEX IF NOT EXISTS idx_pharmacist_questionnaires_status ON pharmacist_questionnaires(status);

-- ============================================================
-- CONTACT SUBMISSIONS TABLE
-- ============================================================

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
  ip_address INET,
  referrer TEXT,
  
  -- Email tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_error TEXT,
  
  CONSTRAINT valid_status CHECK (status IN ('new', 'read', 'replied', 'resolved')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  CONSTRAINT valid_source CHECK (source IN ('website', 'api', 'import'))
);

-- Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON public.contact_submissions(priority);
