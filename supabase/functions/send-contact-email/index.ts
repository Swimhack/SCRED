import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

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

  try {
    // Get environment variables with defaults and logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://tvqyozyjqcswojsbduzw.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''

    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlLength: supabaseUrl.length,
      keyLength: supabaseKey.length
    })

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Extract IP address from request headers
    const clientIP = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     req.headers.get('cf-connecting-ip') ||
                     'unknown'

    const requestBody = await req.json()
    console.log('Received request body:', JSON.stringify(requestBody, null, 2))
    
    const { name, email, phone, message, source = 'website', userAgent, ipAddress, referrer }: ContactFormData = requestBody

    // Use client IP from headers if not provided in request body
    // x-forwarded-for can contain multiple IPs, take the first one
    const rawIpAddress = ipAddress || clientIP
    const finalIpAddress = rawIpAddress.split(',')[0].trim()

    // Validate required fields - check for undefined, null, or empty strings
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

    // Store submission in database using trimmed values
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name: trimmedName,
        email: trimmedEmail,
        phone: phone?.trim() || null,
        message: trimmedMessage,
        source,
        user_agent: userAgent,
        ip_address: finalIpAddress,
        referrer,
        status: 'new'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', JSON.stringify(dbError, null, 2))
      return new Response(
        JSON.stringify({
          error: 'Failed to save submission',
          details: dbError.message || 'Unknown database error',
          code: dbError.code || 'unknown'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Send email via Resend
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY')
      const recipientEmail = 'aj@streetcredrx.com'

      if (!resendApiKey) {
        console.error('Resend API key not configured')
        // Update submission to mark email error but don't fail the request
        await supabase
          .from('contact_submissions')
          .update({ 
            email_error: 'Resend API key not configured',
            email_sent: false
          })
          .eq('id', submission.id)

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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
          <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 10px;">
                ${isInvestorInquiry ? '🚀 New Investor Inquiry' : '💼 New Contact Form Submission'}
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
      `

      // Send email using Resend
      const emailResponse = await resend.emails.send({
        from: 'StreetCredRx Contact Form <noreply@resend.dev>',
        to: [recipientEmail],
        subject: emailSubject,
        html: emailHtml,
      })

      console.log('Email sent successfully:', emailResponse)

      // Update submission to mark email sent
      await supabase
        .from('contact_submissions')
        .update({ 
          email_sent: true,
          email_sent_at: new Date().toISOString()
        })
        .eq('id', submission.id)

    } catch (emailError) {
      console.error('Email error:', emailError)
      
      // Update submission to mark email error
      await supabase
        .from('contact_submissions')
        .update({ 
          email_error: String(emailError),
          email_sent: false
        })
        .eq('id', submission.id)
    }

    // Log the contact form submission
    await supabase
      .from('app_logs')
      .insert({
        level: 'info',
        message: 'Contact form submission received',
        context: JSON.stringify({
          action: 'contact_form_submission',
          submission_id: submission.id,
          email: email,
          source: source
        }),
        route: '/api/contact',
        user_agent: userAgent,
        ip_address: finalIpAddress
      })

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

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})