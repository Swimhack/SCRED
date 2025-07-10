-- Create pharmacist applications table
CREATE TABLE public.pharmacist_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Personal Information
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  aliases_nicknames TEXT,
  ssn_encrypted TEXT, -- Encrypted SSN
  driver_license_state TEXT,
  
  -- Contact Information  
  email TEXT,
  phone TEXT,
  mailing_address TEXT,
  
  -- Education Information
  pharmacy_school_name TEXT,
  pharmacy_degree TEXT, -- PharmD, BPharm, Associate, Master's, Other
  graduation_date DATE,
  school_website TEXT,
  school_mailing_address TEXT,
  registrar_phone TEXT,
  
  -- Professional Information
  npi_number TEXT,
  state_license_number TEXT,
  state_license_state TEXT,
  license_date_issued DATE,
  license_expiration_date DATE,
  dea_certificate_number TEXT,
  caqh_profile_id TEXT,
  medicaid_number TEXT,
  medicare_certification_number TEXT,
  
  -- Work History
  has_work_gaps BOOLEAN DEFAULT false,
  work_gap_explanation TEXT,
  
  -- Languages
  languages_spoken TEXT[], -- Array of language codes
  other_languages TEXT,
  
  -- Medicare Information
  medicare_certified BOOLEAN,
  medicare_cert_level TEXT, -- 'individual' or 'pharmacy'
  medicare_details TEXT,
  
  -- Completion tracking
  section_personal_complete BOOLEAN DEFAULT false,
  section_education_complete BOOLEAN DEFAULT false,
  section_professional_complete BOOLEAN DEFAULT false,
  section_documents_complete BOOLEAN DEFAULT false,
  overall_completion_percentage INTEGER DEFAULT 0,
  
  -- Application metadata
  submission_source TEXT DEFAULT 'internal_form',
  external_form_id TEXT, -- For JotForm integration
  notes_internal TEXT,
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'pending_documents')),
  CONSTRAINT valid_degree CHECK (pharmacy_degree IN ('PharmD', 'BPharm', 'Associate', 'Master''s', 'Other') OR pharmacy_degree IS NULL),
  CONSTRAINT valid_medicare_level CHECK (medicare_cert_level IN ('individual', 'pharmacy') OR medicare_cert_level IS NULL),
  CONSTRAINT valid_completion CHECK (overall_completion_percentage >= 0 AND overall_completion_percentage <= 100)
);

-- Create pharmacy applications table (for facilities/chains)
CREATE TABLE public.pharmacy_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Facility Information
  facility_name TEXT,
  facility_type TEXT, -- 'independent', 'chain', 'hospital', 'clinic'
  business_license_number TEXT,
  tax_id TEXT,
  npi_number TEXT,
  
  -- Address Information
  facility_address TEXT,
  mailing_address TEXT,
  
  -- Contact Information
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  
  -- Business Information
  ownership_structure TEXT,
  parent_company TEXT,
  chain_name TEXT,
  number_of_locations INTEGER,
  
  -- Certifications
  dea_registration TEXT,
  state_pharmacy_license TEXT,
  medicare_provider_number TEXT,
  medicaid_provider_number TEXT,
  
  -- Associated Pharmacists
  pharmacist_count INTEGER DEFAULT 0,
  head_pharmacist_name TEXT,
  head_pharmacist_license TEXT,
  
  -- Completion tracking
  overall_completion_percentage INTEGER DEFAULT 0,
  
  -- Application metadata
  submission_source TEXT DEFAULT 'internal_form',
  external_form_id TEXT,
  notes_internal TEXT,
  
  CONSTRAINT valid_status_pharmacy CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'pending_documents')),
  CONSTRAINT valid_facility_type CHECK (facility_type IN ('independent', 'chain', 'hospital', 'clinic') OR facility_type IS NULL),
  CONSTRAINT valid_completion_pharmacy CHECK (overall_completion_percentage >= 0 AND overall_completion_percentage <= 100)
);

-- Create application documents table
CREATE TABLE public.application_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  application_type TEXT NOT NULL, -- 'pharmacist' or 'pharmacy'
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_required BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  
  -- Document metadata
  document_category TEXT, -- 'identification', 'education', 'license', 'insurance', 'other'
  expiration_date DATE,
  document_number TEXT, -- License numbers, certificate numbers, etc.
  issuing_authority TEXT,
  
  CONSTRAINT valid_application_type CHECK (application_type IN ('pharmacist', 'pharmacy')),
  CONSTRAINT valid_document_category CHECK (document_category IN ('identification', 'education', 'license', 'insurance', 'certification', 'other') OR document_category IS NULL)
);

