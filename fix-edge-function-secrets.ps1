# Fix Edge Function Secrets
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Edge Function Secrets Access" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "IMPORTANT: Edge Functions use a DIFFERENT secrets location!" -ForegroundColor Red
Write-Host ""
Write-Host "The secret needs to be in Edge Function Secrets, NOT Vault!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening Edge Function Settings..." -ForegroundColor Cyan
Start-Process "https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/functions"

Write-Host ""
Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "1. Scroll down to the 'Secrets' section" -ForegroundColor White
Write-Host "2. Look for 'RESEND_API_KEY' in the list" -ForegroundColor White
Write-Host "3. If it doesn't exist, click 'Add new secret'" -ForegroundColor White
Write-Host "4. Enter:" -ForegroundColor White
Write-Host "   Name: RESEND_API_KEY" -ForegroundColor Green
Write-Host "   Value: re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha" -ForegroundColor Green
Write-Host "5. Click 'Save' or 'Add Secret'" -ForegroundColor White
Write-Host ""
Write-Host "The API key is copied to clipboard - use Ctrl+V to paste" -ForegroundColor Yellow
Set-Clipboard -Value "re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha"
Write-Host ""
Write-Host "NOTE: This is different from the Vault you updated earlier!" -ForegroundColor Red
Write-Host "Edge Functions read from Project Settings > Edge Functions > Secrets" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter after adding the secret..." -ForegroundColor Yellow
Read-Host





