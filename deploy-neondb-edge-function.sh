#!/bin/bash

# NeonDB Edge Function Deployment Script
# This script deploys the updated contact form edge function that uses NeonDB

set -e  # Exit on error

echo "==========================================="
echo "NeonDB Edge Function Deployment"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if logged into Supabase
echo -e "${YELLOW}Step 1: Checking Supabase login...${NC}"
if ! npx supabase projects list &> /dev/null; then
    echo -e "${RED}Not logged in to Supabase. Please run: npx supabase login${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Logged in to Supabase${NC}"
echo ""

# Backup original function
echo -e "${YELLOW}Step 2: Backing up original edge function...${NC}"
if [ -f "supabase/functions/send-contact-email/index.ts" ]; then
    cp supabase/functions/send-contact-email/index.ts supabase/functions/send-contact-email/index-backup-$(date +%Y%m%d-%H%M%S).ts
    echo -e "${GREEN}✓ Backup created${NC}"
else
    echo -e "${YELLOW}⚠ No existing function found to backup${NC}"
fi
echo ""

# Replace with NeonDB version
echo -e "${YELLOW}Step 3: Replacing with NeonDB version...${NC}"
if [ -f "supabase/functions/send-contact-email/index-neondb.ts" ]; then
    cp supabase/functions/send-contact-email/index-neondb.ts supabase/functions/send-contact-email/index.ts
    echo -e "${GREEN}✓ Function updated to use NeonDB${NC}"
else
    echo -e "${RED}✗ NeonDB version not found (index-neondb.ts)${NC}"
    exit 1
fi
echo ""

# Set environment variables
echo -e "${YELLOW}Step 4: Setting environment variables...${NC}"
echo "Setting NEON_DATABASE_URL..."
npx supabase secrets set NEON_DATABASE_URL="postgresql://neondb_owner:npg_1GEjV8oCAUNZ@ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" --project-ref tvqyozyjqcswojsbduzw

echo ""
echo -e "${YELLOW}Do you have a Resend API key to set? (y/n)${NC}"
read -r response
if [[ "$response" == "y" || "$response" == "Y" ]]; then
    echo "Enter your Resend API key:"
    read -r resend_key
    npx supabase secrets set RESEND_API_KEY="$resend_key" --project-ref tvqyozyjqcswojsbduzw
    echo -e "${GREEN}✓ Resend API key set${NC}"
else
    echo -e "${YELLOW}⚠ Skipping Resend API key (emails will not be sent)${NC}"
fi
echo ""

# Deploy function
echo -e "${YELLOW}Step 5: Deploying edge function...${NC}"
npx supabase functions deploy send-contact-email --project-ref tvqyozyjqcswojsbduzw

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Edge function deployed successfully${NC}"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi
echo ""

# Test function
echo -e "${YELLOW}Step 6: Testing edge function...${NC}"
echo "Would you like to test the function now? (y/n)"
read -r test_response

if [[ "$test_response" == "y" || "$test_response" == "Y" ]]; then
    echo "Testing contact form submission..."
    curl -X POST \
      "https://tvqyozyjqcswojsbduzw.supabase.co/functions/v1/send-contact-email" \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cXlvenlqcWNzd29qc2JkdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDU2MjIsImV4cCI6MjA0ODQ4MTYyMn0.f3pTfJsm94Rj0CDLSmKvmP-s30CQ0LQh7s5s1dopvwI" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Test User",
        "email": "test@example.com",
        "message": "Testing NeonDB integration from deployment script",
        "source": "deployment-test"
      }'
    echo ""
    echo ""
fi

# Summary
echo "==========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "==========================================="
echo ""
echo "Next steps:"
echo "1. Test the contact form on your website"
echo "2. Check submissions in NeonDB"
echo "3. Monitor function logs: npx supabase functions logs send-contact-email --project-ref tvqyozyjqcswojsbduzw"
echo ""
echo "⚠️  SECURITY REMINDER: Rotate database credentials after this session"
echo ""
