-- Create application logs table for structured logging
CREATE TABLE public.application_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  request_id TEXT,
  user_agent TEXT,
  ip_address INET,
  route TEXT,
  component TEXT,
  error_stack TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX idx_application_logs_timestamp ON public.application_logs(timestamp DESC);
CREATE INDEX idx_application_logs_level ON public.application_logs(level);
CREATE INDEX idx_application_logs_user_id ON public.application_logs(user_id);
CREATE INDEX idx_application_logs_component ON public.application_logs(component);
CREATE INDEX idx_application_logs_session_id ON public.application_logs(session_id);

-- Enable RLS
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can read all logs
CREATE POLICY "Super admins can read all logs"
ON public.application_logs
FOR SELECT
USING (public.get_current_user_role_id() = 4);

-- Policy: Super admins can insert logs  
CREATE POLICY "Super admins can insert logs"
ON public.application_logs
FOR INSERT
WITH CHECK (public.get_current_user_role_id() = 4);

-- Policy: Applications can insert logs (for system logging)
CREATE POLICY "Applications can insert logs"
ON public.application_logs
FOR INSERT
WITH CHECK (true);

-- Function to clean old logs (keep last 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.application_logs 
  WHERE created_at < now() - interval '30 days';
$$;

-- Grant necessary permissions
GRANT INSERT ON public.application_logs TO anon;
GRANT INSERT ON public.application_logs TO authenticated;