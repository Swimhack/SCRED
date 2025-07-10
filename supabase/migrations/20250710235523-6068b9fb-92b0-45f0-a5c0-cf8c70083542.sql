-- Create enhanced notification preferences table with enterprise features
DROP TABLE IF EXISTS public.notification_preferences CASCADE;

CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email preferences
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  email_frequency TEXT NOT NULL DEFAULT 'immediate', -- 'immediate', 'hourly', 'daily', 'weekly', 'off'
  developer_messages_email BOOLEAN NOT NULL DEFAULT true,
  system_alerts_email BOOLEAN NOT NULL DEFAULT true,
  application_updates_email BOOLEAN NOT NULL DEFAULT true,
  
  -- SMS preferences
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  phone_number TEXT,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  sms_critical_only BOOLEAN NOT NULL DEFAULT true,
  
  -- Browser notifications
  browser_notifications BOOLEAN NOT NULL DEFAULT true,
  push_subscription JSONB,
  
  -- Sound and haptic preferences
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  haptic_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_sound TEXT DEFAULT 'default',
  
  -- Quiet hours and timezone
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'UTC',
  
  -- Priority-based routing
  critical_channels TEXT[] DEFAULT ARRAY['email', 'sms', 'push'],
  high_channels TEXT[] DEFAULT ARRAY['email', 'push'],
  normal_channels TEXT[] DEFAULT ARRAY['email'],
  low_channels TEXT[] DEFAULT ARRAY['dashboard'],
  
  -- Escalation settings
  escalation_enabled BOOLEAN NOT NULL DEFAULT false,
  escalation_delay_minutes INTEGER DEFAULT 30,
  escalation_recipient_id UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create notification templates table
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'developer_message', 'system_alert', 'application_update', etc.
  channel TEXT NOT NULL, -- 'email', 'sms', 'push', 'dashboard'
  
  -- Template content
  subject_template TEXT,
  body_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}', -- Available template variables
  
  -- Customization
  is_system_template BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID, -- For organization-specific templates
  
  -- Metadata
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification channels tracking table
CREATE TABLE public.notification_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES public.notification_logs(id) ON DELETE CASCADE,
  
  channel TEXT NOT NULL, -- 'email', 'sms', 'push', 'dashboard'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'read'
  
  -- Channel-specific data
  channel_data JSONB DEFAULT '{}', -- Phone number, email address, push token, etc.
  
  -- Delivery tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  
  -- Costs and analytics
  cost_cents INTEGER DEFAULT 0,
  provider_id TEXT, -- Twilio message ID, etc.
  provider_response JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification queue table for processing
CREATE TABLE public.notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES public.notification_logs(id) ON DELETE CASCADE,
  
  -- Queue management
  priority INTEGER NOT NULL DEFAULT 5, -- 1 (highest) to 10 (lowest)
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Processing data
  channels_to_process TEXT[] NOT NULL,
  processing_attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification analytics table
CREATE TABLE public.notification_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Time period
  date DATE NOT NULL,
  hour INTEGER, -- 0-23 for hourly analytics
  
  -- Metrics
  channel TEXT NOT NULL,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_read INTEGER DEFAULT 0,
  
  -- Performance metrics
  avg_delivery_time_seconds INTEGER,
  total_cost_cents INTEGER DEFAULT 0,
  
  -- User segmentation
  user_role TEXT,
  priority TEXT,
  category TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(date, hour, channel, user_role, priority, category)
);

-- Enable RLS on all tables
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences"
ON public.notification_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can read all notification preferences"
ON public.notification_preferences
FOR SELECT
USING (get_current_user_role_id() = 4);

-- RLS Policies for notification_templates
CREATE POLICY "Everyone can read active system templates"
ON public.notification_templates
FOR SELECT
USING (is_system_template = true AND is_active = true);

CREATE POLICY "Super admins can manage all templates"
ON public.notification_templates
FOR ALL
USING (get_current_user_role_id() = 4);

-- RLS Policies for notification_channels
CREATE POLICY "Users can read their own notification channels"
ON public.notification_channels
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.notification_logs nl
  WHERE nl.id = notification_channels.notification_id
  AND nl.user_id = auth.uid()
));

CREATE POLICY "System can manage notification channels"
ON public.notification_channels
FOR ALL
USING (true);

CREATE POLICY "Super admins can read all notification channels"
ON public.notification_channels
FOR SELECT
USING (get_current_user_role_id() = 4);

-- RLS Policies for notification_queue
CREATE POLICY "System can manage notification queue"
ON public.notification_queue
FOR ALL
USING (true);

CREATE POLICY "Super admins can read notification queue"
ON public.notification_queue
FOR SELECT
USING (get_current_user_role_id() = 4);

-- RLS Policies for notification_analytics
CREATE POLICY "Super admins can read analytics"
ON public.notification_analytics
FOR SELECT
USING (get_current_user_role_id() = 4);

