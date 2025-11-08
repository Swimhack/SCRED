# Run Neon Database Migration Script
# This script executes SQL queries from the migration file using the Neon API

param(
    [Parameter(Mandatory=$false)]
    [string]$MigrationFile = "neondb-schema-migration.md"
)

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

if (-not (Test-Path $MigrationFile)) {
    Write-Host "Error: Migration file not found: $MigrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Neon Database Migration Runner" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Migration File: $MigrationFile" -ForegroundColor White
Write-Host "API Endpoint: $NEON_ENDPOINT" -ForegroundColor White
Write-Host ""

# Source the helper script
. .\neon-api-helper.ps1

# Test connection first
if (-not (Test-NeonConnection)) {
    Write-Host "Cannot proceed without a valid connection" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Reading migration file..." -ForegroundColor Cyan

# Read the migration file and extract SQL queries
$content = Get-Content $MigrationFile -Raw
$queries = @()

# Extract SQL queries from code blocks
$pattern = '```(?:bash|sql|ps1)?\s*\n(.*?)\n```'
$matches = [regex]::Matches($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)

foreach ($match in $matches) {
    $code = $match.Groups[1].Value
    
    # Extract SQL from curl commands or direct SQL blocks
    if ($code -match '-d\s+[''"]\{.*?"query"\s*:\s*["''](.*?)["'']') {
        $sql = $matches[1]
        $sql = $sql -replace '\\n', "`n"
        $sql = $sql -replace '\\t', "`t"
        $queries += $sql
    }
    elseif ($code -match 'SELECT|CREATE|INSERT|UPDATE|DELETE|ALTER|DROP') {
        # Direct SQL query
        $queries += $code.Trim()
    }
}

if ($queries.Count -eq 0) {
    Write-Host "No SQL queries found in migration file" -ForegroundColor Yellow
    Write-Host "Please check the file format" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found $($queries.Count) SQL queries" -ForegroundColor Green
Write-Host ""
Write-Host "WARNING: This will execute queries on your Neon database!" -ForegroundColor Yellow
$confirm = Read-Host "Do you want to proceed? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Migration cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Executing queries..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$errorCount = 0

for ($i = 0; $i -lt $queries.Count; $i++) {
    $query = $queries[$i]
    Write-Host "[$($i+1)/$($queries.Count)] Executing query..." -ForegroundColor Cyan
    
    try {
        $result = Invoke-NeonQuery -Query $query
        Write-Host "✓ Query $($i+1) executed successfully" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "✗ Query $($i+1) failed: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
        
        $continue = Read-Host "Continue with next query? (yes/no)"
        if ($continue -ne "yes") {
            Write-Host "Migration stopped by user" -ForegroundColor Yellow
            break
        }
    }
    
    Write-Host ""
}

Write-Host "Migration Summary" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host "Total: $($queries.Count)" -ForegroundColor White



