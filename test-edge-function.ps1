# Test Supabase Edge Function directly
# This script tests the send-contact-email Edge Function

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Supabase Edge Function" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$supabaseUrl = "https://tvqyozyjqcswojsbduzw.supabase.co"
$supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cXlvenlqcWNzd29qc2JkdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzIyMzUsImV4cCI6MjA2MzEwODIzNX0.MJl1EtbDCjzT5PvBxoA7j4_4iM_FtX_1IjcDexcwz9Y"

Write-Host "Supabase URL: $supabaseUrl" -ForegroundColor Yellow
Write-Host "Testing Edge Function: send-contact-email" -ForegroundColor Yellow
Write-Host ""

$testData = @{
    name = "Test User - PowerShell"
    email = "james@ekaty.com"
    phone = "713-444-6732"
    message = "This is a test message to verify the Resend email integration is working correctly."
    source = "website"
    userAgent = "PowerShell-Test/1.0"
    referrer = "test"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $supabaseAnonKey"
    "apikey" = $supabaseAnonKey
}

Write-Host "Sending test request..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$supabaseUrl/functions/v1/send-contact-email" `
        -Method Post `
        -Headers $headers `
        -Body $testData `
        -ErrorAction Stop
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response Body:" -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor White
    
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            Write-Host ""
            Write-Host "Response Body:" -ForegroundColor Red
            Write-Host $responseBody -ForegroundColor Yellow
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Red
        }
    }
    
    if ($_.ErrorDetails) {
        Write-Host ""
        Write-Host "Error Details:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
