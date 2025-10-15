# Quick Setup Script for Resend API Key
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   RESEND EMAIL SETUP" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Copy API key to clipboard
$apiKey = "re_Voo9XZgj_LuUZDm7d7Kz2tJXtS1dYpEha"
Set-Clipboard -Value $apiKey
Write-Host "1. API key copied to clipboard!" -ForegroundColor Green
Write-Host ""

# Open Supabase Vault
Write-Host "2. Opening Supabase Vault..." -ForegroundColor Yellow
Start-Process "https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/vault"
Start-Sleep -Seconds 2

# Open Edge Functions
Write-Host "3. Opening Edge Functions..." -ForegroundColor Yellow
Start-Process "https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "In Supabase VAULT tab:" -ForegroundColor White
Write-Host "  1. Click 'New Secret'" -ForegroundColor White
Write-Host "  2. Name: RESEND_API_KEY" -ForegroundColor Cyan
Write-Host "  3. Secret: Paste from clipboard (Ctrl+V)" -ForegroundColor Cyan
Write-Host "  4. Click 'Create Secret'" -ForegroundColor White
Write-Host ""
Write-Host "In Edge FUNCTIONS tab:" -ForegroundColor White
Write-Host "  1. Click 'send-contact-email'" -ForegroundColor White
Write-Host "  2. Click 'Deploy' button" -ForegroundColor White
Write-Host "  3. Wait for deployment" -ForegroundColor White
Write-Host ""
Write-Host "Then TEST at:" -ForegroundColor White
Write-Host "  https://streetcredrx1.fly.dev/contact" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
