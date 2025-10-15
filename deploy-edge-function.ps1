# Deploy Edge Function to Supabase
# This script helps deploy the send-contact-email function

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy Edge Function to Supabase" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if token is provided
$token = Read-Host "Please enter your Supabase Access Token (or press Enter to get instructions)"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host ""
    Write-Host "To get your Supabase Access Token:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://supabase.com/dashboard/account/tokens" -ForegroundColor White
    Write-Host "2. Click 'Generate New Token'" -ForegroundColor White
    Write-Host "3. Give it a name like 'CLI Access'" -ForegroundColor White
    Write-Host "4. Copy the token" -ForegroundColor White
    Write-Host "5. Run this script again and paste the token" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Enter to open the token page in your browser..." -ForegroundColor Yellow
    Read-Host
    Start-Process "https://supabase.com/dashboard/account/tokens"
    exit
}

Write-Host "Deploying Edge Function..." -ForegroundColor Yellow
Write-Host ""

try {
    # Deploy the function
    $result = npx supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw --token $token 2>&1
    
    Write-Host $result -ForegroundColor Green
    Write-Host ""
    Write-Host "SUCCESS! Edge Function deployed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now let's test it..." -ForegroundColor Yellow
    
    # Run the test script
    & ".\test-edge-function.ps1"
    
} catch {
    Write-Host "FAILED to deploy!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. Your access token is valid" -ForegroundColor White
    Write-Host "2. You have permission to deploy functions" -ForegroundColor White
    Write-Host "3. The project reference is correct: tvqyozyjqcswojsbduzw" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Script Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""



