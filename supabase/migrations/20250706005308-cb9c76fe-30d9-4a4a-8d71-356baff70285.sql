-- Create developer_messages table for real-time communication
CREATE TABLE public.developer_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('developer', 'admin')),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('developer', 'admin', 'all')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  thread_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX idx_developer_messages_sender_id ON public.developer_messages(sender_id);
CREATE INDEX idx_developer_messages_created_at ON public.developer_messages(created_at DESC);
CREATE INDEX idx_developer_messages_status ON public.developer_messages(status);
CREATE INDEX idx_developer_messages_thread_id ON public.developer_messages(thread_id);

-- Enable RLS
ALTER TABLE public.developer_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can read all messages
CREATE POLICY "Super admins can read all messages"
ON public.developer_messages
FOR SELECT
USING (public.get_current_user_role_id() = 4);

-- Policy: Super admins can insert messages
CREATE POLICY "Super admins can insert messages"
ON public.developer_messages
FOR INSERT
WITH CHECK (public.get_current_user_role_id() = 4);

-- Policy: Super admins can update message status
CREATE POLICY "Super admins can update messages"
ON public.developer_messages
FOR UPDATE
USING (public.get_current_user_role_id() = 4);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_developer_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_developer_messages_updated_at
BEFORE UPDATE ON public.developer_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_developer_messages_updated_at();

-- Enable realtime for developer_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.developer_messages;

-- Update james@ekaty.com to have super admin role (role_id 4)
-- This assumes the user exists, if not they need to sign up first
UPDATE public.profiles 
SET role_id = 4 
WHERE id = (SELECT id FROM auth.users WHERE email = 'james@ekaty.com');