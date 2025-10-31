#!/bin/bash
# Script to update Supabase email from name
# This uses the Supabase Management API

set -e

PROJECT_REF="tvqyozyjqcswojsbduzw"
FROM_NAME="StreetCredRX"
FROM_EMAIL="noreply@streetcredrx.com"

# Check if access token is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ Error: SUPABASE_ACCESS_TOKEN environment variable is required"
  echo ""
  echo "To get your access token:"
  echo "1. Go to: https://supabase.com/dashboard/account/tokens"
  echo "2. Create a new access token"
  echo "3. Export it: export SUPABASE_ACCESS_TOKEN=your_token"
  exit 1
fi

echo "🔄 Updating Supabase email from name..."

# Update auth config via Management API
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
  "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"mailer_from_name\": \"${FROM_NAME}\",
    \"mailer_from_email\": \"${FROM_EMAIL}\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 204 ]; then
  echo "✅ Email from name updated successfully!"
  echo ""
  echo "📧 Email Settings:"
  echo "   From Name: ${FROM_NAME}"
  echo "   From Email: ${FROM_EMAIL}"
  echo ""
  echo "✨ All authentication emails will now show '${FROM_NAME}' as the sender name!"
else
  echo "❌ Error updating email settings: HTTP ${HTTP_CODE}"
  echo "Response: ${BODY}"
  echo ""
  echo "💡 Alternative: Update via Supabase Dashboard:"
  echo "   1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/auth/templates"
  echo "   2. Click 'Settings' tab"
  echo "   3. Set 'From Name' to: ${FROM_NAME}"
  echo "   4. Set 'From Email' to: ${FROM_EMAIL}"
  exit 1
fi

