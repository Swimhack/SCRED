# Add RESEND_API_KEY to Supabase Vault
# This script helps you add the Resend API key to Supabase

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Add RESEND_API_KEY to Supabase Vault" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "The RESEND_API_KEY might not be set in Supabase Vault!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening Supabase Vault Settings..." -ForegroundColor Yellow
Start-Process "https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/vault"

Write-Host ""
Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "1. In the Vault page, look for 'RESEND_API_KEY' in the secrets list" -ForegroundColor White
Write-Host "2. If it doesn't exist, click 'New Secret'" -ForegroundColor White
Write-Host "3. Enter:" -ForegroundColor White
Write-Host "   Name: RESEND_API_KEY" -ForegroundColor Green
Write-Host "   Secret: re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha" -ForegroundColor Green
Write-Host "4. Click 'Create Secret'" -ForegroundColor White
Write-Host "5. IMPORTANT: Redeploy the Edge Function after adding the secret!" -ForegroundColor Red
Write-Host ""
Write-Host "After adding the secret, run:" -ForegroundColor Yellow
Write-Host '  $env:SUPABASE_ACCESS_TOKEN="sbp_f15c753f43ae218544c50b87e3d6cdd79c0fbaa0"; npx supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw' -ForegroundColor Green
Write-Host ""
Write-Host "Press Enter to continue..." -ForegroundColor Yellow
Read-Host



