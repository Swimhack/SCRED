-- Neon Database Setup for StreetCredRx Contact Forms
-- Run this in your Neon SQL Editor: https://console.neon.tech

-- Create contact_submissions table if it doesn't exist
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
  ip_address TEXT,
  referrer TEXT,
  
  -- Email tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_error TEXT,
  
  CONSTRAINT valid_status CHECK (status IN ('new', 'read', 'replied', 'resolved')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  CONSTRAINT valid_source CHECK (source IN ('website', 'api', 'import', 'investor-homepage'))
);

-- Create application_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.application_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  route TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_level CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON public.contact_submissions(priority);
CREATE INDEX IF NOT EXISTS idx_application_logs_created_at ON public.application_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_application_logs_level ON public.application_logs(level);

-- Grant permissions (Neon doesn't have RLS by default, so we don't need to worry about it)
-- The connection user should have full access

-- Verify tables exist
SELECT 'contact_submissions table exists' as status, count(*) as row_count FROM public.contact_submissions;
SELECT 'application_logs table exists' as status, count(*) as row_count FROM public.application_logs;
