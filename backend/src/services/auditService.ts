import { UserModel } from '../models/UserModel';

export enum AuditLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  USER_MANAGEMENT = 'user_management',
  CIRCLE_MANAGEMENT = 'circle_management',
  SAFETY = 'safety',
  BILLING = 'billing',
  SYSTEM = 'system',
  SECURITY = 'security',
  DATA = 'data',
  API = 'api',
}

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  LOGIN_FAILED = 'login_failed',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  EMERGENCY_ALERT_CREATED = 'emergency_alert_created',
  SAFETY_CHECK_REQUESTED = 'safety_check_requested',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SYSTEM_STARTUP = 'system_startup',
  SECURITY_ALERT = 'security_alert',
  API_CALL = 'api_call',
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  category: AuditCategory;
  level: AuditLevel;
  description: string;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  resourceId: string | null;
  resourceType: string | null;
  timestamp: Date;
}

class AuditService {
  private auditLogs: AuditLog[] = [];
  private maxLogs = 10000;
  public auditActions = AuditAction;

  async logAPIEvent(userId: string | null, action: string, path: string, details = {}) {
    return this.logAuditEvent({
      userId,
      action,
      category: AuditCategory.API,
      description: `API Call: ${action} on ${path}`,
      details,
    });
  }

  async logAuditEvent(options: Partial<AuditLog> & { action: string; category: AuditCategory; description: string }) {
    try {
      const auditLog: AuditLog = {
        id: this.generateAuditId(),
        userId: options.userId || null,
        action: options.action,
        category: options.category,
        level: options.level || AuditLevel.INFO,
        description: options.description,
        details: options.details || {},
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        resourceId: options.resourceId || null,
        resourceType: options.resourceType || null,
        timestamp: new Date(),
      };

      this.auditLogs.push(auditLog);

      if (this.auditLogs.length > this.maxLogs) {
        this.auditLogs = this.auditLogs.slice(-this.maxLogs);
      }

      // Store in DB logic should go here
      console.log(`[AUDIT] ${auditLog.category} - ${auditLog.action}: ${auditLog.description}`);

      return auditLog;
    } catch (error) {
      console.error('Log audit event error:', error);
      throw error;
    }
  }

  // Simplified convenience methods
  async logAuthenticationEvent(userId: string | null, action: AuditAction, details = {}) {
    return this.logAuditEvent({
      userId,
      action,
      category: AuditCategory.AUTHENTICATION,
      description: `Authentication event: ${action}`,
      details,
    });
  }

  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    category?: AuditCategory;
    level?: AuditLevel;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    let filtered = [...this.auditLogs];

    if (filters.userId) filtered = filtered.filter(l => l.userId === filters.userId);
    if (filters.action) filtered = filtered.filter(l => l.action === filters.action);
    if (filters.category) filtered = filtered.filter(l => l.category === filters.category);
    if (filters.level) filtered = filtered.filter(l => l.level === filters.level);
    
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(l => l.timestamp >= start);
    }
    
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      filtered = filtered.filter(l => l.timestamp <= end);
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = filtered.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 100;
    const logs = filtered.slice(offset, offset + limit);

    return {
      logs,
      total,
      limit,
      offset,
    };
  }

  async getAuditStatistics(filters: { startDate?: string; endDate?: string }) {
    let filtered = [...this.auditLogs];
    
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(l => l.timestamp >= start);
    }
    
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      filtered = filtered.filter(l => l.timestamp <= end);
    }

    const stats: any = {
      totalLogs: filtered.length,
      byCategory: {},
      byLevel: {},
      byAction: {},
    };

    filtered.forEach(log => {
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
    });

    return stats;
  }

  async exportAuditLogs(filters: { startDate?: string; endDate?: string }, format: string = 'csv') {
    const { logs } = await this.getAuditLogs({ ...filters, limit: 10000 });
    
    if (format === 'json') {
      return {
        data: JSON.stringify(logs, null, 2),
        format: 'json',
        filename: `audit_logs_${Date.now()}.json`,
      };
    }

    // Simple CSV export
    const headers = ['ID', 'Timestamp', 'User ID', 'Category', 'Action', 'Level', 'Description'];
    const rows = logs.map(l => [
      l.id,
      l.timestamp.toISOString(),
      l.userId || '',
      l.category,
      l.action,
      l.level,
      l.description.replace(/"/g, '""'),
    ].map(field => `"${field}"`).join(','));

    const csvData = [headers.join(','), ...rows].join('\n');
    
    return {
      data: csvData,
      format: 'csv',
      filename: `audit_logs_${Date.now()}.csv`,
    };
  }

  private generateAuditId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getLogs() {
    return this.auditLogs;
  }
}

export const auditService = new AuditService();
export default auditService;