-- Create application notes table (internal admin notes)
CREATE TABLE public.application_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  application_type TEXT NOT NULL, -- 'pharmacist' or 'pharmacy'
  note_type TEXT NOT NULL DEFAULT 'general',
  note_content TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_urgent BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Note categorization
  category TEXT, -- 'review', 'document_issue', 'verification', 'compliance', 'other'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  CONSTRAINT valid_application_type_notes CHECK (application_type IN ('pharmacist', 'pharmacy')),
  CONSTRAINT valid_note_type CHECK (note_type IN ('general', 'document_review', 'verification', 'compliance', 'follow_up') OR note_type IS NULL),
  CONSTRAINT valid_category_notes CHECK (category IN ('review', 'document_issue', 'verification', 'compliance', 'other') OR category IS NULL),
  CONSTRAINT valid_priority_notes CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Create application updates table (customer-facing communications)
CREATE TABLE public.application_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  application_type TEXT NOT NULL, -- 'pharmacist' or 'pharmacy'
  update_type TEXT NOT NULL DEFAULT 'status_change',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_visible_to_applicant BOOLEAN DEFAULT true,
  requires_action BOOLEAN DEFAULT false,
  action_deadline DATE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Update categorization
  status_change_from TEXT,
  status_change_to TEXT,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  CONSTRAINT valid_application_type_updates CHECK (application_type IN ('pharmacist', 'pharmacy')),
  CONSTRAINT valid_update_type CHECK (update_type IN ('status_change', 'document_request', 'approval', 'rejection', 'general_update') OR update_type IS NULL),
  CONSTRAINT valid_priority_updates CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Create pharmacist-pharmacy associations table
CREATE TABLE public.pharmacist_pharmacy_associations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacist_application_id UUID NOT NULL,
  pharmacy_application_id UUID NOT NULL,
  association_type TEXT NOT NULL, -- 'employee', 'owner', 'contractor', 'consultant'
  start_date DATE,
  end_date DATE,
  is_primary_location BOOLEAN DEFAULT false,
  employment_status TEXT, -- 'active', 'inactive', 'terminated'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_association_type CHECK (association_type IN ('employee', 'owner', 'contractor', 'consultant')),
  CONSTRAINT valid_employment_status CHECK (employment_status IN ('active', 'inactive', 'terminated') OR employment_status IS NULL),
  UNIQUE(pharmacist_application_id, pharmacy_application_id)
);

-- Enable Row Level Security
ALTER TABLE public.pharmacist_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacist_pharmacy_associations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pharmacist_applications
CREATE POLICY "Users can view their own pharmacist applications" 
ON public.pharmacist_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pharmacist applications" 
ON public.pharmacist_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pharmacist applications" 
ON public.pharmacist_applications 
FOR UPDATE 
USING (auth.uid() = user_id AND status IN ('draft', 'pending_documents'));

CREATE POLICY "Admins can view all pharmacist applications" 
ON public.pharmacist_applications 
FOR SELECT 
USING (get_current_user_role_id() IN (2, 3, 4));

CREATE POLICY "Admins can update pharmacist applications" 
ON public.pharmacist_applications 
FOR UPDATE 
USING (get_current_user_role_id() IN (2, 3, 4));

-- Create RLS policies for pharmacy_applications
CREATE POLICY "Users can view their own pharmacy applications" 
ON public.pharmacy_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pharmacy applications" 
ON public.pharmacy_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pharmacy applications" 
ON public.pharmacy_applications 
FOR UPDATE 
USING (auth.uid() = user_id AND status IN ('draft', 'pending_documents'));

CREATE POLICY "Admins can view all pharmacy applications" 
ON public.pharmacy_applications 
FOR SELECT 
USING (get_current_user_role_id() IN (2, 3, 4));

CREATE POLICY "Admins can update pharmacy applications" 
ON public.pharmacy_applications 
FOR UPDATE 
USING (get_current_user_role_id() IN (2, 3, 4));

-- Create RLS policies for application_documents
CREATE POLICY "Users can view their own application documents" 
ON public.application_documents 
FOR SELECT 
USING (
  (application_type = 'pharmacist' AND EXISTS (
    SELECT 1 FROM public.pharmacist_applications 
    WHERE id = application_id AND user_id = auth.uid()
  )) OR
  (application_type = 'pharmacy' AND EXISTS (
    SELECT 1 FROM public.pharmacy_applications 
    WHERE id = application_id AND user_id = auth.uid()
  ))
);

