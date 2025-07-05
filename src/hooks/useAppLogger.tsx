import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { logger } from '@/services/logger';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook to integrate logger with React app lifecycle
 * Automatically updates logger with user context and tracks navigation
 */
export const useAppLogger = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Update logger user context when auth changes
  useEffect(() => {
    logger.setUserId(user?.id || null);
    if (user) {
      logger.info('User authenticated', { 
        user_id: user.id, 
        email: user.email 
      }, 'Auth');
    }
  }, [user]);

  // Log route changes
  useEffect(() => {
    logger.logNavigation(document.referrer || 'direct', location.pathname, 'Router');
  }, [location.pathname]);

  return logger;
};