import { Alert } from 'react-native';
import analyticsService from '../services/analytics/AnalyticsService';

export enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  component?: string;
  method?: string;
  userId?: string;
  familyId?: string;
  additionalData?: any;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = !__DEV__;
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(
    error: Error | string,
    level: ErrorLevel = ErrorLevel.ERROR,
    context?: ErrorContext
  ): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log error
    this.logError(errorMessage, level, context, errorStack);

    // Track error in analytics
    this.trackError(errorMessage, level, context);

    // Show user-friendly message for critical errors
    if (level === ErrorLevel.CRITICAL) {
      this.showUserError(errorMessage);
    }
  }

  private logError(
    message: string,
    level: ErrorLevel,
    context?: ErrorContext,
    stack?: string
  ): void {
    const logData = {
      message,
      level,
      timestamp: new Date().toISOString(),
      context,
      stack: this.isProduction ? undefined : stack
    };

    // In development, use console
    if (!this.isProduction) {
      switch (level) {
        case ErrorLevel.DEBUG:
          console.debug('[DEBUG]:', logData);
          break;
        case ErrorLevel.INFO:
          console.info('[INFO]:', logData);
          break;
        case ErrorLevel.WARN:
          console.warn('[WARN]:', logData);
          break;
        case ErrorLevel.ERROR:
          console.error('[ERROR]:', logData);
          break;
        case ErrorLevel.CRITICAL:
          console.error('🚨 CRITICAL:', logData);
          break;
      }
    } else {
      // In production, send to logging service
      this.sendToLoggingService(logData);
    }
  }

  private trackError(
    message: string,
    level: ErrorLevel,
    context?: ErrorContext
  ): void {
    try {
      analyticsService.trackEvent('error_occurred', {
        error_message: message,
        error_level: level,
        component: context?.component,
        method: context?.method,
        user_id: context?.userId,
        family_id: context?.familyId
      });
    } catch (error) {
      // Fallback to console if analytics fails
      console.error('Failed to track error:', error);
    }
  }

  private showUserError(message: string): void {
    Alert.alert(
      'Something went wrong',
      'We encountered an unexpected error. Please try again or contact support if the problem persists.',
      [
        { text: 'OK', style: 'default' },
        { text: 'Report Issue', onPress: () => this.reportIssue(message) }
      ]
    );
  }

  private async sendToLoggingService(logData: any): Promise<void> {
    try {
      // Send to your logging service (e.g., Sentry, LogRocket, etc.)
      // This is a placeholder implementation
      await fetch('https://logs.bondarys.com/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });
    } catch (error) {
      // Fallback to console if logging service fails
      console.error('Failed to send to logging service:', error);
    }
  }

  private reportIssue(errorMessage: string): void {
    // Navigate to issue reporting screen or open email
    // This is a placeholder implementation
    console.log('Report issue:', errorMessage);
  }

  // Utility methods for common error patterns
  handleApiError(error: any, context?: ErrorContext): void {
    if (error.code === 'NETWORK_ERROR') {
      this.handleError('Network connection failed. Please check your internet connection.', ErrorLevel.WARN, context);
    } else if (error.code === 'UNAUTHORIZED') {
      this.handleError('Session expired. Please log in again.', ErrorLevel.ERROR, context);
    } else {
      this.handleError(error.message || 'An unexpected error occurred', ErrorLevel.ERROR, context);
    }
  }

  handleValidationError(errors: any[], context?: ErrorContext): void {
    const errorMessage = errors.map(error => error.message).join(', ');
    this.handleError(`Validation failed: ${errorMessage}`, ErrorLevel.WARN, context);
  }

  handleAsyncError(error: any, context?: ErrorContext): void {
    if (error instanceof Error) {
      this.handleError(error, ErrorLevel.ERROR, context);
    } else {
      this.handleError('An unexpected error occurred', ErrorLevel.ERROR, context);
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: Error | string, level?: ErrorLevel, context?: ErrorContext) => {
  errorHandler.handleError(error, level, context);
};

export const handleApiError = (error: any, context?: ErrorContext) => {
  errorHandler.handleApiError(error, context);
};

export const handleValidationError = (errors: any[], context?: ErrorContext) => {
  errorHandler.handleValidationError(errors, context);
};

export const handleAsyncError = (error: any, context?: ErrorContext) => {
  errorHandler.handleAsyncError(error, context);
}; 