CREATE POLICY "System can insert analytics"
ON public.notification_analytics
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX idx_notification_channels_notification_id ON public.notification_channels(notification_id);
CREATE INDEX idx_notification_channels_status ON public.notification_channels(status);
CREATE INDEX idx_notification_queue_scheduled_for ON public.notification_queue(scheduled_for);
CREATE INDEX idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX idx_notification_queue_priority ON public.notification_queue(priority);
CREATE INDEX idx_notification_analytics_date ON public.notification_analytics(date);
CREATE INDEX idx_notification_analytics_channel ON public.notification_analytics(channel);

-- Insert default notification templates
INSERT INTO public.notification_templates (name, category, channel, subject_template, body_template, variables, priority) VALUES
-- Email templates
('developer_message_email', 'developer_message', 'email', 
 'New Developer Message - {{priority}} Priority', 
 '<h2>New Developer Message</h2><p>From: {{sender_name}}</p><p>Priority: {{priority}}</p><p>Message: {{message}}</p><p><a href="{{app_url}}/messages">View Message</a></p>',
 '{"sender_name": "string", "priority": "string", "message": "string", "app_url": "string"}',
 'normal'),

('system_alert_email', 'system_alert', 'email',
 'System Alert - {{alert_type}}',
 '<h2>System Alert</h2><p>Alert Type: {{alert_type}}</p><p>Message: {{message}}</p><p>Time: {{timestamp}}</p>',
 '{"alert_type": "string", "message": "string", "timestamp": "string"}',
 'high'),

-- SMS templates
('critical_alert_sms', 'system_alert', 'sms',
 NULL,
 'CRITICAL ALERT: {{message}} - Check {{app_url}} immediately',
 '{"message": "string", "app_url": "string"}',
 'critical'),

('developer_message_sms', 'developer_message', 'sms',
 NULL,
 'New message from {{sender_name}}: {{message_preview}}... Reply at {{app_url}}',
 '{"sender_name": "string", "message_preview": "string", "app_url": "string"}',
 'high'),

-- Push notification templates
('developer_message_push', 'developer_message', 'push',
 'New Developer Message',
 '{{sender_name}}: {{message_preview}}',
 '{"sender_name": "string", "message_preview": "string"}',
 'normal'),

('system_alert_push', 'system_alert', 'push',
 'System Alert',
 '{{alert_type}}: {{message}}',
 '{"alert_type": "string", "message": "string"}',
 'high');

-- Create function to determine notification channels based on priority and user preferences
CREATE OR REPLACE FUNCTION public.get_notification_channels(user_id_param UUID, priority_param TEXT)
RETURNS TEXT[]
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE priority_param
      WHEN 'critical' THEN COALESCE(np.critical_channels, ARRAY['email', 'sms', 'push'])
      WHEN 'high' THEN COALESCE(np.high_channels, ARRAY['email', 'push'])
      WHEN 'normal' THEN COALESCE(np.normal_channels, ARRAY['email'])
      WHEN 'low' THEN COALESCE(np.low_channels, ARRAY['dashboard'])
      ELSE ARRAY['email']
    END
  FROM public.notification_preferences np
  WHERE np.user_id = user_id_param
  UNION ALL
  SELECT 
    CASE priority_param
      WHEN 'critical' THEN ARRAY['email', 'sms', 'push']
      WHEN 'high' THEN ARRAY['email', 'push']
      WHEN 'normal' THEN ARRAY['email']
      WHEN 'low' THEN ARRAY['dashboard']
      ELSE ARRAY['email']
    END
  WHERE NOT EXISTS (SELECT 1 FROM public.notification_preferences WHERE user_id = user_id_param)
  LIMIT 1;
$$;

-- Create function to check if user is in quiet hours
CREATE OR REPLACE FUNCTION public.is_user_in_quiet_hours(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN np.quiet_hours_enabled AND np.timezone IS NOT NULL THEN
        CASE 
          WHEN np.quiet_hours_start <= np.quiet_hours_end THEN
            -- Same day quiet hours (e.g., 22:00 to 08:00 next day)
            (now() AT TIME ZONE np.timezone)::TIME BETWEEN np.quiet_hours_start AND np.quiet_hours_end
          ELSE
            -- Cross-midnight quiet hours (e.g., 22:00 to 08:00)
            (now() AT TIME ZONE np.timezone)::TIME >= np.quiet_hours_start 
            OR (now() AT TIME ZONE np.timezone)::TIME <= np.quiet_hours_end
        END
      ELSE false
    END
  FROM public.notification_preferences np
  WHERE np.user_id = user_id_param
  UNION ALL
  SELECT false
  WHERE NOT EXISTS (SELECT 1 FROM public.notification_preferences WHERE user_id = user_id_param)
  LIMIT 1;
$$;

-- Create trigger to update notification_preferences updated_at
CREATE OR REPLACE FUNCTION public.update_notification_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_preferences_updated_at();

-- Create trigger to update notification_channels updated_at
CREATE OR REPLACE FUNCTION public.update_notification_channels_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_notification_channels_updated_at
  BEFORE UPDATE ON public.notification_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_channels_updated_at();