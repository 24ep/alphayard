// Optional model imports - models may not exist in all environments
let User, hourse, EmergencyAlert, SafetyCheck, Message, Subscription;
try {
  User = require('../models/User');
} catch (e) {
  // User model not available
}
try {
  hourse = require('../models/hourse');
} catch (e) {
  // hourse model not available
}
try {
  EmergencyAlert = require('../models/EmergencyAlert');
} catch (e) {
  // EmergencyAlert model not available
}
try {
  SafetyCheck = require('../models/SafetyCheck');
} catch (e) {
  // SafetyCheck model not available
}
try {
  Message = require('../models/Message');
} catch (e) {
  // Message model not available
}
try {
  Subscription = require('../models/Subscription');
} catch (e) {
  // Subscription model not available
}

class AuditService {
  constructor() {
    this.auditLevels = {
      INFO: 'info',
      WARNING: 'warning',
      ERROR: 'error',
      CRITICAL: 'critical',
    };

    this.auditCategories = {
      AUTHENTICATION: 'authentication',
      USER_MANAGEMENT: 'user_management',
      FAMILY_MANAGEMENT: 'family_management',
      SAFETY: 'safety',
      BILLING: 'billing',
      SYSTEM: 'system',
      SECURITY: 'security',
      DATA: 'data',
      API: 'api',
    };

    this.auditActions = {
      // Authentication
      LOGIN: 'login',
      LOGOUT: 'logout',
      REGISTER: 'register',
      PASSWORD_RESET: 'password_reset',
      EMAIL_VERIFICATION: 'email_verification',
      TOKEN_REFRESH: 'token_refresh',
      LOGIN_FAILED: 'login_failed',

      // User Management
      USER_CREATED: 'user_created',
      USER_UPDATED: 'user_updated',
      USER_DELETED: 'user_deleted',
      PROFILE_UPDATED: 'profile_updated',
      AVATAR_UPLOADED: 'avatar_uploaded',
      PREFERENCES_UPDATED: 'preferences_updated',

      // hourse Management
      FAMILY_CREATED: 'family_created',
      FAMILY_UPDATED: 'family_updated',
      FAMILY_DELETED: 'family_deleted',
      MEMBER_ADDED: 'member_added',
      MEMBER_REMOVED: 'member_removed',
      INVITATION_SENT: 'invitation_sent',
      INVITATION_ACCEPTED: 'invitation_accepted',
      INVITATION_DECLINED: 'invitation_declined',

      // Safety
      EMERGENCY_ALERT_CREATED: 'emergency_alert_created',
      EMERGENCY_ALERT_UPDATED: 'emergency_alert_updated',
      EMERGENCY_ALERT_RESOLVED: 'emergency_alert_resolved',
      SAFETY_CHECK_REQUESTED: 'safety_check_requested',
      SAFETY_CHECK_RESPONDED: 'safety_check_responded',
      SAFETY_CHECK_EXPIRED: 'safety_check_expired',
      GEOFENCE_BREACH: 'geofence_breach',
      LOCATION_SHARED: 'location_shared',

      // Billing
      SUBSCRIPTION_CREATED: 'subscription_created',
      SUBSCRIPTION_UPDATED: 'subscription_updated',
      SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
      PAYMENT_PROCESSED: 'payment_processed',
      PAYMENT_FAILED: 'payment_failed',
      REFUND_PROCESSED: 'refund_processed',

      // System
      SYSTEM_STARTUP: 'system_startup',
      SYSTEM_SHUTDOWN: 'system_shutdown',
      BACKUP_CREATED: 'backup_created',
      MAINTENANCE_STARTED: 'maintenance_started',
      MAINTENANCE_COMPLETED: 'maintenance_completed',

      // Security
      SUSPICIOUS_ACTIVITY: 'suspicious_activity',
      RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
      INVALID_TOKEN: 'invalid_token',
      UNAUTHORIZED_ACCESS: 'unauthorized_access',
      DATA_BREACH: 'data_breach',

      // Data
      DATA_EXPORTED: 'data_exported',
      DATA_IMPORTED: 'data_imported',
      DATA_DELETED: 'data_deleted',
      DATA_ENCRYPTED: 'data_encrypted',
      DATA_DECRYPTED: 'data_decrypted',

      // API
      API_CALL: 'api_call',
      API_ERROR: 'api_error',
      API_RATE_LIMITED: 'api_rate_limited',
    };

    this.auditLogs = [];
    this.maxLogs = 10000; // Keep last 10,000 logs in memory
  }

