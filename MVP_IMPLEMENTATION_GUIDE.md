# MVP Implementation Guide

This guide shows how to implement the feature flag system to convert the enterprise StreetCredRx application into an MVP version.

## Quick Start

1. **Copy environment configuration:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure for MVP mode:**
   ```env
   NEXT_PUBLIC_ENTERPRISE_MODE=false
   NEXT_PUBLIC_DEVELOPER_MODE=true
   ```

3. **Import and use feature flags:**
   ```typescript
   import { featureFlags } from '@/lib/featureFlags';
   ```

## Implementation Examples

### 1. Conditional Route Rendering

**File: `src/App.tsx`**

```typescript
import { featureFlags, getAvailableRoutes } from '@/lib/featureFlags';

const AppContent = () => {
  const { userRole } = useAuth();
  const availableRoutes = getAvailableRoutes(userRole);

  return (
    <Routes>
      {/* Core routes - always available */}
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Enterprise messaging - conditional */}
      {featureFlags.messaging.realTimeMessaging && (
        <Route path="/messages" element={
          <ProtectedRoute allowedRoles={["super_admin", "admin_manager"]}>
            <DashboardLayout><Messages /></DashboardLayout>
          </ProtectedRoute>
        } />
      )}
      
      {/* User management - enterprise only */}
      {featureFlags.auth.userInvitationSystem && (
        <Route path="/user-management" element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <DashboardLayout><UserManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
      )}
    </Routes>
  );
};
```

### 2. Conditional Component Rendering

**File: `src/layouts/DashboardLayout.tsx`**

```typescript
import { featureFlags, shouldShowComponent } from '@/lib/featureFlags';

const DashboardLayout = ({ children }) => {
  const { userRole } = useAuth();

  return (
    <div className="dashboard-layout">
      <nav className="sidebar">
        {/* Core navigation - always shown */}
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/pharmacist-form">Apply</NavLink>
        
        {/* Enterprise features - conditional */}
        {featureFlags.messaging.realTimeMessaging && (
          <NavLink to="/messages">Messages</NavLink>
        )}
        
        {featureFlags.auth.userInvitationSystem && userRole === 'super_admin' && (
          <NavLink to="/user-management">User Management</NavLink>
        )}
        
        {shouldShowComponent('AnalyticsCharts') && (
          <NavLink to="/analytics">Analytics</NavLink>
        )}
      </nav>
      
      <main className="content">
        {children}
      </main>
    </div>
  );
};
```

### 3. Conditional Hook Functionality

**File: `src/hooks/useAuth.tsx` - Modified**

```typescript
import { featureFlags } from '@/lib/featureFlags';

export const useAuth = () => {
  // ... existing code ...

  const fetchUserProfile = async (userId: string) => {
    try {
      const query = supabase
        .from('profiles')
        .select(featureFlags.auth.multiTierRoles 
          ? '*, roles(name)' // Enterprise: fetch role relationship
          : '*'              // MVP: basic profile only
        )
        .eq('id', userId)
        .maybeSingle();
        
      const { data: profileData, error } = await query;
      
      if (profileData) {
        setProfile(profileData);
        // Set role based on enterprise mode
        if (featureFlags.auth.multiTierRoles) {
          setUserRole(profileData.roles?.name || "user");
        } else {
          // MVP: Simple admin/user role
          setUserRole(profileData.is_admin ? "admin" : "user");
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };
  
  // ... rest of hook ...
};
```

### 4. Conditional Component Features

**File: `src/pages/Dashboard.tsx` - Modified**

```typescript
import { featureFlags } from '@/lib/featureFlags';

const Dashboard = () => {
  const { userRole } = useAuth();
  const isAdmin = featureFlags.auth.multiTierRoles 
    ? ['super_admin', 'admin_manager', 'admin_regional'].includes(userRole)
    : userRole === 'admin';

  return (
    <div className="dashboard">
      {/* Basic stats - always shown */}
      <div className="stats-grid">
        <StatCard title="Applications" value={stats.total} />
        <StatCard title="Pending" value={stats.pending} />
      </div>
      
      {/* Enterprise analytics - conditional */}
      {featureFlags.analytics.dashboardAnalytics && (
        <div className="analytics-section">
          <AnalyticsCharts />
          <UsageMetrics />
        </div>
      )}
      
      {/* Messaging notifications - conditional */}
      {featureFlags.messaging.realTimeMessaging && (
        <MessageNotificationBanner />
      )}
      
      {/* Simple table for MVP, advanced table for enterprise */}
      {isAdmin && (
        featureFlags.enterpriseMode 
          ? <AdvancedPharmacistTable />
          : <SimplePharmacistTable />
      )}
    </div>
  );
};
```

### 5. Database Query Modifications

**File: `src/hooks/usePharmacistData.tsx` - Modified**

