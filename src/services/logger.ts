import { supabase } from "@/integrations/supabase/client";

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  component?: string;
  error_stack?: string;
  route?: string;
}

class Logger {
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeUserId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeUserId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      this.userId = user?.id || null;
    } catch (error) {
      // Silently handle auth errors
      this.userId = null;
    }
  }

  private async logToDatabase(entry: LogEntry) {
    try {
      const logData = {
        level: entry.level,
        message: entry.message,
        metadata: entry.metadata || {},
        user_id: this.userId,
        session_id: this.sessionId,
        request_id: this.generateRequestId(),
        user_agent: navigator.userAgent,
        ip_address: null, // Will be populated by edge function if needed
        route: entry.route || window.location.pathname,
        component: entry.component,
        error_stack: entry.error_stack,
        timestamp: new Date().toISOString()
      };

      // Use insert without waiting for response to avoid blocking
      supabase
        .from('application_logs')
        .insert(logData)
        .then(({ error }) => {
          if (error) {
            console.warn('Failed to log to database:', error);
          }
        });

    } catch (error) {
      // Silently handle logging errors to prevent infinite loops
      console.warn('Logger database error:', error);
    }
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatConsoleMessage(level: LogLevel, message: string, metadata?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  debug(message: string, metadata?: Record<string, any>, component?: string) {
    const entry: LogEntry = { level: 'debug', message, metadata, component };
    console.debug(this.formatConsoleMessage('debug', message, metadata));
    this.logToDatabase(entry);
  }

  info(message: string, metadata?: Record<string, any>, component?: string) {
    const entry: LogEntry = { level: 'info', message, metadata, component };
    console.info(this.formatConsoleMessage('info', message, metadata));
    this.logToDatabase(entry);
  }

  warn(message: string, metadata?: Record<string, any>, component?: string) {
    const entry: LogEntry = { level: 'warn', message, metadata, component };
    console.warn(this.formatConsoleMessage('warn', message, metadata));
    this.logToDatabase(entry);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>, component?: string) {
    const entry: LogEntry = { 
      level: 'error', 
      message, 
      metadata: {
        ...metadata,
        error_name: error?.name,
        error_message: error?.message
      }, 
      component,
      error_stack: error?.stack
    };
    console.error(this.formatConsoleMessage('error', message, entry.metadata));
    this.logToDatabase(entry);
  }

  fatal(message: string, error?: Error, metadata?: Record<string, any>, component?: string) {
    const entry: LogEntry = { 
      level: 'fatal', 
      message, 
      metadata: {
        ...metadata,
        error_name: error?.name,
        error_message: error?.message
      }, 
      component,
      error_stack: error?.stack
    };
    console.error(this.formatConsoleMessage('fatal', message, entry.metadata));
    this.logToDatabase(entry);
  }

  // Method to update user ID when auth state changes
  setUserId(userId: string | null) {
    this.userId = userId;
  }

  // Method to log user actions
  logUserAction(action: string, details?: Record<string, any>, component?: string) {
    this.info(`User action: ${action}`, {
      action,
      ...details,
      user_id: this.userId
    }, component);
  }

  // Method to log API calls
  logApiCall(method: string, url: string, status?: number, duration?: number, component?: string) {
    const metadata = {
      method,
      url,
      status,
      duration_ms: duration
    };

    if (status && status >= 400) {
      this.error(`API call failed: ${method} ${url}`, undefined, metadata, component);
    } else {
      this.info(`API call: ${method} ${url}`, metadata, component);
    }
  }

  // Method to log navigation
  logNavigation(from: string, to: string, component?: string) {
    this.info(`Navigation: ${from} -> ${to}`, {
      from,
      to,
      navigation: true
    }, component);
  }
}

// Export singleton instance
export const logger = new Logger();

// Hook for React components
export const useLogger = () => {
  return logger;
};