$SUPABASE_URL = "https://tvqyozyjqcswojsbduzw.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cXlvenlqcWNzd29qc2JkdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDU2MjIsImV4cCI6MjA0ODQ4MTYyMn0.f3pTfJsm94Rj0CDLSmKvmP-s30CQ0LQh7s5s1dopvwI"
$EMAIL = "james@ekaty.com"

Write-Host "Testing Resend Email to: $EMAIL" -ForegroundColor Cyan

$welcomeBody = @{
    type = "welcome"
    to = $EMAIL
    firstName = "James"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/functions/v1/send-email" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $SUPABASE_ANON_KEY"
            "Content-Type" = "application/json"
            "apikey" = "$SUPABASE_ANON_KEY"
        } `
        -Body $welcomeBody `
        -ErrorAction Stop

    Write-Host "SUCCESS: Welcome email sent!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "ERROR: Failed to send email" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response: $errorBody" -ForegroundColor Red
    }
}
