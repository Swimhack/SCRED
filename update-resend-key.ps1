# Update RESEND_API_KEY in Supabase Vault
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update RESEND_API_KEY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "PROBLEM FOUND:" -ForegroundColor Red
Write-Host "The current API key in Supabase Vault is INCORRECT!" -ForegroundColor Red
Write-Host ""
Write-Host "Current (WRONG): 4d35b95eb22ef7e67d7c09e3453713b25a70a987ec3399a" -ForegroundColor Red
Write-Host "Expected format: re_..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Correct Resend API Key:" -ForegroundColor Green
Write-Host "re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha" -ForegroundColor Green
Write-Host ""
Write-Host "Opening Supabase Vault to update..." -ForegroundColor Yellow
Start-Process "https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/vault"

Write-Host ""
Write-Host "Steps to fix:" -ForegroundColor Cyan
Write-Host "1. Find 'RESEND_API_KEY' in the vault secrets list" -ForegroundColor White
Write-Host "2. Click the 'Edit' or 'Delete' button (trash icon)" -ForegroundColor White
Write-Host "3. Delete the old secret" -ForegroundColor White
Write-Host "4. Click 'New Secret' to create a fresh one:" -ForegroundColor White
Write-Host "   Name: RESEND_API_KEY" -ForegroundColor Green
Write-Host "   Secret: re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha" -ForegroundColor Green
Write-Host "5. Click 'Create Secret'" -ForegroundColor White
Write-Host ""
Write-Host "The correct API key has been copied to your clipboard!" -ForegroundColor Yellow
Set-Clipboard -Value "re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha"
Write-Host "Just paste it with Ctrl+V" -ForegroundColor Green
Write-Host ""
Write-Host "Press Enter after you've updated the secret..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "Now redeploying Edge Function with correct API key..." -ForegroundColor Yellow
Write-Host ""