  // Log an audit event
  async logAuditEvent(options) {
    try {
      const {
        userId = null,
        action,
        category,
        level = this.auditLevels.INFO,
        description,
        details = {},
        ipAddress = null,
        userAgent = null,
        resourceId = null,
        resourceType = null,
        metadata = {},
      } = options;

      // Validate required fields
      if (!action || !category || !description) {
        throw new Error('Missing required audit fields: action, category, description');
      }

      // Validate action and category
      if (!Object.values(this.auditActions).includes(action)) {
        console.warn(`⚠️ Unknown audit action: ${action}`);
      }

      if (!Object.values(this.auditCategories).includes(category)) {
        console.warn(`⚠️ Unknown audit category: ${category}`);
      }

      // Create audit log entry
      const auditLog = {
        id: this.generateAuditId(),
        userId,
        action,
        category,
        level,
        description,
        details,
        ipAddress,
        userAgent,
        resourceId,
        resourceType,
        metadata,
        timestamp: new Date(),
        createdAt: new Date(),
      };

      // Add to in-memory logs
      this.auditLogs.push(auditLog);

      // Maintain log size limit
      if (this.auditLogs.length > this.maxLogs) {
        this.auditLogs = this.auditLogs.slice(-this.maxLogs);
      }

      // Store in database (if configured)
      await this.storeAuditLog(auditLog);

      // Log to console based on level
      this.logToConsole(auditLog);

      // Send alerts for critical events
      if (level === this.auditLevels.CRITICAL) {
        await this.sendCriticalAlert(auditLog);
      }

      return auditLog;
    } catch (error) {
      console.error('Log audit event error:', error);
      throw error;
    }
  }

  // Log authentication events
  async logAuthenticationEvent(userId, action, details = {}) {
    try {
      const descriptions = {
        [this.auditActions.LOGIN]: 'User logged in successfully',
        [this.auditActions.LOGOUT]: 'User logged out',
        [this.auditActions.REGISTER]: 'New user registered',
        [this.auditActions.PASSWORD_RESET]: 'Password reset requested',
        [this.auditActions.EMAIL_VERIFICATION]: 'Email verification completed',
        [this.auditActions.TOKEN_REFRESH]: 'Access token refreshed',
        [this.auditActions.LOGIN_FAILED]: 'Login attempt failed',
      };

      const level = action === this.auditActions.LOGIN_FAILED ? 
                   this.auditLevels.WARNING : this.auditLevels.INFO;

      return await this.logAuditEvent({
        userId,
        action,
        category: this.auditCategories.AUTHENTICATION,
        level,
        description: descriptions[action] || `Authentication event: ${action}`,
        details,
      });
    } catch (error) {
      console.error('Log authentication event error:', error);
      throw error;
    }
  }

  // Log user management events
  async logUserManagementEvent(userId, action, targetUserId = null, details = {}) {
    try {
      const descriptions = {
        [this.auditActions.USER_CREATED]: 'New user account created',
        [this.auditActions.USER_UPDATED]: 'User account updated',
        [this.auditActions.USER_DELETED]: 'User account deleted',
        [this.auditActions.PROFILE_UPDATED]: 'User profile updated',
        [this.auditActions.AVATAR_UPLOADED]: 'User avatar uploaded',
        [this.auditActions.PREFERENCES_UPDATED]: 'User preferences updated',
      };

      return await this.logAuditEvent({
        userId,
        action,
        category: this.auditCategories.USER_MANAGEMENT,
        level: this.auditLevels.INFO,
        description: descriptions[action] || `User management event: ${action}`,
        details: { targetUserId, ...details },
        resourceId: targetUserId,
        resourceType: 'user',
      });
    } catch (error) {
      console.error('Log user management event error:', error);
      throw error;
    }
  }

