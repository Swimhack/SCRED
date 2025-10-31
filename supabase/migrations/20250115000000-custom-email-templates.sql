-- Custom Email Templates for StreetCredRX
-- This migration updates Supabase auth email templates with branded HTML designs

-- Email Confirmation Template (Signup)
UPDATE auth.email_templates
SET 
  subject = 'Confirm your StreetCredRX account',
  body = '
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email - StreetCredRX</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #682D70 0%, #8B3D92 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">StreetCredRX</h1>
              <p style="margin: 8px 0 0 0; color: #F5E663; font-size: 14px; font-weight: 500;">Pharmacy Credentialing & Enrollment Services</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Welcome to StreetCredRX!</h2>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Thank you for signing up! To complete your registration and secure your account, please confirm your email address by clicking the button below.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background-color: #F5E663; color: #1a1a1a; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 230, 99, 0.3);">
                      Confirm Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                If the button doesn''t work, copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0 0; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #682D70; text-decoration: underline; font-size: 14px;">{{ .ConfirmationURL }}</a>
              </p>
              
              <p style="margin: 30px 0 0 0; color: #8a8a8a; font-size: 12px; line-height: 1.6;">
                This confirmation link will expire in 24 hours. If you didn''t create an account with StreetCredRX, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px 0; color: #6a6a6a; font-size: 12px; text-align: center;">
                <strong>StreetCredRX</strong><br>
                Pharmacy Credentialing & Enrollment Services
              </p>
              <p style="margin: 0; color: #8a8a8a; font-size: 11px; text-align: center; line-height: 1.6;">
                Questions? Contact us at <a href="mailto:info@streetcredrx.com" style="color: #682D70; text-decoration: none;">info@streetcredrx.com</a><br>
                <a href="https://streetcredrx.com" style="color: #682D70; text-decoration: none;">streetcredrx.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  '
WHERE id = 'confirm_signup';

-- Password Reset Template
UPDATE auth.email_templates
SET 
  subject = 'Reset your StreetCredRX password',
  body = '
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - StreetCredRX</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #682D70 0%, #8B3D92 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">StreetCredRX</h1>
              <p style="margin: 8px 0 0 0; color: #F5E663; font-size: 14px; font-weight: 500;">Pharmacy Credentialing & Enrollment Services</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your StreetCredRX account. Click the button below to create a new password.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background-color: #F5E663; color: #1a1a1a; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 230, 99, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                If the button doesn''t work, copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0 0; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #682D70; text-decoration: underline; font-size: 14px;">{{ .ConfirmationURL }}</a>
              </p>
              
              <p style="margin: 30px 0 0 0; color: #8a8a8a; font-size: 12px; line-height: 1.6;">
                <strong>Important:</strong> This password reset link will expire in 1 hour. If you didn''t request a password reset, you can safely ignore this email and your password will remain unchanged.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px 0; color: #6a6a6a; font-size: 12px; text-align: center;">
                <strong>StreetCredRX</strong><br>
                Pharmacy Credentialing & Enrollment Services
              </p>
              <p style="margin: 0; color: #8a8a8a; font-size: 11px; text-align: center; line-height: 1.6;">
                Questions? Contact us at <a href="mailto:info@streetcredrx.com" style="color: #682D70; text-decoration: none;">info@streetcredrx.com</a><br>
                <a href="https://streetcredrx.com" style="color: #682D70; text-decoration: none;">streetcredrx.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  '
WHERE id = 'reset_password';

