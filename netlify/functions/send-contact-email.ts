import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import pkg from 'pg';
const { Pool } = pkg;

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  source?: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let pool: InstanceType<typeof Pool> | null = null;

  try {
    const neonDbUrl = process.env.NEON_DATABASE_URL;
    
    if (!neonDbUrl) {
      throw new Error('NEON_DATABASE_URL not configured');
    }

    pool = new Pool({
      connectionString: neonDbUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });

    const clientIP = event.headers['x-forwarded-for'] || 
                     event.headers['x-real-ip'] || 
                     event.headers['client-ip'] || 
                     'unknown';

    const body: ContactFormData = JSON.parse(event.body || '{}');
    const { name, email, phone, message, source = 'website', userAgent, referrer } = body;

    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();
    const trimmedMessage = message?.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields',
          details: {
            name: !trimmedName ? 'Name is required' : undefined,
            email: !trimmedEmail ? 'Email is required' : undefined,
            message: !trimmedMessage ? 'Message is required' : undefined,
          },
        }),
      };
    }

    const client = await pool.connect();

    try {
      const finalIpAddress = clientIP.split(',')[0].trim();

      const result = await client.query(
        `INSERT INTO public.contact_submissions (
          name, email, phone, message, source,
          user_agent, ip_address, referrer, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, created_at`,
        [
          trimmedName,
          trimmedEmail,
          phone?.trim() || null,
          trimmedMessage,
          source,
          userAgent || event.headers['user-agent'] || null,
          finalIpAddress,
          referrer || null,
          'new',
        ]
      );

      const submission = result.rows[0];

      if (!submission) {
        throw new Error('Failed to insert contact submission');
      }

      // Send email via Resend
      try {
        const resendApiKey = process.env.RESEND_API_KEY;

        if (!resendApiKey) {
          console.error('Resend API key not configured');
          
          await client.query(
            `UPDATE public.contact_submissions
             SET email_error = $1, email_sent = false
             WHERE id = $2`,
            ['Resend API key not configured', submission.id]
          );

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: 'Contact form submitted successfully',
              id: submission.id,
              emailWarning: 'Email notification could not be sent',
            }),
          };
        }

        const isInvestorInquiry = source === 'investor-homepage';
        const emailSubject = isInvestorInquiry
          ? `🚀 New Investor Inquiry from ${trimmedName} - StreetCredRx`
          : `💼 New Contact Form Submission from ${trimmedName} - StreetCredRx`;

        const emailHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${isInvestorInquiry ? 'New Investor Inquiry' : 'New Contact Form Submission'} - StreetCredRx</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
              <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 10px; font-weight: normal;">
                    ${isInvestorInquiry ? 'New Investor Inquiry' : 'New Contact Form Submission'}
                  </h1>
                  <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #3b82f6, #06b6d4); margin: 0 auto;"></div>
                </div>

              <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">Contact Information</h3>
                <p style="color: #1e293b; margin: 5px 0;"><strong>Name:</strong> ${trimmedName}</p>
                <p style="color: #1e293b; margin: 5px 0;"><strong>Email:</strong> ${trimmedEmail}</p>
                <p style="color: #1e293b; margin: 5px 0;"><strong>Phone:</strong> ${phone?.trim() || 'Not provided'}</p>
                <p style="color: #1e293b; margin: 5px 0;"><strong>Source:</strong> ${source || 'Website'}</p>
              </div>

              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
                <h3 style="color: #065f46; margin-top: 0;">Message</h3>
                <p style="color: #065f46; line-height: 1.6; margin: 0;">${trimmedMessage.replace(/\n/g, '<br>')}</p>
              </div>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
                <h3 style="color: #92400e; margin-top: 0;">Submission Details</h3>
                <p style="color: #92400e; margin: 5px 0;"><strong>Submission ID:</strong> ${submission.id}</p>
                <p style="color: #92400e; margin: 5px 0;"><strong>Submitted:</strong> ${new Date(submission.created_at).toLocaleString()}</p>
                <p style="color: #92400e; margin: 5px 0;"><strong>IP Address:</strong> ${finalIpAddress || 'Not provided'}</p>
                <p style="color: #92400e; margin: 5px 0;"><strong>Referrer:</strong> ${referrer || 'Not provided'}</p>
              </div>

              ${isInvestorInquiry ? `
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(90deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 8px;">
                  <h3 style="margin: 0; color: white;">🎯 INVESTOR PRIORITY</h3>
                  <p style="margin: 10px 0 0 0; color: white;">This inquiry came from the investor-focused homepage. Please prioritize response.</p>
                </div>
              </div>
              ` : ''}

              <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Automatically generated by StreetCredRx Contact Form System<br>
                  <strong style="color: #374151;">StreetCredRx Platform</strong>
                </p>
              </div>
            </div>
          </div>
          </body>
          </html>
        `;

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'StreetCredRx Contact Form <noreply@streetcredrx.com>',
            to: ['aj@streetcredrx.com'],
            bcc: ['james@ekaty.com'],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          throw new Error(`Resend API error: ${errorText}`);
        }

        await client.query(
          `UPDATE public.contact_submissions
           SET email_sent = true, email_sent_at = NOW()
           WHERE id = $1`,
          [submission.id]
        );

      } catch (emailError) {
        console.error('Email error:', emailError);
        
        await client.query(
          `UPDATE public.contact_submissions
           SET email_error = $1, email_sent = false
           WHERE id = $2`,
          [String(emailError), submission.id]
        );
      }

      await client.query(
        `INSERT INTO public.application_logs (
          level, message, metadata, route, user_agent, ip_address
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'info',
          'Contact form submission received',
          JSON.stringify({
            action: 'contact_form_submission',
            submission_id: submission.id,
            email: email,
            source: source,
          }),
          '/api/contact',
          userAgent || event.headers['user-agent'] || null,
          finalIpAddress,
        ]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Contact form submitted successfully',
          id: submission.id,
        }),
      };

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Function error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined,
      }),
    };
  } finally {
    if (pool) {
      try {
        await pool.end();
      } catch (poolError) {
        console.error('Error closing pool:', poolError);
      }
    }
  }
};

export { handler };
