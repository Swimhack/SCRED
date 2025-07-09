-- Add notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  email_frequency TEXT NOT NULL DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'hourly', 'daily', 'off')),
  browser_notifications BOOLEAN NOT NULL DEFAULT true,
  developer_messages_email BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add notification logs table for tracking
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.developer_messages(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'browser', 'in_app')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences"
ON public.notification_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can read all notification preferences"
ON public.notification_preferences
FOR SELECT
USING (public.get_current_user_role_id() = 4);

-- Policies for notification_logs  
CREATE POLICY "Users can read their own notification logs"
ON public.notification_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notification logs"
ON public.notification_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update notification logs"
ON public.notification_logs
FOR UPDATE
USING (true);

CREATE POLICY "Super admins can read all notification logs"
ON public.notification_logs
FOR ALL
USING (public.get_current_user_role_id() = 4);

-- Update developer_messages policies to allow admin roles access
DROP POLICY "Super admins can read all messages" ON public.developer_messages;
DROP POLICY "Super admins can insert messages" ON public.developer_messages;
DROP POLICY "Super admins can update messages" ON public.developer_messages;

-- New policies that allow admin roles (super_admin=4, admin_manager=2, admin_regional=3)
CREATE POLICY "Admin roles can read all messages"
ON public.developer_messages
FOR SELECT
USING (public.get_current_user_role_id() IN (2, 3, 4));

CREATE POLICY "Admin roles can insert messages"
ON public.developer_messages
FOR INSERT
WITH CHECK (public.get_current_user_role_id() IN (2, 3, 4));

CREATE POLICY "Admin roles can update messages"
ON public.developer_messages
FOR UPDATE
USING (public.get_current_user_role_id() IN (2, 3, 4));

-- Add indexes for efficient querying
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX idx_notification_logs_message_id ON public.notification_logs(message_id);
CREATE INDEX idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX idx_notification_logs_sent_at ON public.notification_logs(sent_at);

-- Function to get admin users who should receive notifications
CREATE OR REPLACE FUNCTION public.get_admin_notification_recipients()
RETURNS TABLE(user_id UUID, email TEXT, first_name TEXT, role_name TEXT)
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT 
    p.id as user_id,
    p.email,
    p.first_name,
    r.name as role_name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  LEFT JOIN public.notification_preferences np ON p.id = np.user_id
  WHERE p.role_id IN (2, 3, 4) -- admin_manager, admin_regional, super_admin
    AND p.email IS NOT NULL
    AND (np.developer_messages_email IS NULL OR np.developer_messages_email = true)
    AND (np.email_notifications IS NULL OR np.email_notifications = true)
    AND (np.email_frequency IS NULL OR np.email_frequency != 'off');
$$;

-- Function to create notification logs for a message
CREATE OR REPLACE FUNCTION public.create_message_notifications(message_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recipient_record RECORD;
BEGIN
  -- Create notification logs for all admin users
  FOR recipient_record IN 
    SELECT user_id, email, first_name, role_name 
    FROM public.get_admin_notification_recipients()
  LOOP
    -- Create email notification log
    INSERT INTO public.notification_logs (
      user_id, 
      message_id, 
      notification_type, 
      metadata
    ) VALUES (
      recipient_record.user_id,
      message_id_param,
      'email',
      jsonb_build_object(
        'email', recipient_record.email,
        'first_name', recipient_record.first_name,
        'role_name', recipient_record.role_name
      )
    );

    -- Create in-app notification log
    INSERT INTO public.notification_logs (
      user_id,
      message_id,
      notification_type,
      status
    ) VALUES (
      recipient_record.user_id,
      message_id_param,
      'in_app',
      'delivered'
    );
  END LOOP;
END;
$$;

-- Trigger to automatically create notifications when messages are inserted
CREATE OR REPLACE FUNCTION public.trigger_message_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create notification logs for the new message
  PERFORM public.create_message_notifications(NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger on developer_messages table
CREATE TRIGGER create_notifications_on_message_insert
  AFTER INSERT ON public.developer_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_message_notifications();

-- Create default notification preferences for existing users
INSERT INTO public.notification_preferences (user_id, email_notifications, developer_messages_email)
SELECT id, true, true
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;