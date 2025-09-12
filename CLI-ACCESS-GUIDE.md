# CLI Access Guide for Developer Messages

## Overview

I've created CLI tools to access the developer messages from the StreetCredRx application at `https://streetcredrx1.lovable.app/messages`.

## Available Tools

### 1. Curl-based Script (Recommended)
**File:** `query-messages-curl.sh`
```bash
chmod +x query-messages-curl.sh
./query-messages-curl.sh
```

### 2. Node.js Script  
**File:** `query-messages.cjs`
```bash
# Requires npm install first
npm install
node query-messages.cjs
```

## Current Status

✅ **Connection successful** - Can connect to Supabase database  
❌ **No messages visible** - Due to Row Level Security (RLS) policies

## Supabase Configuration Found

- **URL:** `https://tvqyozyjqcswojsbduzw.supabase.co`
- **Database:** PostgreSQL with RLS enabled
- **Tables:** `developer_messages`, `ai_analysis`, `notification_logs`

## Why No Messages Are Visible

The database uses **Row Level Security (RLS)** policies that restrict access to messages based on user authentication and roles. The anonymous (public) API key can only access data that users are explicitly permitted to see.

## Solutions to Access Messages

### Option 1: Web Application Access
Visit `https://streetcredrx1.lovable.app/messages` and:
1. Log in as an admin user
2. Navigate to the Messages section
3. View messages through the web interface

### Option 2: Authenticated CLI Access
To access via CLI, you would need:

1. **Service Role Key** (not public anon key)
2. **User Authentication Token** from a logged-in admin
3. **Database Admin Access** to temporarily disable RLS

### Option 3: Direct Database Access
If you have database admin credentials:
```sql
-- Connect to PostgreSQL directly
-- Temporarily disable RLS for testing
SET row_security = off;
SELECT * FROM developer_messages ORDER BY created_at DESC LIMIT 10;
```

## Security Note

The current setup is **secure by design** - the RLS policies prevent unauthorized access to sensitive message data, which is appropriate for a production application.

## Next Steps

To access the actual messages, you'll need to either:
1. Use the web application with proper authentication
2. Obtain service role credentials for CLI access
3. Get database admin access to bypass RLS temporarily

The CLI tools are ready to use once proper authentication is established.