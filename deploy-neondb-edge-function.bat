@echo off
REM NeonDB Edge Function Deployment Script (Windows)
REM This script deploys the updated contact form edge function that uses NeonDB

echo ===========================================
echo NeonDB Edge Function Deployment
echo ===========================================
echo.

REM Step 1: Check Supabase login
echo Step 1: Checking Supabase login...
npx supabase projects list >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Not logged in to Supabase. Please run: npx supabase login
    exit /b 1
)
echo [OK] Logged in to Supabase
echo.

REM Step 2: Backup original function
echo Step 2: Backing up original edge function...
if exist "supabase\functions\send-contact-email\index.ts" (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
    copy "supabase\functions\send-contact-email\index.ts" "supabase\functions\send-contact-email\index-backup-%mydate%-%mytime%.ts" >nul
    echo [OK] Backup created
) else (
    echo [WARNING] No existing function found to backup
)
echo.

REM Step 3: Replace with NeonDB version
echo Step 3: Replacing with NeonDB version...
if exist "supabase\functions\send-contact-email\index-neondb.ts" (
    copy /Y "supabase\functions\send-contact-email\index-neondb.ts" "supabase\functions\send-contact-email\index.ts" >nul
    echo [OK] Function updated to use NeonDB
) else (
    echo [ERROR] NeonDB version not found (index-neondb.ts)
    exit /b 1
)
echo.

REM Step 4: Set environment variables
echo Step 4: Setting environment variables...
echo Setting NEON_DATABASE_URL...
npx supabase secrets set NEON_DATABASE_URL="postgresql://neondb_owner:npg_1GEjV8oCAUNZ@ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" --project-ref tvqyozyjqcswojsbduzw

echo.
echo Do you have a Resend API key to set? (Y/N)
set /p resend_response=
if /i "%resend_response%"=="Y" (
    set /p resend_key="Enter your Resend API key: "
    npx supabase secrets set RESEND_API_KEY="%resend_key%" --project-ref tvqyozyjqcswojsbduzw
    echo [OK] Resend API key set
) else (
    echo [WARNING] Skipping Resend API key (emails will not be sent)
)
echo.

REM Step 5: Deploy function
echo Step 5: Deploying edge function...
npx supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw

if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed
    exit /b 1
)
echo [OK] Edge function deployed successfully
echo.

REM Step 6: Test function
echo Step 6: Testing edge function...
echo Would you like to test the function now? (Y/N)
set /p test_response=

if /i "%test_response%"=="Y" (
    echo Testing contact form submission...
    curl -X POST "https://tvqyozyjqcswojsbduzw.supabase.co/functions/v1/send-contact-email" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cXlvenlqcWNzd29qc2JkdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDU2MjIsImV4cCI6MjA0ODQ4MTYyMn0.f3pTfJsm94Rj0CDLSmKvmP-s30CQ0LQh7s5s1dopvwI" -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"message\":\"Testing NeonDB integration from deployment script\",\"source\":\"deployment-test\"}"
    echo.
    echo.
)

REM Summary
echo ===========================================
echo [SUCCESS] Deployment Complete!
echo ===========================================
echo.
echo Next steps:
echo 1. Test the contact form on your website
echo 2. Check submissions in NeonDB
echo 3. Monitor function logs: npx supabase functions logs send-contact-email --project-ref tvqyozyjqcswojsbduzw
echo.
echo [WARNING] SECURITY REMINDER: Rotate database credentials after this session
echo.
pause
