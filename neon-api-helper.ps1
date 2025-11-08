# Neon API Helper Script
# This script provides helper functions for interacting with Neon Database REST API

# Load environment variables
if (Test-Path .env.local) {
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$NEON_API_KEY = $env:NEON_API_KEY
$NEON_ENDPOINT = $env:NEON_ENDPOINT

if (-not $NEON_API_KEY) {
    Write-Host "Error: NEON_API_KEY not found in environment" -ForegroundColor Red
    Write-Host "Please set it in .env.local file" -ForegroundColor Yellow
    exit 1
}

if (-not $NEON_ENDPOINT) {
    Write-Host "Error: NEON_ENDPOINT not found in environment" -ForegroundColor Red
    exit 1
}

# Function to execute SQL query on Neon
function Invoke-NeonQuery {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Query
    )
    
    $uri = "$NEON_ENDPOINT/sql"
    $headers = @{
        "Authorization" = "Bearer $NEON_API_KEY"
        "Content-Type" = "application/json"
    }
    $body = @{
        query = $Query
    } | ConvertTo-Json -Depth 10
    
    try {
        Write-Host "Executing query..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
        return $response
    }
    catch {
        Write-Host "Error executing query: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        }
        throw
    }
}

# Function to test connection
function Test-NeonConnection {
    Write-Host "Testing Neon API connection..." -ForegroundColor Cyan
    try {
        $result = Invoke-NeonQuery -Query "SELECT 1 as test"
        Write-Host "[OK] Connection successful!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[FAIL] Connection failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Export functions
Export-ModuleMember -Function Invoke-NeonQuery, Test-NeonConnection

# If script is run directly, test connection
if ($MyInvocation.InvocationName -ne '.') {
    Write-Host "Neon API Helper Script" -ForegroundColor Cyan
    Write-Host "=======================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "API Endpoint: $NEON_ENDPOINT" -ForegroundColor White
    $keyPreview = $NEON_API_KEY.Substring(0, [Math]::Min(20, $NEON_API_KEY.Length))
    Write-Host "API Key: $keyPreview (truncated)" -ForegroundColor White
    Write-Host ""
    
    Test-NeonConnection
}
