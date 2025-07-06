-- Create user invitations table to track pending invitations
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  role_id INTEGER NOT NULL REFERENCES public.roles(id),
  invited_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for user invitations
CREATE POLICY "Super admins can manage invitations" 
ON public.user_invitations 
FOR ALL 
USING (get_current_user_role_id() = 4);

-- Create user activity logs table for audit trail
CREATE TABLE public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  performed_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity logs
CREATE POLICY "Super admins can read activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (get_current_user_role_id() = 4);

CREATE POLICY "Super admins can create activity logs" 
ON public.user_activity_logs 
FOR INSERT 
WITH CHECK (get_current_user_role_id() = 4);

-- Create trigger for user_invitations updated_at
CREATE TRIGGER update_user_invitations_updated_at
BEFORE UPDATE ON public.user_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_developer_messages_updated_at();