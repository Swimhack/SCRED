# Manual Edge Function Deployment Helper
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   DEPLOY EDGE FUNCTION MANUALLY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Opening Supabase Edge Functions..." -ForegroundColor Yellow
Start-Process "https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   DEPLOYMENT INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Find 'send-contact-email' in the functions list" -ForegroundColor White
Write-Host "2. Click on it to open" -ForegroundColor White
Write-Host "3. Look for a 'Deploy' or 'Redeploy' button" -ForegroundColor White
Write-Host "4. Click it and wait 30-60 seconds" -ForegroundColor White
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   WHAT WAS FIXED" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✓ Fixed validation to properly trim values" -ForegroundColor Green
Write-Host "✓ Added detailed logging for debugging" -ForegroundColor Green
Write-Host "✓ Better error messages showing which fields are missing" -ForegroundColor Green
Write-Host "✓ Consistent use of trimmed values throughout" -ForegroundColor Green
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   AFTER DEPLOYMENT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test the form at:" -ForegroundColor Yellow
Write-Host "  https://streetcredrx1.fly.dev/contact" -ForegroundColor Cyan
Write-Host ""

Write-Host "Check logs in Supabase to see:" -ForegroundColor Yellow
Write-Host "  - What data was received" -ForegroundColor White
Write-Host "  - Validation results" -ForegroundColor White
Write-Host "  - Email send status" -ForegroundColor White
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The Edge Functions dashboard should now be open!" -ForegroundColor Green
Write-Host "Follow the steps above to deploy." -ForegroundColor Green
Write-Host ""
