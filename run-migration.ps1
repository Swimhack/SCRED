# Supabase Data Migration - Automated Script
# This script will guide you through the migration process

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SUPABASE DATA MIGRATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "FROM: " -NoNewline -ForegroundColor White
Write-Host "https://sctzykgcfkhadowyqcrj.supabase.co" -ForegroundColor Yellow
Write-Host "TO:   " -NoNewline -ForegroundColor White
Write-Host "https://tvqyozyjqcswojsbduzw.supabase.co`n" -ForegroundColor Green

# Check if Node.js is available
Write-Host "Checking prerequisites..." -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# Check if @supabase/supabase-js is installed
Write-Host "Checking npm packages..." -ForegroundColor Cyan
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$hasSupabase = $packageJson.dependencies.'@supabase/supabase-js' -or $packageJson.devDependencies.'@supabase/supabase-js'
if (-not $hasSupabase) {
    Write-Host "⚠️  @supabase/supabase-js not found in package.json" -ForegroundColor Yellow
    Write-Host "Installing..." -ForegroundColor Yellow
    npm install @supabase/supabase-js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install @supabase/supabase-js" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ @supabase/supabase-js is available`n" -ForegroundColor Green

# Prompt for service role key
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   GET SERVICE ROLE KEY" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

Write-Host "To complete the migration, I need your NEW Supabase service role key.`n" -ForegroundColor White
Write-Host "1. Open this URL in your browser:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/settings/api`n" -ForegroundColor Cyan
Write-Host "2. Scroll down to 'Project API keys'" -ForegroundColor White
Write-Host "3. Find the " -NoNewline -ForegroundColor White
Write-Host "service_role" -NoNewline -ForegroundColor Yellow
Write-Host " key (marked as 'secret')" -ForegroundColor White
Write-Host "4. Click the copy button`n" -ForegroundColor White

Write-Host "⚠️  " -NoNewline -ForegroundColor Yellow
Write-Host "This key is SECRET - never share it or commit it to git!`n" -ForegroundColor Yellow

# Prompt for key
$serviceKey = Read-Host "Paste your service role key here"

if ([string]::IsNullOrWhiteSpace($serviceKey)) {
    Write-Host "`n❌ Service role key is required. Aborting." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Service key received!`n" -ForegroundColor Green

# Check schema first
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   STEP 1: CHECKING SCHEMA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$env:NEW_SUPABASE_SERVICE_KEY = $serviceKey
Write-Host "Running schema check...`n" -ForegroundColor White

$checkResult = node check-new-supabase-schema.js 2>&1
Write-Host $checkResult

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  Schema check failed or tables are missing." -ForegroundColor Yellow
    $continue = Read-Host "`nDo you want to continue with migration anyway? (y/n)"
    if ($continue -ne 'y') {
        Write-Host "`nMigration aborted. Please apply migrations first." -ForegroundColor Yellow
        exit 1
    }
}

# Run migration
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   STEP 2: MIGRATING DATA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Starting data migration...`n" -ForegroundColor White
Write-Host "⏳ This may take several minutes depending on data size.`n" -ForegroundColor Yellow

$env:NEW_SUPABASE_SERVICE_KEY = $serviceKey
node migrate-supabase-data.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "   ✅ MIGRATION COMPLETE!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "Next steps:`n" -ForegroundColor White
    Write-Host "1. Test your application with the new Supabase" -ForegroundColor White
    Write-Host "2. Verify all data is accessible" -ForegroundColor White
    Write-Host "3. Check PharmacistDetailModal for complete data" -ForegroundColor White
    Write-Host "4. Keep old Supabase running for 7 days as backup`n" -ForegroundColor White
    
    Write-Host "Your .env.mvp is already configured with the new Supabase URL!" -ForegroundColor Green
    Write-Host "You're ready to go! 🚀`n" -ForegroundColor Green
} else {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "   ❌ MIGRATION FAILED" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    
    Write-Host "Please check the error messages above." -ForegroundColor White
    Write-Host "See MIGRATION_GUIDE.md for troubleshooting.`n" -ForegroundColor White
    exit 1
}

# Clean up environment variable
Remove-Item Env:\NEW_SUPABASE_SERVICE_KEY