-- Magic Link Template (Passwordless Login)
UPDATE auth.email_templates
SET 
  subject = 'Sign in to StreetCredRX',
  body = '
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In - StreetCredRX</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #682D70 0%, #8B3D92 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">StreetCredRX</h1>
              <p style="margin: 8px 0 0 0; color: #F5E663; font-size: 14px; font-weight: 500;">Pharmacy Credentialing & Enrollment Services</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Sign In to Your Account</h2>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Click the button below to securely sign in to your StreetCredRX account. No password needed!
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background-color: #F5E663; color: #1a1a1a; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 230, 99, 0.3);">
                      Sign In to StreetCredRX
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                If the button doesn''t work, copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0 0; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #682D70; text-decoration: underline; font-size: 14px;">{{ .ConfirmationURL }}</a>
              </p>
              
              <p style="margin: 30px 0 0 0; color: #8a8a8a; font-size: 12px; line-height: 1.6;">
                This sign-in link will expire in 1 hour. If you didn''t request this sign-in link, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px 0; color: #6a6a6a; font-size: 12px; text-align: center;">
                <strong>StreetCredRX</strong><br>
                Pharmacy Credentialing & Enrollment Services
              </p>
              <p style="margin: 0; color: #8a8a8a; font-size: 11px; text-align: center; line-height: 1.6;">
                Questions? Contact us at <a href="mailto:info@streetcredrx.com" style="color: #682D70; text-decoration: none;">info@streetcredrx.com</a><br>
                <a href="https://streetcredrx.com" style="color: #682D70; text-decoration: none;">streetcredrx.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  '
WHERE id = 'magic_link';

-- Email Change Template
UPDATE auth.email_templates
SET 
  subject = 'Confirm your new email address - StreetCredRX',
  body = '
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change - StreetCredRX</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #682D70 0%, #8B3D92 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">StreetCredRX</h1>
              <p style="margin: 8px 0 0 0; color: #F5E663; font-size: 14px; font-weight: 500;">Pharmacy Credentialing & Enrollment Services</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Confirm Your New Email Address</h2>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                You requested to change the email address for your StreetCredRX account. Click the button below to confirm this change.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background-color: #F5E663; color: #1a1a1a; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 230, 99, 0.3);">
                      Confirm Email Change
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                If the button doesn''t work, copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0 0; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #682D70; text-decoration: underline; font-size: 14px;">{{ .ConfirmationURL }}</a>
              </p>
              
              <p style="margin: 30px 0 0 0; color: #8a8a8a; font-size: 12px; line-height: 1.6;">
                If you didn''t request this email change, please contact our support team immediately at <a href="mailto:info@streetcredrx.com" style="color: #682D70; text-decoration: none;">info@streetcredrx.com</a>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px 0; color: #6a6a6a; font-size: 12px; text-align: center;">
                <strong>StreetCredRX</strong><br>
                Pharmacy Credentialing & Enrollment Services
              </p>
              <p style="margin: 0; color: #8a8a8a; font-size: 11px; text-align: center; line-height: 1.6;">
                Questions? Contact us at <a href="mailto:info@streetcredrx.com" style="color: #682D70; text-decoration: none;">info@streetcredrx.com</a><br>
                <a href="https://streetcredrx.com" style="color: #682D70; text-decoration: none;">streetcredrx.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  '
WHERE id = 'change_email';

-- Email Change Confirmation Template (Sent to old email)
UPDATE auth.email_templates
SET 
  subject = 'Your StreetCredRX email address was changed',
  body = '
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Changed - StreetCredRX</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #682D70 0%, #8B3D92 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">StreetCredRX</h1>
              <p style="margin: 8px 0 0 0; color: #F5E663; font-size: 14px; font-weight: 500;">Pharmacy Credentialing & Enrollment Services</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Email Address Changed</h2>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                The email address for your StreetCredRX account has been successfully changed. All future emails will be sent to your new email address.
              </p>
              
              <div style="background-color: #f9f9f9; border-left: 4px solid #682D70; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                  <strong>New email address:</strong> {{ .NewEmail }}<br>
                  <strong>Changed on:</strong> {{ .Timestamp }}
                </p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #8a8a8a; font-size: 12px; line-height: 1.6;">
                If you didn''t make this change, please contact our support team immediately at <a href="mailto:info@streetcredrx.com" style="color: #682D70; text-decoration: none;">info@streetcredrx.com</a> to secure your account.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px 0; color: #6a6a6a; font-size: 12px; text-align: center;">
                <strong>StreetCredRX</strong><br>
                Pharmacy Credentialing & Enrollment Services
              </p>
              <p style="margin: 0; color: #8a8a8a; font-size: 11px; text-align: center; line-height: 1.6;">
                Questions? Contact us at <a href="mailto:info@streetcredrx.com" style="color: #682D70; text-decoration: none;">info@streetcredrx.com</a><br>
                <a href="https://streetcredrx.com" style="color: #682D70; text-decoration: none;">streetcredrx.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  '
WHERE id = 'email_change';