CREATE POLICY "Users can upload their own application documents" 
ON public.application_documents 
FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by AND (
    (application_type = 'pharmacist' AND EXISTS (
      SELECT 1 FROM public.pharmacist_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )) OR
    (application_type = 'pharmacy' AND EXISTS (
      SELECT 1 FROM public.pharmacy_applications 
      WHERE id = application_id AND user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Admins can manage all application documents" 
ON public.application_documents 
FOR ALL 
USING (get_current_user_role_id() IN (2, 3, 4))
WITH CHECK (get_current_user_role_id() IN (2, 3, 4));

-- Create RLS policies for application_notes (admin only)
CREATE POLICY "Admins can manage application notes" 
ON public.application_notes 
FOR ALL 
USING (get_current_user_role_id() IN (2, 3, 4))
WITH CHECK (get_current_user_role_id() IN (2, 3, 4));

-- Create RLS policies for application_updates
CREATE POLICY "Users can view their own application updates" 
ON public.application_updates 
FOR SELECT 
USING (
  is_visible_to_applicant = true AND (
    (application_type = 'pharmacist' AND EXISTS (
      SELECT 1 FROM public.pharmacist_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )) OR
    (application_type = 'pharmacy' AND EXISTS (
      SELECT 1 FROM public.pharmacy_applications 
      WHERE id = application_id AND user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can mark updates as read" 
ON public.application_updates 
FOR UPDATE 
USING (
  is_visible_to_applicant = true AND (
    (application_type = 'pharmacist' AND EXISTS (
      SELECT 1 FROM public.pharmacist_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )) OR
    (application_type = 'pharmacy' AND EXISTS (
      SELECT 1 FROM public.pharmacy_applications 
      WHERE id = application_id AND user_id = auth.uid()
    ))
  )
)
WITH CHECK (
  is_visible_to_applicant = true AND is_read = true AND read_at = now()
);

CREATE POLICY "Admins can manage all application updates" 
ON public.application_updates 
FOR ALL 
USING (get_current_user_role_id() IN (2, 3, 4))
WITH CHECK (get_current_user_role_id() IN (2, 3, 4));

-- Create RLS policies for pharmacist_pharmacy_associations
CREATE POLICY "Users can view their own associations" 
ON public.pharmacist_pharmacy_associations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pharmacist_applications 
    WHERE id = pharmacist_application_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.pharmacy_applications 
    WHERE id = pharmacy_application_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all associations" 
ON public.pharmacist_pharmacy_associations 
FOR ALL 
USING (get_current_user_role_id() IN (2, 3, 4))
WITH CHECK (get_current_user_role_id() IN (2, 3, 4));

-- Create indexes for performance
CREATE INDEX idx_pharmacist_applications_user_id ON public.pharmacist_applications(user_id);
CREATE INDEX idx_pharmacist_applications_status ON public.pharmacist_applications(status);
CREATE INDEX idx_pharmacist_applications_submitted_at ON public.pharmacist_applications(submitted_at);
CREATE INDEX idx_pharmacist_applications_npi ON public.pharmacist_applications(npi_number);

CREATE INDEX idx_pharmacy_applications_user_id ON public.pharmacy_applications(user_id);
CREATE INDEX idx_pharmacy_applications_status ON public.pharmacy_applications(status);
CREATE INDEX idx_pharmacy_applications_submitted_at ON public.pharmacy_applications(submitted_at);

CREATE INDEX idx_application_documents_application_id ON public.application_documents(application_id, application_type);
CREATE INDEX idx_application_documents_type ON public.application_documents(document_type);
CREATE INDEX idx_application_documents_uploaded_at ON public.application_documents(uploaded_at);

CREATE INDEX idx_application_notes_application_id ON public.application_notes(application_id, application_type);
CREATE INDEX idx_application_notes_created_at ON public.application_notes(created_at);
CREATE INDEX idx_application_notes_priority ON public.application_notes(priority);

CREATE INDEX idx_application_updates_application_id ON public.application_updates(application_id, application_type);
CREATE INDEX idx_application_updates_created_at ON public.application_updates(created_at);
CREATE INDEX idx_application_updates_requires_action ON public.application_updates(requires_action);

CREATE INDEX idx_associations_pharmacist_id ON public.pharmacist_pharmacy_associations(pharmacist_application_id);
CREATE INDEX idx_associations_pharmacy_id ON public.pharmacist_pharmacy_associations(pharmacy_application_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_application_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_pharmacist_applications_timestamp
BEFORE UPDATE ON public.pharmacist_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_application_timestamp();

CREATE TRIGGER update_pharmacy_applications_timestamp
BEFORE UPDATE ON public.pharmacy_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_application_timestamp();

CREATE TRIGGER update_application_notes_timestamp
BEFORE UPDATE ON public.application_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_application_timestamp();

CREATE TRIGGER update_associations_timestamp
BEFORE UPDATE ON public.pharmacist_pharmacy_associations
FOR EACH ROW
EXECUTE FUNCTION public.update_application_timestamp();