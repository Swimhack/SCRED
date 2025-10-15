-- Create contact form submissions table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/sql/new

-- Drop table if exists (be careful - this will delete existing data!)
-- DROP TABLE IF EXISTS public.contact_submissions CASCADE;

-- Create the table
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
  CONSTRAINT valid_source CHECK (source IN ('website', 'api', 'import', 'investor-homepage', 'test-script'))
);

-- Disable Row Level Security for Edge Function access
-- The Edge Function uses the service role key which bypasses RLS anyway
ALTER TABLE public.contact_submissions DISABLE ROW LEVEL SECURITY;

-- Or if you want RLS enabled, create a policy for service role:
-- ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Service role can insert contact submissions" 
-- ON public.contact_submissions 
-- FOR INSERT 
-- TO service_role
-- WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON public.contact_submissions(priority);

-- Grant permissions to service role (Edge Functions use this)
GRANT ALL ON public.contact_submissions TO service_role;
GRANT ALL ON public.contact_submissions TO postgres;

-- Verify table was created
SELECT 'Contact submissions table created successfully!' as message;
SELECT * FROM public.contact_submissions LIMIT 1;



