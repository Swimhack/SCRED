#!/bin/bash

# Test script for the new API endpoint
echo "🚀 Testing StreetCredRx Messages API"
echo ""

# Test without API key (should fail)
echo "🔒 Testing without API key (should fail):"
curl -s "https://streetcredrx.netlify.app/api/messages" | head -3
echo ""
echo ""

# Test with wrong API key (should fail)
echo "🔒 Testing with wrong API key (should fail):"
curl -s "https://streetcredrx.netlify.app/api/messages?key=wrong-key" | head -3
echo ""
echo ""

# Test with correct API key (should work)
echo "✅ Testing with correct API key (should work):"
curl -s "https://streetcredrx.netlify.app/api/messages?key=streetcred-api-2025" | head -10
echo ""
echo ""

echo "💡 Full endpoint for LLM/CLI access:"
echo "https://streetcredrx.netlify.app/api/messages?key=streetcred-api-2025"