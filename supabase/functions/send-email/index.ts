import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// HTML escape function to prevent injection
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'welcome' | 'password-reset' | 'verification' | 'user-invitation' | 'role-change' | 'developer-message';
  to: string;
  firstName?: string;
  resetLink?: string;
  verificationLink?: string;
  roleName?: string;
  invitationToken?: string;
  inviteLink?: string;
  newRole?: string;
  // Developer message fields
  message?: string;
  senderType?: string;
  senderName?: string;
  messageId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, firstName, resetLink, verificationLink, roleName, invitationToken, inviteLink, newRole, message, senderType, senderName, messageId }: EmailRequest = await req.json();

    let emailSubject: string;
    let emailHtml: string;

    switch (type) {
      case 'welcome':
        emailSubject = "Welcome to StreetCredRX!";
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to StreetCredRX, ${escapeHtml(firstName || 'there')}!</h1>
            <p>Thank you for joining our platform. We're excited to help you manage your pharmacy credentials efficiently.</p>
            <p>You can now access your dashboard and start managing your applications and credentials.</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The StreetCredRX Team</p>
          </div>
        `;
        break;

      case 'password-reset':
        emailSubject = "Reset Your Password - StreetCredRX";
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Password Reset Request</h1>
            <p>We received a request to reset your password for your StreetCredRX account.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">Reset Password</a>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>Best regards,<br>The StreetCredRX Team</p>
          </div>
        `;
        break;

      case 'verification':
        emailSubject = "Please Verify Your Email - StreetCredRX";
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Verify Your Email Address</h1>
            <p>Thank you for signing up for StreetCredRX! Please verify your email address to complete your registration.</p>
            <p>Click the link below to verify your email:</p>
            <a href="${verificationLink}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">Verify Email</a>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <p>Best regards,<br>The StreetCredRX Team</p>
          </div>
        `;
        break;

      case 'user-invitation':
        emailSubject = "You're Invited to Join StreetCredRX!";
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
            <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 10px;">Welcome to StreetCredRX!</h1>
                <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #3b82f6, #06b6d4); margin: 0 auto;"></div>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                You've been invited to join StreetCredRX as a <strong>${escapeHtml(roleName?.replace('_', ' ').toUpperCase() || 'User')}</strong>.
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                StreetCredRX is a comprehensive platform for managing pharmacy credentialing and enrollment services. 
                Click the button below to accept your invitation and set up your account.
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${escapeHtml(inviteLink || '#')}" style="background: linear-gradient(90deg, #3b82f6, #06b6d4); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                  Accept Invitation
                </a>
              </div>
              
              <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #64748b; font-size: 14px; margin: 0; text-align: center;">
                  <strong>Your Role:</strong> ${escapeHtml(roleName?.replace('_', ' ').toUpperCase() || 'User')}<br>
                  <strong>Invitation Token:</strong> ${escapeHtml(invitationToken || 'N/A')}
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                This invitation will expire in 7 days. If you have any questions, please contact our support team.
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Best regards,<br>
                  <strong style="color: #374151;">The StreetCredRX Team</strong>
                </p>
              </div>
            </div>
          </div>
        `;
        break;

      case 'role-change':
        emailSubject = "Your Role Has Been Updated - StreetCredRX";
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
            <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 10px;">Role Update Notification</h1>
                <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #10b981, #059669); margin: 0 auto;"></div>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Hello ${escapeHtml(firstName || 'there')},
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Your role in StreetCredRX has been updated to <strong>${escapeHtml(newRole?.replace('_', ' ').toUpperCase() || 'Unknown')}</strong>.
              </p>
              
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0;">
                <p style="color: #065f46; font-size: 16px; margin: 0;">
                  <strong>New Role:</strong> ${escapeHtml(newRole?.replace('_', ' ').toUpperCase() || 'Unknown')}
                </p>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                This change may affect your access permissions within the platform. Please log in to see your updated dashboard and available features.
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://streetcredrx.lovable.app/dashboard" style="background: linear-gradient(90deg, #10b981, #059669); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  Go to Dashboard
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                If you have any questions about this change or need assistance, please contact our support team.
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Best regards,<br>
                  <strong style="color: #374151;">The StreetCredRX Team</strong>
                </p>
              </div>
            </div>
          </div>
        `;
        break;

      case 'developer-message':
        emailSubject = `New Developer Message - StreetCredRX`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
            <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 10px;">New Developer Message</h1>
                <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #3b82f6, #06b6d4); margin: 0 auto;"></div>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Hello ${escapeHtml(firstName || 'there')},
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                You have received a new message from the ${senderType === 'developer' ? 'development team' : 'administration team'}.
              </p>
              
              <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0;">
                <p style="color: #1e293b; font-size: 16px; margin: 0; line-height: 1.6;">
                  <strong>From:</strong> ${escapeHtml(senderName || (senderType === 'developer' ? 'Development Team' : 'Administration Team'))}<br>
                  <strong>Message:</strong><br><br>
                  ${escapeHtml(message || 'No message content')}
                </p>
              </div>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://streetcredrx.lovable.app/${senderType === 'developer' ? 'admin-messages' : 'dev-console'}" style="background: linear-gradient(90deg, #3b82f6, #06b6d4); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                  View Message
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                You can reply to this message directly through the platform. To manage your notification preferences, visit your account settings.
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Best regards,<br>
                  <strong style="color: #374151;">The StreetCredRX Team</strong>
                </p>
              </div>
            </div>
          </div>
        `;
        break;

      default:
        throw new Error("Invalid email type");
    }

    const emailResponse = await resend.emails.send({
      from: "StreetCredRX <noreply@resend.dev>",
      to: [to],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
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