  // Log hourse management events
  async logFamilyManagementEvent(userId, action, familyId = null, details = {}) {
    try {
      const descriptions = {
        [this.auditActions.FAMILY_CREATED]: 'New hourse created',
        [this.auditActions.FAMILY_UPDATED]: 'hourse updated',
        [this.auditActions.FAMILY_DELETED]: 'hourse deleted',
        [this.auditActions.MEMBER_ADDED]: 'hourse member added',
        [this.auditActions.MEMBER_REMOVED]: 'hourse member removed',
        [this.auditActions.INVITATION_SENT]: 'hourse invitation sent',
        [this.auditActions.INVITATION_ACCEPTED]: 'hourse invitation accepted',
        [this.auditActions.INVITATION_DECLINED]: 'hourse invitation declined',
      };

      return await this.logAuditEvent({
        userId,
        action,
        category: this.auditCategories.FAMILY_MANAGEMENT,
        level: this.auditLevels.INFO,
        description: descriptions[action] || `hourse management event: ${action}`,
        details: { familyId, ...details },
        resourceId: familyId,
        resourceType: 'hourse',
      });
    } catch (error) {
      console.error('Log hourse management event error:', error);
      throw error;
    }
  }

  // Log safety events
  async logSafetyEvent(userId, action, details = {}) {
    try {
      const descriptions = {
        [this.auditActions.EMERGENCY_ALERT_CREATED]: 'Emergency alert created',
        [this.auditActions.EMERGENCY_ALERT_UPDATED]: 'Emergency alert updated',
        [this.auditActions.EMERGENCY_ALERT_RESOLVED]: 'Emergency alert resolved',
        [this.auditActions.SAFETY_CHECK_REQUESTED]: 'Safety check requested',
        [this.auditActions.SAFETY_CHECK_RESPONDED]: 'Safety check responded',
        [this.auditActions.SAFETY_CHECK_EXPIRED]: 'Safety check expired',
        [this.auditActions.GEOFENCE_BREACH]: 'Geofence breach detected',
        [this.auditActions.LOCATION_SHARED]: 'Location shared',
      };

      const level = action.includes('EMERGENCY') ? 
                   this.auditLevels.CRITICAL : this.auditLevels.INFO;

      return await this.logAuditEvent({
        userId,
        action,
        category: this.auditCategories.SAFETY,
        level,
        description: descriptions[action] || `Safety event: ${action}`,
        details,
      });
    } catch (error) {
      console.error('Log safety event error:', error);
      throw error;
    }
  }

  // Log billing events
  async logBillingEvent(userId, action, subscriptionId = null, details = {}) {
    try {
      const descriptions = {
        [this.auditActions.SUBSCRIPTION_CREATED]: 'Subscription created',
        [this.auditActions.SUBSCRIPTION_UPDATED]: 'Subscription updated',
        [this.auditActions.SUBSCRIPTION_CANCELLED]: 'Subscription cancelled',
        [this.auditActions.PAYMENT_PROCESSED]: 'Payment processed successfully',
        [this.auditActions.PAYMENT_FAILED]: 'Payment failed',
        [this.auditActions.REFUND_PROCESSED]: 'Refund processed',
      };

      const level = action === this.auditActions.PAYMENT_FAILED ? 
                   this.auditLevels.WARNING : this.auditLevels.INFO;

      return await this.logAuditEvent({
        userId,
        action,
        category: this.auditCategories.BILLING,
        level,
        description: descriptions[action] || `Billing event: ${action}`,
        details: { subscriptionId, ...details },
        resourceId: subscriptionId,
        resourceType: 'subscription',
      });
    } catch (error) {
      console.error('Log billing event error:', error);
      throw error;
    }
  }

  // Log system events
  async logSystemEvent(action, details = {}) {
    try {
      const descriptions = {
        [this.auditActions.SYSTEM_STARTUP]: 'System started up',
        [this.auditActions.SYSTEM_SHUTDOWN]: 'System shutting down',
        [this.auditActions.BACKUP_CREATED]: 'System backup created',
        [this.auditActions.MAINTENANCE_STARTED]: 'System maintenance started',
        [this.auditActions.MAINTENANCE_COMPLETED]: 'System maintenance completed',
      };

      return await this.logAuditEvent({
        action,
        category: this.auditCategories.SYSTEM,
        level: this.auditLevels.INFO,
        description: descriptions[action] || `System event: ${action}`,
        details,
      });
    } catch (error) {
      console.error('Log system event error:', error);
      throw error;
    }
  }

