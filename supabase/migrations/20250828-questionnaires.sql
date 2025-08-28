-- Create pharmacist questionnaires table
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
  previous_employers JSONB, -- Array of previous employment records
  
  -- Certifications & Training
  certifications JSONB, -- Array of certification objects
  immunization_certified BOOLEAN DEFAULT false,
  cpr_certified BOOLEAN DEFAULT false,
  specialized_training TEXT[],
  
  -- Insurance & Liability
  malpractice_insurance_carrier TEXT,
  policy_number TEXT,
  policy_expiration DATE,
  coverage_amount TEXT,
  claims_history JSONB, -- Array of any claims
  
  -- References
  professional_references JSONB, -- Array of reference objects
  
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

-- Create facility questionnaires table
CREATE TABLE IF NOT EXISTS facility_questionnaires (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES auth.users(id),
  
  -- Facility Information
  facility_name TEXT NOT NULL,
  facility_type TEXT, -- Hospital, Retail, Long-term care, etc.
  facility_npi TEXT,
  tax_id TEXT,
  
  -- Location Details
  primary_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  website TEXT,
  
  -- Business Information
  ownership_type TEXT, -- Corporation, LLC, Partnership, etc.
  years_in_operation INTEGER,
  number_of_locations INTEGER,
  annual_prescription_volume INTEGER,
  
  -- Licensing & Accreditation
  state_pharmacy_license TEXT,
  license_expiration DATE,
  dea_registration TEXT,
  dea_expiration DATE,
  accreditations JSONB, -- Array of accreditation objects
  
  -- Insurance Information
  liability_insurance_carrier TEXT,
  liability_policy_number TEXT,
  liability_coverage_amount TEXT,
  liability_expiration DATE,
  general_insurance_carrier TEXT,
  general_policy_number TEXT,
  general_expiration DATE,
  
  -- Services Offered
  services_offered TEXT[], -- Array of services
  specialty_services TEXT[],
  delivery_available BOOLEAN DEFAULT false,
  compounding_services BOOLEAN DEFAULT false,
  immunization_services BOOLEAN DEFAULT false,
  medication_therapy_management BOOLEAN DEFAULT false,
  
  -- Staffing Information
  total_pharmacists INTEGER,
  total_technicians INTEGER,
  total_support_staff INTEGER,
  pharmacist_to_tech_ratio TEXT,
  hours_of_operation JSONB, -- Object with days and hours
  
  -- Technology & Systems
  pharmacy_management_system TEXT,
  e_prescribing_enabled BOOLEAN DEFAULT false,
  electronic_health_records BOOLEAN DEFAULT false,
  automated_dispensing BOOLEAN DEFAULT false,
  inventory_management_system TEXT,
  
  -- Quality & Compliance
  quality_assurance_program BOOLEAN DEFAULT false,
  quality_program_description TEXT,
  hipaa_compliant BOOLEAN DEFAULT false,
  last_board_inspection DATE,
  inspection_results TEXT,
  citations_or_violations JSONB, -- Array of any violations
  
  -- Financial Information
  accepts_medicare BOOLEAN DEFAULT false,
  accepts_medicaid BOOLEAN DEFAULT false,
  insurance_contracts TEXT[], -- Array of insurance companies
  preferred_wholesaler TEXT,
  payment_terms_accepted TEXT[],
  
  -- Emergency Preparedness
  emergency_plan BOOLEAN DEFAULT false,
  backup_power_system BOOLEAN DEFAULT false,
  disaster_recovery_plan BOOLEAN DEFAULT false,
  
  -- Additional Information
  chain_affiliation TEXT,
  buying_group_membership TEXT,
  professional_associations TEXT[],
  awards_recognitions TEXT[],
  additional_notes TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create questionnaire_documents table for file attachments
CREATE TABLE IF NOT EXISTS questionnaire_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacist_questionnaire_id UUID REFERENCES pharmacist_questionnaires(id) ON DELETE CASCADE,
  facility_questionnaire_id UUID REFERENCES facility_questionnaires(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure document belongs to either pharmacist or facility questionnaire, not both
  CONSTRAINT document_parent_check CHECK (
    (pharmacist_questionnaire_id IS NOT NULL AND facility_questionnaire_id IS NULL) OR
    (pharmacist_questionnaire_id IS NULL AND facility_questionnaire_id IS NOT NULL)
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_pharmacist_questionnaires_user_id ON pharmacist_questionnaires(user_id);
CREATE INDEX idx_pharmacist_questionnaires_application_id ON pharmacist_questionnaires(application_id);
CREATE INDEX idx_pharmacist_questionnaires_status ON pharmacist_questionnaires(status);
CREATE INDEX idx_facility_questionnaires_organization_id ON facility_questionnaires(organization_id);
CREATE INDEX idx_facility_questionnaires_status ON facility_questionnaires(status);
CREATE INDEX idx_questionnaire_documents_pharmacist ON questionnaire_documents(pharmacist_questionnaire_id);
CREATE INDEX idx_questionnaire_documents_facility ON questionnaire_documents(facility_questionnaire_id);

-- Enable Row Level Security
ALTER TABLE pharmacist_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pharmacist_questionnaires
CREATE POLICY "Users can view their own pharmacist questionnaires"
  ON pharmacist_questionnaires FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pharmacist questionnaires"
  ON pharmacist_questionnaires FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own draft pharmacist questionnaires"
  ON pharmacist_questionnaires FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'draft')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all pharmacist questionnaires"
  ON pharmacist_questionnaires FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin_manager', 'admin_regional')
    )
  );

