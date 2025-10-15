# Open Supabase Vault to Add RESEND_API_KEY
# This script will open the necessary Supabase Dashboard pages in your browser

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   SUPABASE VAULT - ADD RESEND_API_KEY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Opening Supabase Dashboard pages..." -ForegroundColor Yellow
Write-Host ""

# Open Vault Settings page
$vaultUrl = "https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/vault"
Write-Host "✓ Opening Vault Settings..." -ForegroundColor Green
Start-Process $vaultUrl
Start-Sleep -Seconds 2

# Open Edge Functions page (for redeployment)
$functionsUrl = "https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions"
Write-Host "✓ Opening Edge Functions..." -ForegroundColor Green
Start-Process $functionsUrl

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Add Secret in Vault" -ForegroundColor Yellow
Write-Host "  In the Vault page that just opened:" -ForegroundColor White
Write-Host "  1. Click 'New Secret' button" -ForegroundColor White
Write-Host "  2. Enter the following:" -ForegroundColor White
Write-Host ""
Write-Host "     Name: " -NoNewline -ForegroundColor White
Write-Host "RESEND_API_KEY" -ForegroundColor Cyan
Write-Host ""
Write-Host "     Secret: " -NoNewline -ForegroundColor White
Write-Host "re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha" -ForegroundColor Green
Write-Host ""
Write-Host "  3. Click 'Create Secret'" -ForegroundColor White
Write-Host ""

Write-Host "STEP 2: Redeploy Edge Function" -ForegroundColor Yellow
Write-Host "  In the Edge Functions page that just opened:" -ForegroundColor White
Write-Host "  1. Find 'send-contact-email' in the list" -ForegroundColor White
Write-Host "  2. Click on it" -ForegroundColor White
Write-Host "  3. Click 'Deploy' button in top right" -ForegroundColor White
Write-Host "  4. Wait for deployment to complete" -ForegroundColor White
Write-Host ""

Write-Host "STEP 3: Test Email Sending" -ForegroundColor Yellow
Write-Host "  After redeployment completes:" -ForegroundColor White
Write-Host "  1. Go to: https://streetcredrx1.fly.dev/contact" -ForegroundColor Cyan
Write-Host "  2. Submit a test message" -ForegroundColor White
Write-Host "  3. Check your email inbox" -ForegroundColor White
Write-Host "  4. Check Resend dashboard: https://resend.com/emails" -ForegroundColor Cyan
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   IMPORTANT NOTES" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  SANDBOX LIMITATION:" -ForegroundColor Red
Write-Host "   Resend sandbox can only send to VERIFIED emails" -ForegroundColor Yellow
Write-Host "   Current recipient: contact@streetcredrx.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Two options:" -ForegroundColor White
Write-Host "   A) Verify 'contact@streetcredrx.com' in Resend" -ForegroundColor White
Write-Host "   B) Add custom domain 'streetcredrx.com' to Resend" -ForegroundColor White
Write-Host ""
Write-Host "   For now, I've updated the code to send to:" -ForegroundColor White
Write-Host "   ajlipka@gmail.com (for testing)" -ForegroundColor Green
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to copy the API key to clipboard..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

# Copy API key to clipboard
$apiKey = "re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha"
Set-Clipboard -Value $apiKey
Write-Host ""
Write-Host "API key copied to clipboard!" -ForegroundColor Green
Write-Host "  You can now paste it in the Supabase Vault form" -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Good luck! Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
