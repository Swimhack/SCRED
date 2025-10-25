# Verify RESEND_API_KEY Configuration
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFYING RESEND API KEY CONFIGURATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Opening Supabase Edge Function Secrets..." -ForegroundColor Yellow
Start-Process "https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions"

Write-Host ""
Write-Host "CRITICAL CHECK:" -ForegroundColor Red
Write-Host "In the Edge Function Secrets page, look for:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Is 'RESEND_API_KEY' listed in the secrets?" -ForegroundColor White
Write-Host "2. Does the value start with 're_'?" -ForegroundColor White
Write-Host "3. Is it in the 'Secrets' section (NOT Vault)?" -ForegroundColor White
Write-Host ""
Write-Host "If RESEND_API_KEY is missing or wrong:" -ForegroundColor Red
Write-Host "1. Click 'Add new secret'" -ForegroundColor White
Write-Host "2. Name: RESEND_API_KEY" -ForegroundColor Green
Write-Host "3. Value: re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha" -ForegroundColor Green
Write-Host "4. Click 'Save'" -ForegroundColor White
Write-Host "5. Redeploy Edge Function" -ForegroundColor White
Write-Host ""
Write-Host "The API key is copied to clipboard for easy pasting:" -ForegroundColor Yellow
Set-Clipboard -Value "re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha"
Write-Host ""
Write-Host "Press Enter after checking/updating the API key..." -ForegroundColor Green
Read-Host

Write-Host ""
Write-Host "Now redeploying Edge Function to pick up the API key..." -ForegroundColor Yellow
Write-Host ""




