/**
 * Feature Flags for StreetCredRx Platform
 * Controls MVP vs Enterprise features without code deletion
 * 
 * Usage:
 * - Set VITE_APP_MODE=mvp in .env for basic features
 * - Set VITE_APP_MODE=enterprise for full features
 */

// Get app mode from environment (defaults to MVP for safety)
const APP_MODE = import.meta.env.VITE_APP_MODE || 'mvp';
const IS_ENTERPRISE = APP_MODE === 'enterprise';
const IS_MVP = APP_MODE === 'mvp';

/**
 * Feature Flag Configuration
 * Organized by feature category for easy management
 */
export const features = {
  // Authentication & User Management
  auth: {
    basicLogin: true, // Always enabled
    googleOAuth: IS_ENTERPRISE,
    passwordReset: true, // Keep for MVP
    emailVerification: true, // Keep for MVP
    userInvitations: IS_ENTERPRISE,
    multiFactorAuth: false, // Future feature
  },

  // Admin System
  admin: {
    singleAdminRole: IS_MVP, // MVP has single admin
    multiTierRoles: IS_ENTERPRISE, // Enterprise has Super Admin, Admin Manager, Admin Regional
    userManagement: IS_ENTERPRISE,
    roleAssignment: IS_ENTERPRISE,
    activityLogs: IS_ENTERPRISE,
    auditTrails: IS_ENTERPRISE,
  },

  // Dashboard Features
  dashboard: {
    basicStats: true, // Always show basic stats
    advancedAnalytics: IS_ENTERPRISE,
    realtimeUpdates: IS_ENTERPRISE,
    exportReports: IS_ENTERPRISE,
    customWidgets: IS_ENTERPRISE,
  },

  // Messaging System
  messaging: {
    enabled: true, // Always enabled - critical for client communication
    aiAnalysis: IS_ENTERPRISE,
    threading: true, // Enable threading for MVP
    priorities: true, // Enable priorities for MVP
    categories: true, // Enable categories for MVP
    notifications: IS_ENTERPRISE,
  },

  // Document Management
  documents: {
    basicUpload: true, // MVP can upload documents
    advancedProcessing: IS_ENTERPRISE,
    ocrScanning: IS_ENTERPRISE,
    bulkOperations: IS_ENTERPRISE,
    versionControl: IS_ENTERPRISE,
  },

  // Application Forms
  applications: {
    basicForm: true, // MVP has basic pharmacist form
    advancedFields: IS_ENTERPRISE,
    conditionalLogic: IS_ENTERPRISE,
    multiStepWizard: IS_MVP ? false : true, // Simplify to single page for MVP
    autoSave: IS_ENTERPRISE,
  },

  // Notifications
  notifications: {
    inApp: IS_MVP, // Basic in-app notifications for MVP
    email: IS_ENTERPRISE,
    sms: IS_ENTERPRISE,
    push: false, // Future feature
    customTemplates: IS_ENTERPRISE,
  },

  // API & Integrations
  api: {
    publicEndpoints: IS_ENTERPRISE,
    apiKeys: IS_ENTERPRISE,
    webhooks: IS_ENTERPRISE,
    thirdPartyIntegrations: IS_ENTERPRISE,
    rateLimiting: IS_ENTERPRISE,
  },

  // Workflow Management
  workflows: {
    basicApproval: IS_MVP, // Simple approve/reject for MVP
    multiStageApproval: IS_ENTERPRISE,
    customWorkflows: IS_ENTERPRISE,
    automation: IS_ENTERPRISE,
    scheduling: IS_ENTERPRISE,
  },

  // Search & Filtering
  search: {
    basicSearch: true, // Always enabled
    advancedFilters: IS_ENTERPRISE,
    savedSearches: IS_ENTERPRISE,
    searchHistory: IS_ENTERPRISE,
    fuzzySearch: IS_ENTERPRISE,
  },
};

/**
 * Role definitions based on app mode
 */
export const roles = IS_ENTERPRISE
  ? {
      SUPER_ADMIN: 'super_admin',
      ADMIN_MANAGER: 'admin_manager',
      ADMIN_REGIONAL: 'admin_regional',
      PHARMACIST: 'pharmacist',
    }
  : {
      ADMIN: 'admin',
      PHARMACIST: 'pharmacist',
    };

/**
 * Route access configuration
 */
export const routeAccess = {
  // Public routes (always accessible)
  '/': true,
  '/auth': true,
  '/auth/signin': true,
  '/auth/signup': true,
  '/auth/reset-password': true,

  // Authenticated routes
  '/dashboard': true, // All authenticated users
  '/profile': true,
  '/my-applications': true,
  '/my-credentials': true,

  // Admin routes (conditional based on mode)
  '/pharmacists': IS_MVP || IS_ENTERPRISE,
  '/pending': IS_MVP || IS_ENTERPRISE,
  '/completed': IS_MVP || IS_ENTERPRISE,
  '/expiring': IS_MVP || IS_ENTERPRISE,
  
  // Messages - enabled for all modes (critical for client communication)
  '/messages': true,
  '/user-management': true, // Always available for super_admin
  '/logs': true, // Always available for super_admin
  
  // Enterprise-only routes
  '/api-keys': IS_ENTERPRISE,
  '/workflows': IS_ENTERPRISE,
  '/analytics': IS_ENTERPRISE,
};

