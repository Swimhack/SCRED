import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'welcome' | 'password-reset' | 'verification';
  to: string;
  firstName?: string;
  resetLink?: string;
  verificationLink?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, firstName, resetLink, verificationLink }: EmailRequest = await req.json();

    let emailSubject: string;
    let emailHtml: string;

    switch (type) {
      case 'welcome':
        emailSubject = "Welcome to StreetCredRX!";
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to StreetCredRX, ${firstName || 'there'}!</h1>
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