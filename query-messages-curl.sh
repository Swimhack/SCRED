#!/bin/bash

# CLI script to query developer messages using curl and Supabase REST API
# Usage: ./query-messages-curl.sh

SUPABASE_URL="https://tvqyozyjqcswojsbduzw.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cXlvenlqcWNzd29qc2JkdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzIyMzUsImV4cCI6MjA2MzEwODIzNX0.MJl1EtbDCjzT5PvBxoA7j4_4iM_FtX_1IjcDexcwz9Y"

echo "🚀 StreetCredRx Message Query Tool (curl version)"
echo ""

echo "🔗 Testing Supabase connection..."

# Test connection by getting message count
response=$(curl -s \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: count=exact" \
  "$SUPABASE_URL/rest/v1/developer_messages?select=*&limit=1")

if [[ $? -ne 0 ]]; then
  echo "❌ Connection failed"
  exit 1
fi

echo "✅ Connection successful!"
echo ""

echo "🔍 Querying latest developer messages..."
echo ""

# Query latest messages with ordering
messages=$(curl -s \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/developer_messages?select=*&order=created_at.desc&limit=10")

if [[ $? -ne 0 ]]; then
  echo "❌ Query failed"
  exit 1
fi

# Check if we got data
if [[ "$messages" == "[]" ]]; then
  echo "📭 No messages found in the database."
  echo ""
  echo "💡 This could be because:"
  echo "   • No messages have been created yet"
  echo "   • Row Level Security (RLS) is blocking access"
  echo "   • You need to authenticate as a user with appropriate permissions"
  exit 0
fi

# Pretty print the JSON response
echo "📨 Latest developer messages:"
echo ""
echo "$messages" | python3 -m json.tool 2>/dev/null || echo "$messages"

echo ""
echo "💡 Tips:"
echo "   • Messages may be protected by Row Level Security"
echo "   • You might need to authenticate first to see all data"
echo "   • Check the web app at https://streetcredrx1.lovable.app/messages for full access"
echo "   • Use 'jq' for better JSON formatting: curl ... | jq"