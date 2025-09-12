-- Create contact form submissions table
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'read', 'replied', 'resolved'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Response tracking
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID,
  response_notes TEXT,
  
  -- Metadata
  source TEXT DEFAULT 'website', -- 'website', 'api', 'import'
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

-- Create RLS policies - only admins can access contact submissions
CREATE POLICY "Admins can manage all contact submissions" 
ON public.contact_submissions 
FOR ALL 
USING (get_current_user_role_id() IN (2, 3, 4))
WITH CHECK (get_current_user_role_id() IN (2, 3, 4));

-- Create indexes for performance
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at);
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX idx_contact_submissions_priority ON public.contact_submissions(priority);

-- Create function for automatic timestamp updates
CREATE TRIGGER update_contact_submissions_timestamp
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_application_timestamp();

-- Add contact submissions to app_logs for audit trail
INSERT INTO public.app_logs (
  level,
  message,
  context,
  user_id,
  session_id,
  user_agent,
  ip_address,
  route,
  created_at
) VALUES (
  'info',
  'Contact submissions table created',
  '{"action": "create_table", "table": "contact_submissions"}',
  NULL,
  NULL,
  NULL,
  NULL,
  '/admin/database',
  now()
);