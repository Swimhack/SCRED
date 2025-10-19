# Open Resend Domains Dashboard
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   ADD CUSTOM DOMAIN TO RESEND" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Opening Resend Domains dashboard..." -ForegroundColor Yellow
Start-Process "https://resend.com/domains"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Add Domain" -ForegroundColor Yellow
Write-Host "  1. Click 'Add Domain' button" -ForegroundColor White
Write-Host "  2. Enter: " -NoNewline -ForegroundColor White
Write-Host "streetcredrx.com" -ForegroundColor Cyan
Write-Host "  3. Click 'Add'" -ForegroundColor White
Write-Host ""

Write-Host "Step 2: Get DNS Records" -ForegroundColor Yellow
Write-Host "  Resend will provide DNS records:" -ForegroundColor White
Write-Host "  - 1 SPF record (TXT)" -ForegroundColor White
Write-Host "  - 3 DKIM records (CNAME)" -ForegroundColor White
Write-Host "  - 1 DMARC record (optional)" -ForegroundColor White
Write-Host ""

Write-Host "Step 3: Add to Your DNS Provider" -ForegroundColor Yellow
Write-Host "  Go to where streetcredrx.com DNS is hosted" -ForegroundColor White
Write-Host "  (GoDaddy, Namecheap, Cloudflare, etc.)" -ForegroundColor White
Write-Host "  Add all the records Resend provides" -ForegroundColor White
Write-Host ""

Write-Host "Step 4: Wait for Verification" -ForegroundColor Yellow
Write-Host "  Usually 5-15 minutes" -ForegroundColor White
Write-Host "  Resend will show green checkmark when ready" -ForegroundColor Green
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   AFTER VERIFICATION" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Let me know when the domain shows as 'Verified' in Resend," -ForegroundColor Yellow
Write-Host "and I'll update the Edge Function to use it!" -ForegroundColor Yellow
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Full guide available in: ADD_CUSTOM_DOMAIN_RESEND.md" -ForegroundColor Green
Write-Host ""