  // Log security events
  async logSecurityEvent(userId, action, details = {}) {
    try {
      const descriptions = {
        [this.auditActions.SUSPICIOUS_ACTIVITY]: 'Suspicious activity detected',
        [this.auditActions.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
        [this.auditActions.INVALID_TOKEN]: 'Invalid token used',
        [this.auditActions.UNAUTHORIZED_ACCESS]: 'Unauthorized access attempt',
        [this.auditActions.DATA_BREACH]: 'Potential data breach detected',
      };

      const level = action === this.auditActions.DATA_BREACH ? 
                   this.auditLevels.CRITICAL : this.auditLevels.WARNING;

      return await this.logAuditEvent({
        userId,
        action,
        category: this.auditCategories.SECURITY,
        level,
        description: descriptions[action] || `Security event: ${action}`,
        details,
      });
    } catch (error) {
      console.error('Log security event error:', error);
      throw error;
    }
  }

  // Log data events
  async logDataEvent(userId, action, details = {}) {
    try {
      const descriptions = {
        [this.auditActions.DATA_EXPORTED]: 'Data exported',
        [this.auditActions.DATA_IMPORTED]: 'Data imported',
        [this.auditActions.DATA_DELETED]: 'Data deleted',
        [this.auditActions.DATA_ENCRYPTED]: 'Data encrypted',
        [this.auditActions.DATA_DECRYPTED]: 'Data decrypted',
      };

      return await this.logAuditEvent({
        userId,
        action,
        category: this.auditCategories.DATA,
        level: this.auditLevels.INFO,
        description: descriptions[action] || `Data event: ${action}`,
        details,
      });
    } catch (error) {
      console.error('Log data event error:', error);
      throw error;
    }
  }

  // Log API events
  async logAPIEvent(userId, action, endpoint = null, details = {}) {
    try {
      const descriptions = {
        [this.auditActions.API_CALL]: 'API endpoint called',
        [this.auditActions.API_ERROR]: 'API error occurred',
        [this.auditActions.API_RATE_LIMITED]: 'API rate limited',
      };

      const level = action === this.auditActions.API_ERROR ? 
                   this.auditLevels.WARNING : this.auditLevels.INFO;

      return await this.logAuditEvent({
        userId,
        action,
        category: this.auditCategories.API,
        level,
        description: descriptions[action] || `API event: ${action}`,
        details: { endpoint, ...details },
      });
    } catch (error) {
      console.error('Log API event error:', error);
      throw error;
    }
  }

  // Get audit logs with filters
  async getAuditLogs(filters = {}) {
    try {
      const {
        userId = null,
        action = null,
        category = null,
        level = null,
        startDate = null,
        endDate = null,
        limit = 100,
        offset = 0,
      } = filters;

      let logs = [...this.auditLogs];

      // Apply filters
      if (userId) {
        logs = logs.filter(log => log.userId === userId);
      }

      if (action) {
        logs = logs.filter(log => log.action === action);
      }

      if (category) {
        logs = logs.filter(log => log.category === category);
      }

      if (level) {
        logs = logs.filter(log => log.level === level);
      }

      if (startDate) {
        logs = logs.filter(log => log.timestamp >= new Date(startDate));
      }

      if (endDate) {
        logs = logs.filter(log => log.timestamp <= new Date(endDate));
      }

      // Sort by timestamp (newest first)
      logs.sort((a, b) => b.timestamp - a.timestamp);

      // Apply pagination
      const total = logs.length;
      const paginatedLogs = logs.slice(offset, offset + limit);

      return {
        logs: paginatedLogs,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  }

  // Get audit statistics
  async getAuditStatistics(filters = {}) {
    try {
      const { startDate = null, endDate = null } = filters;

      let logs = [...this.auditLogs];

      // Apply date filters
      if (startDate) {
        logs = logs.filter(log => log.timestamp >= new Date(startDate));
      }

      if (endDate) {
        logs = logs.filter(log => log.timestamp <= new Date(endDate));
      }

      // Calculate statistics
      const totalEvents = logs.length;
      const eventsByLevel = {};
      const eventsByCategory = {};
      const eventsByAction = {};
      const eventsByUser = {};

      for (const log of logs) {
        // Count by level
        eventsByLevel[log.level] = (eventsByLevel[log.level] || 0) + 1;

        // Count by category
        eventsByCategory[log.category] = (eventsByCategory[log.category] || 0) + 1;

        // Count by action
        eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1;

        // Count by user
        if (log.userId) {
          eventsByUser[log.userId] = (eventsByUser[log.userId] || 0) + 1;
        }
      }

      // Get top users by activity
      const topUsers = Object.entries(eventsByUser)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([userId, count]) => ({ userId, count }));

      // Get recent critical events
      const criticalEvents = logs
        .filter(log => log.level === this.auditLevels.CRITICAL)
        .slice(0, 10);

      return {
        totalEvents,
        eventsByLevel,
        eventsByCategory,
        eventsByAction,
        topUsers,
        criticalEvents,
        period: { startDate, endDate },
      };
    } catch (error) {
      console.error('Get audit statistics error:', error);
      throw error;
    }
  }

  // Search audit logs
  async searchAuditLogs(query, filters = {}) {
    try {
      const { limit = 100, offset = 0 } = filters;

      let logs = [...this.auditLogs];

      // Apply search query
      if (query) {
        const searchTerm = query.toLowerCase();
        logs = logs.filter(log => 
          log.description.toLowerCase().includes(searchTerm) ||
          log.action.toLowerCase().includes(searchTerm) ||
          log.category.toLowerCase().includes(searchTerm) ||
          (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm))
        );
      }

      // Sort by timestamp (newest first)
      logs.sort((a, b) => b.timestamp - a.timestamp);

      // Apply pagination
      const total = logs.length;
      const paginatedLogs = logs.slice(offset, offset + limit);

      return {
        logs: paginatedLogs,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        query,
      };
    } catch (error) {
      console.error('Search audit logs error:', error);
      throw error;
    }
  }

  // Export audit logs
  async exportAuditLogs(filters = {}, format = 'json') {
    try {
      const { logs } = await this.getAuditLogs({ ...filters, limit: 10000 });

      switch (format.toLowerCase()) {
        case 'json':
          return {
            format: 'json',
            data: JSON.stringify(logs, null, 2),
            filename: `audit_logs_${Date.now()}.json`,
          };
        case 'csv':
          return {
            format: 'csv',
            data: this.convertLogsToCSV(logs),
            filename: `audit_logs_${Date.now()}.csv`,
          };
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Export audit logs error:', error);
      throw error;
    }
  }

  // Helper methods
  generateAuditId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async storeAuditLog(auditLog) {
    try {
      // This would typically store in a database
      // For now, we'll just log to console
      console.log('Audit log stored:', auditLog.id);
    } catch (error) {
      console.error('Store audit log error:', error);
    }
  }

  logToConsole(auditLog) {
    const timestamp = auditLog.timestamp.toISOString();
    const level = auditLog.level.toUpperCase();
    const message = `[${timestamp}] [${level}] [${auditLog.category}] ${auditLog.description}`;

    switch (auditLog.level) {
      case this.auditLevels.ERROR:
      case this.auditLevels.CRITICAL:
        console.error(message);
        break;
      case this.auditLevels.WARNING:
        console.warn(message);
        break;
      default:
        console.log(message);
    }
  }

  async sendCriticalAlert(auditLog) {
    try {
      // Send notification to administrators
      const adminUsers = await User.find({ role: 'admin' });
      
      const notificationService = require('./notificationService');
      
      for (const admin of adminUsers) {
        await notificationService.sendEmailNotifications([admin], 'critical-audit-alert', {
          auditLog,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Send critical alert error:', error);
    }
  }

  convertLogsToCSV(logs) {
    try {
      const headers = [
        'ID',
        'User ID',
        'Action',
        'Category',
        'Level',
        'Description',
        'IP Address',
        'Resource ID',
        'Resource Type',
        'Timestamp',
      ];

      const lines = [headers.join(',')];

      for (const log of logs) {
        const row = [
          log.id,
          log.userId || '',
          log.action,
          log.category,
          log.level,
          `"${log.description.replace(/"/g, '""')}"`,
          log.ipAddress || '',
          log.resourceId || '',
          log.resourceType || '',
          log.timestamp.toISOString(),
        ];
        lines.push(row.join(','));
      }

      return lines.join('\n');
    } catch (error) {
      console.error('Convert logs to CSV error:', error);
      return '';
    }
  }

  // Clean up old audit logs
  async cleanupOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const initialCount = this.auditLogs.length;
      this.auditLogs = this.auditLogs.filter(log => log.timestamp >= cutoffDate);
      const finalCount = this.auditLogs.length;
      
      console.log(`🧹 Cleaned up ${initialCount - finalCount} old audit logs`);
      
      return {
        logsRemoved: initialCount - finalCount,
        logsRemaining: finalCount,
        cutoffDate,
      };
    } catch (error) {
      console.error('Cleanup old logs error:', error);
      throw error;
    }
  }

  // Get audit service status
  getStatus() {
    return {
      totalLogs: this.auditLogs.length,
      maxLogs: this.maxLogs,
      isActive: true,
      lastCleanup: new Date().toISOString(),
    };
  }
}

module.exports = new AuditService(); 