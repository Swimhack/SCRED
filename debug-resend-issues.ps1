# Debug Resend Email Issues
Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "DEBUGGING RESEND EMAIL ISSUES" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "Common issues when emails show 'success' but don't arrive:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. API KEY ISSUES:" -ForegroundColor Cyan
Write-Host "   - Wrong API key format (should start with 're_')" -ForegroundColor White
Write-Host "   - API key not in Edge Function Secrets (wrong location)" -ForegroundColor White
Write-Host "   - API key expired or invalid" -ForegroundColor White
Write-Host ""
Write-Host "2. DOMAIN ISSUES:" -ForegroundColor Cyan
Write-Host "   - streetcredrx.com not verified in Resend" -ForegroundColor White
Write-Host "   - SPF/DKIM records not set up" -ForegroundColor White
Write-Host "   - Domain verification pending" -ForegroundColor White
Write-Host ""
Write-Host "3. EMAIL DELIVERY ISSUES:" -ForegroundColor Cyan
Write-Host "   - Emails going to spam folder" -ForegroundColor White
Write-Host "   - Recipient email addresses not verified" -ForegroundColor White
Write-Host "   - Resend account limits exceeded" -ForegroundColor White
Write-Host ""

Write-Host "Opening diagnostic pages..." -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Resend Domains (check streetcredrx.com status)..." -ForegroundColor Cyan
Start-Process "https://resend.com/domains"

Start-Sleep -Seconds 1
Write-Host "2. Resend API Keys (check key status)..." -ForegroundColor Cyan
Start-Process "https://resend.com/api-keys"

Start-Sleep -Seconds 1
Write-Host "3. Resend Emails (check if any emails were sent)..." -ForegroundColor Cyan
Start-Process "https://resend.com/emails"

Start-Sleep -Seconds 1
Write-Host "4. Supabase Edge Function Secrets (verify API key location)..." -ForegroundColor Cyan
Start-Process "https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions"

Write-Host ""
Write-Host "CRITICAL CHECKS:" -ForegroundColor Red
Write-Host "1. In Resend Domains: Is streetcredrx.com 'Verified'?" -ForegroundColor Yellow
Write-Host "2. In Resend Emails: Do you see any recent emails sent?" -ForegroundColor Yellow
Write-Host "3. In Supabase Secrets: Is RESEND_API_KEY in the 'Secrets' section?" -ForegroundColor Yellow
Write-Host "4. Check spam folders in both email inboxes!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter after checking these..." -ForegroundColor Green
Read-Host

Write-Host ""
Write-Host "If streetcredrx.com is NOT verified in Resend:" -ForegroundColor Red
Write-Host "1. Add the domain in Resend Dashboard" -ForegroundColor White
Write-Host "2. Add the required DNS records (SPF, DKIM)" -ForegroundColor White
Write-Host "3. Wait for verification (5-15 minutes)" -ForegroundColor White
Write-Host "4. Redeploy Edge Function" -ForegroundColor White
Write-Host ""
Write-Host "If API key is wrong:" -ForegroundColor Red
Write-Host "1. Generate new API key in Resend" -ForegroundColor White
Write-Host "2. Update in Supabase Edge Function Secrets" -ForegroundColor White
Write-Host "3. Redeploy Edge Function" -ForegroundColor White


