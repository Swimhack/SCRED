# PowerShell script to update Supabase email from name
# This uses the Supabase Management API

$ErrorActionPreference = "Stop"

$PROJECT_REF = "tvqyozyjqcswojsbduzw"
$FROM_NAME = "StreetCredRX"
$FROM_EMAIL = "noreply@streetcredrx.com"

# Check if access token is set
if (-not $env:SUPABASE_ACCESS_TOKEN) {
    Write-Host "❌ Error: SUPABASE_ACCESS_TOKEN environment variable is required" -ForegroundColor Red
    Write-Host ""
    Write-Host "To get your access token:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://supabase.com/dashboard/account/tokens"
    Write-Host "2. Create a new access token"
    Write-Host "3. Set it: `$env:SUPABASE_ACCESS_TOKEN='your_token'"
    exit 1
}

Write-Host "🔄 Updating Supabase email from name..." -ForegroundColor Cyan

# Get current settings first
try {
    $getResponse = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $env:SUPABASE_ACCESS_TOKEN"
            "Content-Type" = "application/json"
        }
    
    Write-Host "✅ Current settings retrieved" -ForegroundColor Green
} catch {
    Write-Host "❌ Error getting current settings: $_" -ForegroundColor Red
    exit 1
}

# Update email settings
$body = @{
    mailer_from_name = $FROM_NAME
    mailer_from_email = $FROM_EMAIL
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" `
        -Method PATCH `
        -Headers @{
            "Authorization" = "Bearer $env:SUPABASE_ACCESS_TOKEN"
            "Content-Type" = "application/json"
        } `
        -Body $body
    
    Write-Host "✅ Email from name updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📧 Email Settings:" -ForegroundColor Cyan
    Write-Host "   From Name: $FROM_NAME"
    Write-Host "   From Email: $FROM_EMAIL"
    Write-Host ""
    Write-Host "✨ All authentication emails will now show '$FROM_NAME' as the sender name!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error updating email settings: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternative: Update via Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/auth/templates"
    Write-Host "   2. Click 'Settings' tab"
    Write-Host "   3. Set 'From Name' to: $FROM_NAME"
    Write-Host "   4. Set 'From Email' to: $FROM_EMAIL"
    exit 1
}