/**
 * Navigation menu items based on features
 */
export const getNavigationItems = (userRole: string) => {
  const items = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'Home',
      show: true,
    },
    {
      name: 'My Applications',
      path: '/my-applications',
      icon: 'FileText',
      show: true,
    },
    {
      name: 'My Credentials',
      path: '/my-credentials',
      icon: 'Award',
      show: true,
    },
  ];

  // Admin items
  const isAdmin = IS_MVP ? userRole === 'admin' : ['super_admin', 'admin_manager', 'admin_regional'].includes(userRole);
  
  if (isAdmin) {
    items.push(
      {
        name: 'Pharmacists',
        path: '/pharmacists',
        icon: 'Users',
        show: true,
      },
      {
        name: 'Pending',
        path: '/pending',
        icon: 'Clock',
        show: true,
      },
      {
        name: 'Completed',
        path: '/completed',
        icon: 'CheckCircle',
        show: true,
      },
      {
        name: 'Expiring',
        path: '/expiring',
        icon: 'AlertCircle',
        show: true,
      }
    );
  }

  // Messages - always show for admins (critical communication)
  if (features.messaging.enabled && isAdmin) {
    items.push({
      name: 'Messages',
      path: '/messages',
      icon: 'MessageSquare',
      show: true,
    });
  }

  // Super Admin only items - show in all modes
  if (userRole === 'super_admin') {
    items.push({
      name: 'User Management',
      path: '/user-management',
      icon: 'Settings',
      show: true,
    });
    
    items.push({
      name: 'System Logs',
      path: '/logs',
      icon: 'FileText',
      show: true,
    });
  }

  return items.filter(item => item.show);
};

/**
 * Database tables access based on features
 */
export const databaseAccess = {
  // Core tables (always accessible)
  profiles: true,
  pharmacist_applications: true,
  application_documents: true,

  // Enterprise tables
  developer_messages: IS_ENTERPRISE,
  ai_analysis: IS_ENTERPRISE,
  user_invitations: IS_ENTERPRISE,
  activity_logs: IS_ENTERPRISE,
  api_keys: IS_ENTERPRISE,
  notification_preferences: IS_ENTERPRISE,
  usage_tracking: IS_ENTERPRISE,
  workflow_stages: IS_ENTERPRISE,
};

/**
 * Helper functions for feature checking
 */
export const isFeatureEnabled = (featurePath: string): boolean => {
  const keys = featurePath.split('.');
  let current: any = features;
  
  for (const key of keys) {
    if (current[key] === undefined) return false;
    current = current[key];
  }
  
  return current === true;
};

export const hasRole = (userRole: string, requiredRole: string): boolean => {
  if (IS_MVP) {
    // Simple role check for MVP
    if (requiredRole === 'admin' && userRole === 'admin') return true;
    if (requiredRole === 'pharmacist' && userRole === 'pharmacist') return true;
    return false;
  }

  // Enterprise role hierarchy
  const roleHierarchy = {
    super_admin: 4,
    admin_manager: 3,
    admin_regional: 2,
    pharmacist: 1,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
};

export const canAccessRoute = (route: string, userRole?: string): boolean => {
  // Check if route is explicitly defined
  if (routeAccess[route as keyof typeof routeAccess] !== undefined) {
    return routeAccess[route as keyof typeof routeAccess];
  }

  // For undefined routes, check if user is authenticated
  return !!userRole;
};

export const shouldShowComponent = (componentName: string): boolean => {
  const componentFeatures: Record<string, boolean> = {
    // MVP components (always show)
    'BasicDashboard': true,
    'SimplePharmacistForm': true,
    'DocumentUpload': true,
    'ProfileSettings': true,
    
    // Enterprise components
    'MessagingCenter': IS_ENTERPRISE,
    'UserManagement': IS_ENTERPRISE,
    'ActivityLogs': IS_ENTERPRISE,
    'AdvancedAnalytics': IS_ENTERPRISE,
    'WorkflowBuilder': IS_ENTERPRISE,
    'AIAnalysisPanel': IS_ENTERPRISE,
    'NotificationCenter': IS_ENTERPRISE,
    'ApiKeyManager': IS_ENTERPRISE,
  };

  return componentFeatures[componentName] ?? false;
};

/**
 * Export configuration for use in components
 */
export default {
  mode: APP_MODE,
  isEnterprise: IS_ENTERPRISE,
  isMvp: IS_MVP,
  features,
  roles,
  routeAccess,
  getNavigationItems,
  databaseAccess,
  isFeatureEnabled,
  hasRole,
  canAccessRoute,
  shouldShowComponent,
};