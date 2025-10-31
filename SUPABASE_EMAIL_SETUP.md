# Supabase Email Templates - Custom Branding Setup

This guide will help you customize Supabase authentication emails with StreetCredRX branding, colors, and professional HTML design.

## 🎨 Brand Colors Used

- **Primary Purple (Finn)**: `#682D70` - Header background
- **Maize Yellow**: `#F5E663` - CTA buttons and accents
- **Robins Egg Blue**: `#54DEE0` - Accent color
- **Bittersweet Red**: `#FE5F55` - Alert/accent color

## 📧 Email Templates Included

1. **Email Confirmation** (Signup) - `confirm_signup`
2. **Password Reset** - `reset_password`
3. **Magic Link** (Passwordless Login) - `magic_link`
4. **Email Change Confirmation** - `change_email`
5. **Email Changed Notification** - `email_change`

## 🚀 Setup Instructions

### Option 1: Via Supabase Dashboard (Recommended)

1. **Navigate to Email Templates**
   - Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/auth/templates
   - Or: Project Settings → Authentication → Email Templates

2. **Update Each Template**
   - Click on each template type (Confirm signup, Reset password, etc.)
   - Copy the HTML from the corresponding file in `supabase/email-templates/`
   - Paste into the "Body" field
   - Update the "Subject" field with the custom subject line
   - Click "Save"

3. **Configure Email Settings**
   - Set **From Name**: `StreetCredRX`
   - Set **From Email**: `noreply@streetcredrx.com` (or your verified domain)
   - Enable **Custom SMTP** if using Resend (recommended)

### Option 2: Via Supabase CLI

```bash
# Apply the migration
cd streetcredrx1
supabase db push

# Or manually run the SQL
supabase db execute --file supabase/migrations/20250115000000-custom-email-templates.sql
```

### Option 3: Direct SQL (Advanced)

Run the SQL migration file directly in Supabase SQL Editor:
- Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/sql
- Copy contents from `supabase/migrations/20250115000000-custom-email-templates.sql`
- Execute the SQL

## 📝 Template Variables

Supabase provides these variables that work in templates:
- `{{ .ConfirmationURL }}` - The confirmation/reset link
- `{{ .Token }}` - The token (if needed)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address
- `{{ .NewEmail }}` - New email (for email change)
- `{{ .Timestamp }}` - Timestamp of the action

## ✨ Design Features

- **Responsive Design**: Works on mobile and desktop
- **Brand Colors**: Uses StreetCredRX brand palette
- **Professional Layout**: Clean, modern design with gradients
- **Clear CTAs**: Prominent yellow buttons for actions
- **Accessibility**: Proper contrast ratios and semantic HTML
- **Footer**: Includes contact information and branding

## 🧪 Testing

After updating templates:

1. **Test Email Confirmation**
   - Sign up with a test email
   - Check inbox for branded confirmation email

2. **Test Password Reset**
   - Request password reset
   - Verify email design and link functionality

3. **Check Mobile Rendering**
   - Open emails on mobile device
   - Verify responsive design works correctly

## 📋 Email Template Files

Individual template files are located in:
- `supabase/email-templates/confirm_signup.html`
- `supabase/email-templates/reset_password.html`
- `supabase/email-templates/magic_link.html`
- `supabase/email-templates/change_email.html`
- `supabase/email-templates/email_change.html`

## 🔧 Customization

To customize further:

1. **Update Colors**: Change hex values in the HTML
2. **Update Copy**: Modify text content to match your voice
3. **Add Logo**: Replace text logo with image logo URL
4. **Adjust Layout**: Modify table structure and spacing

## 📞 Support

For questions or issues:
- Email: info@streetcredrx.com
- Website: https://streetcredrx.com

