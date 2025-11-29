import { Platform } from 'react-native';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
  method?: string;
  userId?: string;
  familyId?: string;
}

class Logger {
  private static instance: Logger;
  private currentLevel: LogLevel;
  private isProduction: boolean;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private constructor() {
    this.isProduction = !__DEV__;
    this.currentLevel = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  debug(message: string, data?: any, context?: { component?: string; method?: string; userId?: string; familyId?: string }): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  info(message: string, data?: any, context?: { component?: string; method?: string; userId?: string; familyId?: string }): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  warn(message: string, data?: any, context?: { component?: string; method?: string; userId?: string; familyId?: string }): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  error(message: string, data?: any, context?: { component?: string; method?: string; userId?: string; familyId?: string }): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  critical(message: string, data?: any, context?: { component?: string; method?: string; userId?: string; familyId?: string }): void {
    this.log(LogLevel.CRITICAL, message, data, context);
  }

  private log(level: LogLevel, message: string, data?: any, context?: { component?: string; method?: string; userId?: string; familyId?: string }): void {
    if (level < this.currentLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      component: context?.component,
      method: context?.method,
      userId: context?.userId,
      familyId: context?.familyId
    };

    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Output based on environment
    if (this.isProduction) {
      this.outputToProduction(entry);
    } else {
      this.outputToConsole(entry);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const prefix = this.getLogPrefix(entry.level);
    const context = entry.component ? `[${entry.component}]` : '';
    const method = entry.method ? `.${entry.method}` : '';
    
    const logMessage = `${prefix} ${context}${method}: ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(logMessage, entry.data || '');
        break;
      case LogLevel.CRITICAL:
        console.error(`🚨 ${logMessage}`, entry.data || '');
        break;
    }
  }

  private outputToProduction(entry: LogEntry): void {
    // In production, only log WARN and above to console
    if (entry.level >= LogLevel.WARN) {
      this.outputToConsole(entry);
    }

    // Send to remote logging service for all levels
    this.sendToRemoteService(entry);
  }

  private getLogPrefix(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '[DEBUG]';
      case LogLevel.INFO:
        return '[INFO]';
      case LogLevel.WARN:
        return '[WARN]';
      case LogLevel.ERROR:
        return '[ERROR]';
      case LogLevel.CRITICAL:
        return '[CRITICAL]';
      default:
        return '[LOG]';
    }
  }

  private async sendToRemoteService(entry: LogEntry): Promise<void> {
    try {
      // Send to your remote logging service (e.g., Sentry, LogRocket, etc.)
      // This is a placeholder implementation
      await fetch('https://logs.bondarys.com/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          platform: Platform.OS,
          version: Platform.Version,
          appVersion: '1.0.0', // Replace with actual app version
        }),
      });
    } catch (error) {
      // Fallback to console if remote service fails
      console.error('Failed to send log to remote service:', error);
    }
  }

  // Utility methods
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logBuffer.filter(entry => entry.level >= level);
    }
    return [...this.logBuffer];
  }

  clearLogs(): void {
    this.logBuffer = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  // Performance logging
  time(label: string): void {
    if (!this.isProduction) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (!this.isProduction) {
      console.timeEnd(label);
    }
  }

  // Group logging
  group(label: string): void {
    if (!this.isProduction) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (!this.isProduction) {
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const debug = (message: string, data?: any, context?: { component?: string; method?: string; userId?: string; familyId?: string }) => {
  logger.debug(message, data, context);
};

export const info = (message: string, data?: any, context?: { component?: string; method?: string; userId?: string; familyId?: string }) => {
  logger.info(message, data, context);
};

export const warn = (message: string, data?: any, context?: { component?: string; method?: string; userId?: string; familyId?: string }) => {
  logger.warn(message, data, context);
};

export const error = (message: string, data?: any, context?: { component?: string; method?: string; userId?: string; familyId?: string }) => {
  logger.error(message, data, context);
};

export const critical = (message: string, data?: any, context?: { component?: string; method?: string; userId?: string; familyId?: string }) => {
  logger.critical(message, data, context);
}; 