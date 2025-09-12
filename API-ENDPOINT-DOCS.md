# StreetCredRx Developer Messages API

## Live API Endpoint

**URL:** `https://streetcredrx.netlify.app/api/messages?key=streetcred-api-2025`

## Overview

This endpoint exposes the developer messages from the StreetCredRx Supabase database as JSON for CLI and LLM access.

## Authentication

The endpoint requires a simple API key for security:
- **API Key:** `streetcred-api-2025`
- **Usage:** Add as query parameter: `?key=streetcred-api-2025`

## Response Format

```json
{
  "success": true,
  "timestamp": "2025-07-25T12:00:00.000Z",
  "count": 10,
  "error": null,
  "data": [
    {
      "id": "uuid",
      "message": "Message content",
      "sender_type": "admin|developer",
      "recipient_type": "admin|developer|all",
      "category": "bug_report|feature_request|question|approval_needed|update",
      "priority": "urgent|high|normal|low",
      "status": "sent|delivered|read",
      "thread_id": "uuid|null",
      "created_at": "2025-07-25T12:00:00.000Z",
      "updated_at": "2025-07-25T12:00:00.000Z",
      "metadata": {},
      "ai_analysis": [
        {
          "analysis_type": "bug_report|question|feature_request|general",
          "generated_prompt": "AI-generated Lovable prompt for developers",
          "suggested_response": "AI-suggested response",
          "confidence_score": 0.95,
          "developer_approved": true|false|null,
          "created_at": "2025-07-25T12:00:00.000Z"
        }
      ]
    }
  ]
}
```

## Message Categories

- 🐛 **bug_report**: Issues, problems, broken features, errors
- ✨ **feature_request**: New functionality requests, improvements, enhancements  
- ❓ **question**: Requests for information, clarification, how-to queries
- ✅ **approval_needed**: Items requiring administrative approval
- 💬 **update**: General communication, status reports, progress updates

## Priority Levels

- 🔴 **urgent**: Critical issues requiring immediate attention
- 🟠 **high**: Important but not critical
- 🔵 **normal**: Standard priority
- ⚫ **low**: Non-urgent items

## CLI Usage Examples

### Using curl
```bash
curl "https://streetcredrx.netlify.app/api/messages?key=streetcred-api-2025"
```

### Using curl with jq for pretty JSON
```bash
curl -s "https://streetcredrx.netlify.app/api/messages?key=streetcred-api-2025" | jq
```

### Get latest message only
```bash
curl -s "https://streetcredrx.netlify.app/api/messages?key=streetcred-api-2025" | jq '.data[0]'
```

### Count messages
```bash
curl -s "https://streetcredrx.netlify.app/api/messages?key=streetcred-api-2025" | jq '.count'
```

### Filter by category (client-side)
```bash
curl -s "https://streetcredrx.netlify.app/api/messages?key=streetcred-api-2025" | jq '.data[] | select(.category == "bug_report")'
```

## Security Features

- **API Key Required**: Prevents unauthorized access
- **Row Level Security**: Still respects Supabase RLS policies
- **Error Handling**: Graceful error responses
- **Rate Limiting**: Inherits Netlify's built-in protections

## Error Responses

### Missing API Key
```json
{
  "success": false,
  "timestamp": "2025-07-25T12:00:00.000Z",
  "count": 0,
  "error": "Invalid or missing API key. Use ?key=streetcred-api-2025",
  "data": []
}
```

### Database Error
```json
{
  "success": false,
  "timestamp": "2025-07-25T12:00:00.000Z",
  "count": 0,
  "error": "Database connection failed",
  "data": []
}
```

## Testing

Run the test script to verify the endpoint:
```bash
./test-api.sh
```

## Integration Notes

- **Automatic Updates**: Data refreshes automatically from Supabase
- **Real-time**: Shows latest messages up to 50 entries
- **AI Analysis**: Includes AI-generated prompts and suggestions when available
- **Thread Support**: Maintains conversation threading information
- **Metadata**: Preserves additional message context

## Security Considerations

- Change the API key (`streetcred-api-2025`) for production use
- Consider implementing IP whitelisting for additional security
- Monitor usage to prevent abuse
- The endpoint respects existing database security policies

## Deployment

The endpoint is deployed automatically with your Netlify deployment:
1. Push changes to Git repository
2. Netlify automatically builds and deploys
3. Endpoint becomes available immediately

**Status:** ✅ Ready for CLI and LLM access