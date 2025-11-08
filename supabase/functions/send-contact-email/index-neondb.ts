import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // PostgreSQL connection pool
  let pool: Pool | null = null

  try {
    // Get NeonDB connection string from environment
    const neonDbUrl = Deno.env.get('NEON_DATABASE_URL') ||
      'postgresql://neondb_owner:npg_1GEjV8oCAUNZ@ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'

    console.log('Connecting to NeonDB...', {
      hasConnectionString: !!neonDbUrl
    })

    // Create connection pool
    pool = new Pool(neonDbUrl, 3, true)

    // Extract IP address from request headers
    const clientIP = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     req.headers.get('cf-connecting-ip') ||
                     'unknown'

    const requestBody = await req.json()
    console.log('Received request body:', JSON.stringify(requestBody, null, 2))

    const { name, email, phone, message, source = 'website', userAgent, ipAddress, referrer }: ContactFormData = requestBody

    // Use client IP from headers if not provided in request body
    const rawIpAddress = ipAddress || clientIP
    const finalIpAddress = rawIpAddress.split(',')[0].trim()

    // Validate required fields
    const trimmedName = name?.trim()
    const trimmedEmail = email?.trim()
    const trimmedMessage = message?.trim()

    console.log('Validation check:', {
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage ? trimmedMessage.substring(0, 50) : null,
      hasName: !!trimmedName,
      hasEmail: !!trimmedEmail,
      hasMessage: !!trimmedMessage
    })

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      console.error('Validation failed:', {
        name: !trimmedName ? 'missing' : 'ok',
        email: !trimmedEmail ? 'missing' : 'ok',
        message: !trimmedMessage ? 'missing' : 'ok'
      })
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          details: {
            name: !trimmedName ? 'Name is required' : undefined,
            email: !trimmedEmail ? 'Email is required' : undefined,
            message: !trimmedMessage ? 'Message is required' : undefined
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Store submission in NeonDB using direct PostgreSQL connection
    const connection = await pool.connect()

    try {
      const result = await connection.queryObject<{
        id: string;
        created_at: string;
      }>(
        `INSERT INTO contact_submissions (
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
          userAgent || null,
          finalIpAddress,
          referrer || null,
          'new'
        ]
      )

      const submission = result.rows[0]

      if (!submission) {
        throw new Error('Failed to insert contact submission')
      }

      console.log('Submission stored successfully:', {
        id: submission.id,
        created_at: submission.created_at
      })

      // Send email via Resend
      try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        const recipientEmail = 'aj@streetcredrx.com'

        if (!resendApiKey) {
          console.error('Resend API key not configured')

          // Update submission to mark email error
          await connection.queryObject(
            `UPDATE contact_submissions
             SET email_error = $1, email_sent = false
             WHERE id = $2`,
            ['Resend API key not configured', submission.id]
          )

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Contact form submitted successfully',
              id: submission.id,
              emailWarning: 'Email notification could not be sent'
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Import Resend
        const { Resend } = await import('https://esm.sh/resend@2.0.0')
        const resend = new Resend(resendApiKey)

        // Determine if this is an investor inquiry
        const isInvestorInquiry = source === 'investor-homepage'

        // Prepare email content
        const emailSubject = isInvestorInquiry
          ? `🚀 New Investor Inquiry from ${trimmedName} - StreetCredRx`
          : `💼 New Contact Form Submission from ${trimmedName} - StreetCredRx`

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
                  <strong style="color: #374151;">StreetCredRx Platform</strong><br>
                  <a href="mailto:unsubscribe@streetcredrx.com" style="color: #6b7280; text-decoration: none;">Unsubscribe</a> |
                  <a href="https://streetcredrx.com" style="color: #6b7280; text-decoration: none;">Visit Website</a>
                </p>
              </div>
            </div>
          </div>
          </body>
          </html>
        `

        // Send email using Resend
        console.log('Attempting to send email with Resend...', {
          from: 'StreetCredRx Contact Form <noreply@streetcredrx.com>',
          to: recipientEmail,
          bcc: 'james@ekaty.com',
          subject: emailSubject
        })

        const emailResponse = await resend.emails.send({
          from: 'StreetCredRx Contact Form <noreply@streetcredrx.com>',
          to: [recipientEmail],
          bcc: ['james@ekaty.com'],
          subject: emailSubject,
          html: emailHtml,
          text: `
${isInvestorInquiry ? 'New Investor Inquiry' : 'New Contact Form Submission'} - StreetCredRx

Contact Information:
Name: ${trimmedName}
Email: ${trimmedEmail}
Phone: ${phone?.trim() || 'Not provided'}
Source: ${source || 'Website'}

Message:
${trimmedMessage}

Submission Details:
Submission ID: ${submission.id}
Submitted: ${new Date(submission.created_at).toLocaleString()}
IP Address: ${finalIpAddress || 'Not provided'}
Referrer: ${referrer || 'Not provided'}

${isInvestorInquiry ? 'INVESTOR PRIORITY: This inquiry came from the investor-focused homepage. Please prioritize response.' : ''}

---
Automatically generated by StreetCredRx Contact Form System
StreetCredRx Platform
          `.trim()
        })

        console.log('Email sent successfully:', emailResponse)

        // Update submission to mark email sent
        await connection.queryObject(
          `UPDATE contact_submissions
           SET email_sent = true, email_sent_at = NOW()
           WHERE id = $1`,
          [submission.id]
        )

      } catch (emailError) {
        console.error('Email error:', emailError)

        // Update submission to mark email error
        await connection.queryObject(
          `UPDATE contact_submissions
           SET email_error = $1, email_sent = false
           WHERE id = $2`,
          [String(emailError), submission.id]
        )
      }

      // Log the contact form submission
      await connection.queryObject(
        `INSERT INTO application_logs (
          level, message, metadata, route, user_agent, ip_address
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'info',
          'Contact form submission received',
          JSON.stringify({
            action: 'contact_form_submission',
            submission_id: submission.id,
            email: email,
            source: source
          }),
          '/api/contact',
          userAgent || null,
          finalIpAddress
        ]
      )

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Contact form submitted successfully',
          id: submission.id
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } finally {
      // Release connection back to pool
      connection.release()
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } finally {
    // Clean up pool
    if (pool) {
      await pool.end()
    }
  }
})
