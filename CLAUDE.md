# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Testing & Validation

Before deploying changes to production, validate your work using Playwright MCP:
- Run Playwright tests to ensure functionality works correctly
- Test critical user flows: authentication, form submissions, document uploads
- Verify responsive design across different screen sizes
- Check for console errors and network issues

## Deployment Process

This is a **LIVE PRODUCTION CLIENT WEBSITE** deployed at: `streetcredrxstreetcredrx.netlify.app`

**Deployment Flow:**
1. Push changes to the main Git repository
2. Netlify automatically deploys via continuous deployment
3. No manual deployment steps required - pushing to Git triggers deployment
4. Monitor deployment status in Netlify dashboard

**Critical:** Always validate changes thoroughly before pushing, as this goes directly to production.

## High-Level Architecture

### Tech Stack
- **Frontend**: React 18.3.1 + TypeScript + Vite
- **UI Components**: shadcn-ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Authentication**: Supabase Auth with JWT tokens
- **Forms**: React Hook Form + Zod validation

### Core Application Structure

```
src/
├── components/           # Reusable React components
│   ├── ui/              # shadcn-ui components
│   └── user-management/ # User management components
├── hooks/               # Custom React hooks
├── integrations/supabase/ # Supabase client and types
├── layouts/             # Layout components (DashboardLayout)
├── lib/                 # Utility functions
├── pages/               # Route page components
└── services/            # Business logic services
```

### Authentication & Authorization

Role-based access control with multiple admin levels:
- `super_admin`: Full system access
- `admin_manager`: Regional management access  
- `admin_regional`: Regional view access
- Regular users: Personal credentials access

Protected routes use `ProtectedRoute` component with JWT-based authentication.

### Key Features

1. **Pharmacist Application Management**: Submit and track credential applications
2. **Document Management**: Upload/verify credentials with expiration tracking
3. **Messaging System**: Communication between admins and pharmacists with AI analysis
4. **Notification Engine**: Email/SMS notifications for expiring credentials
5. **User Management**: Admin tools for managing users and permissions
6. **Audit Logging**: Comprehensive logging system with external API access

### Important Routes
- `/` - Public landing page
- `/auth` - Authentication
- `/dashboard` - Main dashboard (protected)
- `/pharmacist-form` - Application submission
- `/pharmacists` - Admin view of all pharmacists
- `/pending`, `/completed`, `/expiring` - Admin application views
- `/messages` - Messaging system (admin)
- `/user-management` - User administration (super admin)
- `/logs` - System logs viewer (super admin)

### Database Schema (Supabase)
- `pharmacist_applications` - Application records
- `application_documents` - Uploaded documents
- `developer_messages` - Message threads
- `ai_analysis` - AI-generated message analysis
- `app_logs` - System audit logs
- `notification_preferences` - User notification settings
- `user_invitations` - User invitation system

### Edge Functions
Located in `supabase/functions/`:
- `analyze-message-with-ai` - AI-powered message analysis
- `get-logs` - Secure log retrieval API
- `process-message-notifications` - Message notification handler
- `process-notification-engine` - Credential expiration notifications
- `send-email` - Email delivery service
- `send-sms-verification` - SMS verification
- `sync-user-emails` - Email synchronization

### Security Features
- JWT authentication with role-based access
- Row Level Security (RLS) policies in Supabase
- Secure file upload with verification
- Sanitized error logging
- OWASP-compliant security practices

### Logging System
- Comprehensive logging with structured JSON format
- Multiple log levels: debug, info, warn, error, fatal
- Automatic context capture (user ID, session, route)
- External API access for monitoring tools
- 30-day retention policy

### Entry Points
- **Application Entry**: `/src/main.tsx`
- **App Component**: `/src/App.tsx` - Providers, routing, authentication
- **Dashboard Layout**: `/src/layouts/DashboardLayout.tsx`
- **Supabase Client**: `/src/integrations/supabase/client.ts`

## Additional Resources

**JARVIS Documentation Location**: `C:\Users\james\Desktop\RANDOM\AI\JARVIS\DOCS`

## Code Standards

- Use TypeScript throughout for type safety
- Follow single responsibility principle for components
- Utilize custom hooks for shared logic
- Consistent use of shadcn-ui components
- React Query for server state management
- Maintain existing code patterns and conventions