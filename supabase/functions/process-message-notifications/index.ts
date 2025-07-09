import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessNotificationRequest {
  messageId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageId }: ProcessNotificationRequest = await req.json();

    // Get the message details
    const { data: message, error: messageError } = await supabase
      .from('developer_messages')
      .select(`
        id,
        message,
        sender_type,
        created_at,
        profiles!sender_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      throw new Error(`Failed to fetch message: ${messageError?.message}`);
    }

    // Get pending email notifications for this message
    const { data: notifications, error: notificationsError } = await supabase
      .from('notification_logs')
      .select(`
        id,
        user_id,
        metadata
      `)
      .eq('message_id', messageId)
      .eq('notification_type', 'email')
      .eq('status', 'pending');

    if (notificationsError) {
      throw new Error(`Failed to fetch notifications: ${notificationsError.message}`);
    }

    if (!notifications || notifications.length === 0) {
      console.log('No pending email notifications found for message:', messageId);
      return new Response(JSON.stringify({ success: true, message: 'No pending notifications' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Process each email notification
    const emailPromises = notifications.map(async (notification) => {
      try {
        const senderProfile = message.profiles;
        
        // Get recipient email from metadata
        const recipientEmail = notification.metadata?.email;
        const recipientFirstName = notification.metadata?.first_name;
        
        if (!recipientEmail) {
          console.warn(`No email found for user ${notification.user_id}`);
          return { success: false, error: 'No email address' };
        }

        // Send email via send-email function
        const emailResponse = await supabase.functions.invoke('send-email', {
          body: {
            type: 'developer-message',
            to: recipientEmail,
            firstName: recipientFirstName,
            message: message.message,
            senderType: message.sender_type,
            senderName: senderProfile ? `${senderProfile.first_name} ${senderProfile.last_name}`.trim() : undefined,
            messageId: message.id
          }
        });

        if (emailResponse.error) {
          throw new Error(`Email send failed: ${emailResponse.error.message}`);
        }

        // Update notification status to sent
        await supabase
          .from('notification_logs')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id);

        console.log(`Email sent successfully to ${recipientEmail}`);
        return { success: true, email: recipientEmail };

      } catch (error) {
        console.error(`Failed to send email notification ${notification.id}:`, error);
        
        // Update notification status to failed
        await supabase
          .from('notification_logs')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', notification.id);

        return { success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Notification processing complete: ${successful} sent, ${failed} failed`);

    return new Response(JSON.stringify({ 
      success: true, 
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
    console.error("Error in process-message-notifications function:", error);
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