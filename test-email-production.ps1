# Test Email Functionality on Production
# Tests all email features of streetcredrx1.fly.dev

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "StreetCredRx Email Testing Suite" -ForegroundColor Cyan
Write-Host "Testing: https://streetcredrx1.fly.dev" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get Supabase configuration
Write-Host "Reading Supabase configuration..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
if (!$envContent) {
    Write-Host "Error: .env file not found. Please create it with your Supabase credentials." -ForegroundColor Red
    exit 1
}

$supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL=(.+)").Matches.Groups[1].Value
$supabaseAnonKey = ($envContent | Select-String "VITE_SUPABASE_ANON_KEY=(.+)").Matches.Groups[1].Value

if (!$supabaseUrl -or !$supabaseAnonKey) {
    Write-Host "Error: Could not find VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Supabase URL: $supabaseUrl" -ForegroundColor Green
Write-Host "✓ Anon Key: $($supabaseAnonKey.Substring(0, 20))..." -ForegroundColor Green
Write-Host ""

# Test 1: Contact Form Submission
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 1: Contact Form Email" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$contactFormData = @{
    name = "Test User - Production"
    email = "james@ekaty.com"
    phone = "713-444-6732"
    message = "This is a test message from the production deployment verification script. Testing email functionality on streetcredrx1.fly.dev."
    source = "website"
    userAgent = "PowerShell-Test-Script/1.0"
    referrer = "https://streetcredrx1.fly.dev/contact"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $supabaseAnonKey"
    "apikey" = $supabaseAnonKey
}

try {
    Write-Host "Sending contact form test..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/send-contact-email" `
        -Method Post `
        -Headers $headers `
        -Body $contactFormData `
        -ErrorAction Stop
    
    Write-Host "✓ SUCCESS: Contact form email sent!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED: Contact form email" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 2: Investor Inquiry Email
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 2: Investor Inquiry Email" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$investorFormData = @{
    name = "Test Investor - Production"
    email = "james@ekaty.com"
    phone = "713-444-6732"
    message = "This is a test investor inquiry from the production deployment. Testing the investor-specific email template."
    source = "investor-homepage"
    userAgent = "PowerShell-Test-Script/1.0"
    referrer = "https://streetcredrx1.fly.dev/"
} | ConvertTo-Json

try {
    Write-Host "Sending investor inquiry test..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/send-contact-email" `
        -Method Post `
        -Headers $headers `
        -Body $investorFormData `
        -ErrorAction Stop
    
    Write-Host "✓ SUCCESS: Investor inquiry email sent!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED: Investor inquiry email" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 3: Welcome Email
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 3: Welcome Email" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$welcomeEmailData = @{
    type = "welcome"
    toEmail = "james@ekaty.com"
    userName = "Test User"
} | ConvertTo-Json

try {
    Write-Host "Sending welcome email test..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/send-email" `
        -Method Post `
        -Headers $headers `
        -Body $welcomeEmailData `
        -ErrorAction Stop
    
    Write-Host "✓ SUCCESS: Welcome email sent!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED: Welcome email" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 4: Password Reset Email
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 4: Password Reset Email" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$resetEmailData = @{
    type = "password-reset"
    toEmail = "james@ekaty.com"
    resetLink = "https://streetcredrx1.fly.dev/reset-password?token=test-token-123"
} | ConvertTo-Json

try {
    Write-Host "Sending password reset email test..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/send-email" `
        -Method Post `
        -Headers $headers `
        -Body $resetEmailData `
        -ErrorAction Stop
    
    Write-Host "✓ SUCCESS: Password reset email sent!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED: Password reset email" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 5: Invitation Email
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 5: User Invitation Email" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$inviteEmailData = @{
    type = "invitation"
    toEmail = "james@ekaty.com"
    inviterName = "Admin User"
    inviteLink = "https://streetcredrx1.fly.dev/signup?invite=test-invite-123"
} | ConvertTo-Json

try {
    Write-Host "Sending invitation email test..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/send-email" `
        -Method Post `
        -Headers $headers `
        -Body $inviteEmailData `
        -ErrorAction Stop
    
    Write-Host "✓ SUCCESS: Invitation email sent!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED: Invitation email" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Suite Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Check your email (james@ekaty.com) for the test emails" -ForegroundColor White
Write-Host "2. Visit https://resend.com/emails to see delivery status" -ForegroundColor White
Write-Host "3. Check Supabase logs: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions" -ForegroundColor White
Write-Host "`n"