```typescript
import { featureFlags, getEnabledTables } from '@/lib/featureFlags';

export const usePharmacistData = () => {
  const fetchApplications = async () => {
    const enabledTables = getEnabledTables();
    
    let query = supabase
      .from('pharmacist_applications')
      .select(`
        *,
        application_documents(*)
        ${featureFlags.logging.auditTrails ? ', application_logs(*)' : ''}
        ${featureFlags.automation.applicationWorkflows ? ', workflow_states(*)' : ''}
      `);
      
    // Enterprise filtering
    if (featureFlags.messaging.messageCategories) {
      query = query.order('priority', { ascending: false });
    }
    
    const { data, error } = await query;
    return { data, error };
  };
  
  // ... rest of hook
};
```

### 6. UI Component Modifications

**File: `src/components/PharmacistTable.tsx` - Modified**

```typescript
import { featureFlags, shouldShowComponent } from '@/lib/featureFlags';

const PharmacistTable = ({ applications }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          
          {/* Enterprise columns - conditional */}
          {featureFlags.automation.applicationWorkflows && (
            <TableHead>Workflow Stage</TableHead>
          )}
          {shouldShowComponent('CustomFields') && (
            <TableHead>Custom Data</TableHead>
          )}
          
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      
      <TableBody>
        {applications.map(app => (
          <TableRow key={app.id}>
            <TableCell>{app.name}</TableCell>
            <TableCell>{app.status}</TableCell>
            <TableCell>{app.date}</TableCell>
            
            {/* Enterprise data - conditional */}
            {featureFlags.automation.applicationWorkflows && (
              <TableCell>{app.workflow_stage}</TableCell>
            )}
            
            <TableCell>
              {/* Basic actions for MVP */}
              <Button variant="outline">View</Button>
              <Button variant="outline">Edit</Button>
              
              {/* Enterprise actions - conditional */}
              {featureFlags.messaging.realTimeMessaging && (
                <Button variant="outline">Message</Button>
              )}
              {featureFlags.automation.approvalWorkflows && (
                <Button variant="outline">Workflow</Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

## Database Migration for MVP

### RLS Policy Updates

```sql
-- Create MVP-specific policies that respect feature flags
-- This can be done through Supabase environment variables

-- Hide enterprise tables in MVP mode
ALTER TABLE developer_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mvp_hide_messages" ON developer_messages 
FOR ALL USING (
  current_setting('app.settings.enterprise_mode', true)::boolean = true
);

-- Simplify user roles in MVP mode  
CREATE OR REPLACE FUNCTION get_user_role_mvp(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  IF current_setting('app.settings.enterprise_mode', true)::boolean = false THEN
    -- MVP mode: simple admin/user roles
    RETURN CASE 
      WHEN EXISTS(SELECT 1 FROM profiles WHERE id = user_id AND is_admin = true) 
      THEN 'admin' 
      ELSE 'user' 
    END;
  ELSE
    -- Enterprise mode: full role hierarchy
    RETURN (SELECT r.name FROM profiles p JOIN roles r ON p.role_id = r.id WHERE p.id = user_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing Both Modes

### MVP Mode Testing
```bash
# Set environment
export NEXT_PUBLIC_ENTERPRISE_MODE=false

# Expected behavior:
# - Simple navigation menu
# - Basic admin/user roles only
# - No messaging system
# - No AI analysis
# - Basic dashboard stats
# - Simple application management
```

### Enterprise Mode Testing
```bash
# Set environment  
export NEXT_PUBLIC_ENTERPRISE_MODE=true

# Expected behavior:
# - Full navigation with all features
# - Multi-tier admin roles
# - Real-time messaging
# - AI analysis panels
# - Advanced analytics
# - Complex workflow management
```

## Deployment Configurations

### MVP Production Deploy
```env
NEXT_PUBLIC_ENTERPRISE_MODE=false
NEXT_PUBLIC_DEVELOPER_MODE=false
NODE_ENV=production
```

### Enterprise Production Deploy
```env
NEXT_PUBLIC_ENTERPRISE_MODE=true
NEXT_PUBLIC_DEVELOPER_MODE=false
NODE_ENV=production
# + all external service configs
```

## Gradual Feature Rollout

You can enable individual enterprise features by modifying the feature flags:

```typescript
// Custom feature configuration - mix MVP and Enterprise
export const featureFlags: FeatureFlags = {
  enterpriseMode: false, // Keep overall MVP mode
  
  // But enable specific features
  messaging: {
    realTimeMessaging: true, // Enable just messaging
    messageThreading: false, // But keep it simple
    // ... other messaging features false
  },
  
  // All other categories remain MVP-level
  auth: { /* all false */ },
  ai: { /* all false */ },
  // etc.
};
```

This allows for gradual feature introduction as clients grow and need more functionality.

## Key Benefits

1. **No Code Deletion**: All enterprise functionality is preserved
2. **Easy Switching**: Change one environment variable to switch modes
3. **Gradual Upgrades**: Enable features incrementally
4. **Clean MVP**: Complex features are completely hidden
5. **Maintainable**: Single codebase for both versions
6. **Testable**: Both modes can be tested independently

## Next Steps

1. Apply feature flags to existing components
2. Test MVP mode thoroughly
3. Verify enterprise mode still works
4. Update deployment scripts
5. Train team on feature flag usage
6. Document upgrade paths for clients