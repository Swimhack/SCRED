@echo off
REM Setup Netlify Environment Variables for Neon + Resend
echo ============================================
echo Netlify Environment Variables Setup
echo ============================================
echo.

echo This script will set up environment variables in Netlify for:
echo - NEON_DATABASE_URL (Neon PostgreSQL connection)
echo - RESEND_API_KEY (Email delivery service)
echo.

REM Check if netlify CLI is available
netlify --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Netlify CLI not found. Please install it first:
    echo npm install -g netlify-cli
    exit /b 1
)

echo [OK] Netlify CLI found
echo.

REM Set NEON_DATABASE_URL
echo Setting NEON_DATABASE_URL...
netlify env:set NEON_DATABASE_URL "postgresql://neondb_owner:npg_1GEjV8oCAUNZ@ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

if %errorlevel% neq 0 (
    echo [ERROR] Failed to set NEON_DATABASE_URL
    exit /b 1
)
echo [OK] NEON_DATABASE_URL set
echo.

REM Set RESEND_API_KEY
echo.
echo Do you have a Resend API key? (Y/N)
set /p resend_response=
if /i "%resend_response%"=="Y" (
    set /p resend_key="Enter your Resend API key: "
    netlify env:set RESEND_API_KEY "%resend_key%"
    
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to set RESEND_API_KEY
        exit /b 1
    )
    echo [OK] RESEND_API_KEY set
) else (
    echo [WARNING] Skipping RESEND_API_KEY
    echo Get your API key from: https://resend.com/api-keys
    echo Then run: netlify env:set RESEND_API_KEY "your-key-here"
)
echo.

REM List all environment variables
echo ============================================
echo Current Environment Variables:
echo ============================================
netlify env:list

echo.
echo ============================================
echo [SUCCESS] Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Verify variables at: https://app.netlify.com/sites/scred/configuration/env
echo 2. Test contact form at: https://scred.netlify.app
echo 3. Check function logs: netlify functions:log send-contact-email
echo.
echo [SECURITY] Remember to rotate database credentials after setup!
echo.
pause
