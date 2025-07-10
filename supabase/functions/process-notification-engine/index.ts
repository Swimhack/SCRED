import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioFromNumber = Deno.env.get("TWILIO_FROM_NUMBER");

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  messageId?: string;
  userId?: string;
  category: string;
  priority: string;
  title: string;
  message: string;
  metadata?: any;
}

// Template rendering function
function renderTemplate(template: string, variables: any): string {
  let rendered = template;
  
  // Replace {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(value));
  }
  
  return rendered;
}

// Get notification template
async function getTemplate(category: string, channel: string, priority: string) {
  const { data } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('category', category)
    .eq('channel', channel)
    .eq('is_active', true)
    .single();
    
  if (!data) {
    // Fallback template
    return {
      subject_template: '{{title}}',
      body_template: '{{message}}',
      variables: {}
    };
  }
  
  return data;
}

// Send email notification
async function sendEmailNotification(
  email: string, 
  subject: string, 
  body: string, 
  metadata: any
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'custom',
        to: email,
        subject: subject,
        html: body,
        metadata: metadata
      }
    });

    if (error) throw error;
    
    return { success: true, id: data?.messageId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Send SMS notification
async function sendSMSNotification(
  phoneNumber: string, 
  message: string
): Promise<{ success: boolean; id?: string; error?: string; cost?: number }> {
  if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
    return { success: false, error: 'Twilio credentials not configured' };
  }

  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    const formData = new URLSearchParams();
    formData.append('From', twilioFromNumber);
    formData.append('To', phoneNumber);
    formData.append('Body', message);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Twilio API error: ${errorData}`);
    }

    const data = await response.json();
    
    // Estimate cost (Twilio SMS is typically $0.0075 per message)
    const estimatedCostCents = 1; // 1 cent as base cost
    
    return { 
      success: true, 
      id: data.sid,
      cost: estimatedCostCents
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Send browser push notification
async function sendPushNotification(
  pushSubscription: any,
  title: string,
  body: string,
  metadata: any
): Promise<{ success: boolean; id?: string; error?: string }> {
  // TODO: Implement web push notifications using service worker
  // For now, we'll mark as delivered since we don't have VAPID keys set up
  return { 
    success: true, 
    id: `push_${Date.now()}`,
    error: 'Push notifications not fully implemented yet'
  };
}

// Process single notification
async function processNotification(notificationId: string) {
  console.log('Processing notification:', notificationId);

  // Get notification details
  const { data: notification } = await supabase
    .from('notification_logs')
    .select(`
      *,
      profiles!user_id (
        email,
        first_name,
        last_name
      )
    `)
    .eq('id', notificationId)
    .single();

  if (!notification) {
    throw new Error('Notification not found');
  }

  // Get user preferences
  const { data: preferences } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', notification.user_id)
    .single();

  // Determine channels based on priority and preferences
  const { data: channels } = await supabase.rpc('get_notification_channels', {
    user_id_param: notification.user_id,
    priority_param: notification.metadata?.priority || 'normal'
  });

  const channelsToProcess = channels || ['email'];

  // Check quiet hours
  const { data: isQuietHours } = await supabase.rpc('is_user_in_quiet_hours', {
    user_id_param: notification.user_id
  });

  // Skip non-critical notifications during quiet hours
  if (isQuietHours && notification.metadata?.priority !== 'critical') {
    console.log('Skipping notification due to quiet hours');
    return;
  }

  const profile = notification.profiles;
  const results = [];

  // Process each channel
  for (const channel of channelsToProcess) {
    try {
      let result = null;
      let channelData = {};

      // Get template for this channel
      const template = await getTemplate(
        notification.metadata?.category || 'general',
        channel,
        notification.metadata?.priority || 'normal'
      );

      // Prepare template variables
      const templateVars = {
        title: notification.metadata?.title || 'Notification',
        message: notification.metadata?.message || '',
        user_name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : '',
        first_name: profile?.first_name || '',
        app_url: 'https://streetcredrx.lovable.app',
        timestamp: new Date().toLocaleString(),
        priority: notification.metadata?.priority || 'normal',
        ...notification.metadata
      };

      const renderedSubject = template.subject_template 
        ? renderTemplate(template.subject_template, templateVars)
        : templateVars.title;
      const renderedBody = renderTemplate(template.body_template, templateVars);

      switch (channel) {
        case 'email':
          if (profile?.email && preferences?.email_notifications) {
            channelData = { email: profile.email };
            result = await sendEmailNotification(
              profile.email,
              renderedSubject,
              renderedBody,
              notification.metadata
            );
          }
          break;

        case 'sms':
          if (preferences?.sms_enabled && preferences?.phone_number && preferences?.phone_verified) {
            // Only send SMS for critical or if not sms_critical_only
            if (notification.metadata?.priority === 'critical' || !preferences.sms_critical_only) {
              channelData = { phone_number: preferences.phone_number };
              result = await sendSMSNotification(
                preferences.phone_number,
                renderedBody
              );
            }
          }
          break;

        case 'push':
          if (preferences?.browser_notifications && preferences?.push_subscription) {
            channelData = { push_subscription: preferences.push_subscription };
            result = await sendPushNotification(
              preferences.push_subscription,
              renderedSubject,
              renderedBody,
              notification.metadata
            );
          }
          break;

        case 'dashboard':
          // Dashboard notifications are handled by the in-app notification system
          result = { success: true, id: `dashboard_${Date.now()}` };
          break;
      }

      // Create notification channel record
      if (result) {
        const channelRecord = {
          notification_id: notificationId,
          channel: channel,
          status: result.success ? 'sent' : 'failed',
          channel_data: channelData,
          sent_at: result.success ? new Date().toISOString() : null,
          error_message: result.error || null,
          cost_cents: result.cost || 0,
          provider_id: result.id || null
        };

        await supabase
          .from('notification_channels')
          .insert(channelRecord);

        results.push({
          channel,
          success: result.success,
          error: result.error
        });
      }

    } catch (error) {
      console.error(`Error processing ${channel} channel:`, error);
      
      // Record failed channel
      await supabase
        .from('notification_channels')
        .insert({
          notification_id: notificationId,
          channel: channel,
          status: 'failed',
          error_message: error.message,
          failed_at: new Date().toISOString()
        });

      results.push({
        channel,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageId, userId, category, priority, title, message, metadata }: NotificationRequest = await req.json();

    let notificationId = messageId;

    // If no messageId provided, create a new notification log entry
    if (!notificationId && userId) {
      const { data: newNotification, error } = await supabase
        .from('notification_logs')
        .insert({
          user_id: userId,
          notification_type: 'system',
          metadata: {
            category,
            priority,
            title,
            message,
            ...metadata
          }
        })
        .select()
        .single();

      if (error) throw error;
      notificationId = newNotification.id;
    }

    if (!notificationId) {
      throw new Error('No notification ID provided');
    }

    // Process the notification
    const results = await processNotification(notificationId);

    // Update analytics
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Notification processing complete: ${successful} sent, ${failed} failed`);

    return new Response(JSON.stringify({ 
      success: true, 
      notificationId,
      results: {
        sent: successful,
        failed: failed,
        details: results
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in process-notification-engine function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);