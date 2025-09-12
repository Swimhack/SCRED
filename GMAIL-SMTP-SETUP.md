# Gmail SMTP Setup for Contact Form

## Required Environment Variables

Add these environment variables to your Supabase project settings:

1. **GMAIL_USER** - Your Gmail email address
   ```
   example: your-email@gmail.com
   ```

2. **GMAIL_APP_PASSWORD** - Gmail app-specific password (not your regular password)
   ```
   example: abcd efgh ijkl mnop
   ```

3. **CONTACT_RECIPIENT_EMAIL** - Email address to receive contact form submissions
   ```
   example: james@ekaty.com
   ```
   Note: If not set, defaults to james@ekaty.com

## Setting up Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security > 2-Step Verification
3. Enable 2-Step Verification if not already enabled
4. Go to App Passwords (under 2-Step Verification)
5. Generate a new app password for "Mail"
6. Use this 16-character password as the `GMAIL_APP_PASSWORD`

## Adding Environment Variables to Supabase

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Scroll down to "Environment Variables" 
4. Add each variable with its corresponding value

## Testing the Setup

After setting up the environment variables:

1. Deploy your edge functions:
   ```bash
   supabase functions deploy send-contact-email
   ```

2. Test the contact form on your website
3. Check the contact submissions admin panel in your dashboard
4. Verify that emails are being sent successfully

## Troubleshooting

- If emails fail to send, check the `email_error` field in the contact submissions table
- Ensure your Gmail account has 2-Step Verification enabled
- Verify the app password is correct (no spaces)
- Check Supabase function logs for detailed error messages

## Security Notes

- Never commit environment variables to your repository
- Use app-specific passwords instead of your main Gmail password
- Consider using a dedicated Gmail account for sending system emails
- Monitor failed email attempts in the admin panel