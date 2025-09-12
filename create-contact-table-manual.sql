-- Manual SQL script to create contact_submissions table
-- Run this in your Supabase SQL Editor if the migration doesn't work

-- First, check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'contact_submissions'
);

-- Create contact form submissions table
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

-- Create RLS policy for admins only
DO $$
BEGIN
  -- Only create policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_submissions' 
    AND policyname = 'Admins can manage all contact submissions'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage all contact submissions" 
             ON public.contact_submissions 
             FOR ALL 
             USING (get_current_user_role_id() IN (2, 3, 4))
             WITH CHECK (get_current_user_role_id() IN (2, 3, 4))';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON public.contact_submissions(priority);

-- Create timestamp update trigger (if update_application_timestamp function exists)
DO $$
BEGIN
  -- Check if the trigger function exists before creating the trigger
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_application_timestamp') THEN
    -- Drop trigger if it exists
    DROP TRIGGER IF EXISTS update_contact_submissions_timestamp ON public.contact_submissions;
    
    -- Create the trigger
    CREATE TRIGGER update_contact_submissions_timestamp
    BEFORE UPDATE ON public.contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_application_timestamp();
  END IF;
END $$;

-- Add log entry if app_logs table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_logs') THEN
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
  END IF;
END $$;

-- Verify table creation
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show table count
SELECT COUNT(*) as total_contact_submissions FROM public.contact_submissions;