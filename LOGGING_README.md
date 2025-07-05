# Application Logging System

A comprehensive, secure logging system for React applications with Supabase backend.

## Features

✅ **Structured JSON Logging** - Consistent, queryable log format  
✅ **Multiple Log Levels** - debug, info, warn, error, fatal  
✅ **Secure API Access** - JWT authentication with role-based access  
✅ **External Agent Support** - URL endpoint for AI agents and monitoring tools  
✅ **Advanced Filtering** - By date, level, component, user, search terms  
✅ **Automatic Context** - User ID, session ID, route, timestamp capture  
✅ **Security Compliant** - Follows OWASP logging best practices  
✅ **Auto-cleanup** - Configurable log retention (default: 30 days)  

## Quick Start

### 1. Basic Logging Usage

```typescript
import { logger } from '@/services/logger';

// Simple logging
logger.info('User logged in', { userId: '123' }, 'Auth');
logger.error('API call failed', error, { endpoint: '/api/users' }, 'API');

// User actions
logger.logUserAction('profile_updated', { field: 'email' });

// API calls  
logger.logApiCall('POST', '/api/users', 201, 150);

// Navigation
logger.logNavigation('/dashboard', '/profile');
```

### 2. React Hook Usage

```typescript
import { useLogger } from '@/services/logger';

const MyComponent = () => {
  const logger = useLogger();
  
  const handleSubmit = () => {
    logger.info('Form submitted', { formType: 'contact' }, 'ContactForm');
  };
};
```

## API Access for External Agents

### Endpoint
```
GET https://tvqyozyjqcswojsbduzw.supabase.co/functions/v1/get-logs
```

### Authentication
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "https://tvqyozyjqcswojsbduzw.supabase.co/functions/v1/get-logs?level=error&limit=50"
```

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `level` | string | Filter by log level | `error`, `warn`, `info` |
| `component` | string | Filter by component | `Auth`, `API`, `Dashboard` |  
| `user_id` | string | Filter by user ID | `uuid-string` |
| `start_date` | string | Start date (ISO) | `2024-01-01T00:00:00Z` |
| `end_date` | string | End date (ISO) | `2024-01-31T23:59:59Z` |
| `search` | string | Search in messages | `login`, `error` |
| `limit` | number | Results per page | `50` (max: 1000) |
| `offset` | number | Pagination offset | `0` |

### Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "timestamp": "2024-01-15T10:30:00Z",
      "level": "error", 
      "message": "API call failed",
      "metadata": {
        "endpoint": "/api/users",
        "status": 500,
        "duration_ms": 1500
      },
      "user_id": "user-uuid",
      "session_id": "session-123",
      "component": "API",
      "route": "/dashboard",
      "error_stack": "Error stack trace..."
    }
  ],
  "pagination": {
    "total": 1250,
    "limit": 50,
    "offset": 0,
    "has_more": true
  },
  "filters": { /* applied filters */ },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Access Control

- **Admin Role Required**: Only users with `role_id = 4` can access logs
- **JWT Authentication**: All requests must include valid Bearer token
- **RLS Policies**: Database-level security prevents unauthorized access
- **Rate Limiting**: Built-in protection against abuse

## Web Interface

Visit `/logs` in your application (admin access required) to:
- View logs with advanced filtering
- Generate API URLs for external tools
- Monitor application health and errors
- Export log data

## Security Features

### Data Protection
- Sensitive data automatically filtered from logs
- Error stacks sanitized for production
- IP addresses and user agents logged for security analysis
- Session tracking for audit trails

### Access Controls  
- Role-based access (admin-only)
- JWT token validation
- Database-level Row Level Security (RLS)
- Automatic log cleanup after 30 days

### Compliance
- Follows OWASP Security Logging guidelines
- Structured logging for audit compliance
- Configurable retention policies
- No logging of passwords or sensitive PII

## Advanced Usage

### Custom Log Levels
```typescript
logger.debug('Debugging info', { variable: value });
logger.fatal('Critical system failure', error, { context: 'startup' });
```

### Metadata and Context
```typescript
logger.info('User action', {
  action: 'file_upload',
  fileSize: 1024000,
  fileType: 'pdf',
  timestamp: Date.now()
}, 'FileUpload');
```

### Error Logging with Stack Traces
```typescript
try {
  // risky operation
} catch (error) {
  logger.error('Operation failed', error, {
    operation: 'data_processing',
    input: sanitizedInput
  }, 'DataProcessor');
}
```

## Monitoring and Alerts

The logging system supports integration with monitoring tools:

1. **Direct API Access** - External monitoring tools can query logs
2. **Webhook Support** - Can be extended for real-time alerts  
3. **Metrics Export** - Structured data for analytics platforms
4. **Error Aggregation** - Automated error grouping and reporting

## Best Practices

1. **Log Levels**:
   - `debug`: Development debugging info
   - `info`: General application events  
   - `warn`: Potential issues that don't break functionality
   - `error`: Errors that affect features but don't crash the app
   - `fatal`: Critical errors that crash or severely impact the system

2. **Message Format**:
   - Use clear, actionable messages
   - Include relevant context in metadata
   - Don't log sensitive information (passwords, tokens, PII)

3. **Performance**:
   - Logging is non-blocking (fire-and-forget)
   - Database writes are optimized with indexes
   - Automatic cleanup prevents database bloat

4. **Security**:
   - Always validate and sanitize log data
   - Use structured metadata instead of string interpolation
   - Regularly review and rotate access tokens

## Troubleshooting

### Common Issues

**Logs not appearing**: Check that the user has admin role and valid JWT token

**Performance issues**: Ensure log retention cleanup is running regularly

**Authentication errors**: Verify JWT token is valid and user has correct permissions

### Support

For issues or questions about the logging system:
1. Check the browser console for client-side errors
2. Review the edge function logs in Supabase dashboard
3. Verify database permissions and RLS policies
4. Test API endpoints with curl or Postman

---

*This logging system follows security best practices and provides production-ready monitoring capabilities for React applications.*