CREATE POLICY "Admins can update pharmacist questionnaire status"
  ON pharmacist_questionnaires FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin_manager')
    )
  );

-- RLS Policies for facility_questionnaires
CREATE POLICY "Organization admins can view their facility questionnaires"
  ON facility_questionnaires FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.organization_id = facility_questionnaires.organization_id
      AND user_profiles.role IN ('super_admin', 'admin_manager', 'admin_regional')
    )
  );

CREATE POLICY "Organization admins can create facility questionnaires"
  ON facility_questionnaires FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.organization_id = organization_id
      AND user_profiles.role IN ('super_admin', 'admin_manager')
    )
  );

CREATE POLICY "Organization admins can update their facility questionnaires"
  ON facility_questionnaires FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.organization_id = facility_questionnaires.organization_id
      AND user_profiles.role IN ('super_admin', 'admin_manager')
    )
  );

-- RLS Policies for questionnaire_documents
CREATE POLICY "Users can view their own questionnaire documents"
  ON questionnaire_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pharmacist_questionnaires
      WHERE pharmacist_questionnaires.id = questionnaire_documents.pharmacist_questionnaire_id
      AND pharmacist_questionnaires.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM facility_questionnaires f
      JOIN user_profiles u ON u.organization_id = f.organization_id
      WHERE f.id = questionnaire_documents.facility_questionnaire_id
      AND u.id = auth.uid()
      AND u.role IN ('super_admin', 'admin_manager', 'admin_regional')
    )
  );

CREATE POLICY "Users can upload questionnaire documents"
  ON questionnaire_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = uploaded_by
    AND (
      EXISTS (
        SELECT 1 FROM pharmacist_questionnaires
        WHERE pharmacist_questionnaires.id = pharmacist_questionnaire_id
        AND pharmacist_questionnaires.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM facility_questionnaires f
        JOIN user_profiles u ON u.organization_id = f.organization_id
        WHERE f.id = facility_questionnaire_id
        AND u.id = auth.uid()
        AND u.role IN ('super_admin', 'admin_manager')
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_pharmacist_questionnaires_updated_at
  BEFORE UPDATE ON pharmacist_questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facility_questionnaires_updated_at
  BEFORE UPDATE ON facility_questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();