import { apiClient } from '../api/apiClient';
import { analyticsService } from '../analytics/AnalyticsService';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
}

export interface SystemStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    premium: number;
  };
  families: {
    total: number;
    active: number;
    averageSize: number;
  };
  revenue: {
    monthly: number;
    yearly: number;
    growth: number;
  };
  performance: {
    averageResponseTime: number;
    uptime: number;
    errorRate: number;
  };
  storage: {
    total: number;
    used: number;
    available: number;
  };
}

export interface AdminReport {
  id: string;
  type: 'user_activity' | 'system_performance' | 'revenue' | 'security' | 'custom';
  title: string;
  description: string;
  data: any;
  filters: any;
  generatedAt: Date;
  expiresAt: Date;
  downloadUrl?: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  action: string;
  target: string;
  targetId: string;
  details: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

class AdminService {
  async getSystemStats(): Promise<SystemStats> {
    try {
      const response = await apiClient.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to get system stats:', error);
      throw error;
    }
  }

  async getUsers(filters?: {
    role?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  }): Promise<{
    users: AdminUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.role) params.append('role', filters.role);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters?.search) params.append('search', filters.search);

      const response = await apiClient.get(`/admin/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get users:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<AdminUser> {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    try {
      const response = await apiClient.put(`/admin/users/${userId}`, updates);
      
      analyticsService.trackEvent('admin_user_updated', {
        userId,
        updatedFields: Object.keys(updates)
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  async suspendUser(userId: string, reason: string): Promise<void> {
    try {
      await apiClient.post(`/admin/users/${userId}/suspend`, { reason });
      
      analyticsService.trackEvent('admin_user_suspended', {
        userId,
        reason
      });
    } catch (error) {
      console.error('Failed to suspend user:', error);
      throw error;
    }
  }

  async unsuspendUser(userId: string): Promise<void> {
    try {
      await apiClient.post(`/admin/users/${userId}/unsuspend`);
      
      analyticsService.trackEvent('admin_user_unsuspended', {
        userId
      });
    } catch (error) {
      console.error('Failed to unsuspend user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string, reason: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/users/${userId}`, { data: { reason } });
      
      analyticsService.trackEvent('admin_user_deleted', {
        userId,
        reason
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }

  async getFamilies(filters?: {
    status?: string;
    size?: number;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  }): Promise<{
    families: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.size) params.append('size', filters.size.toString());
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters?.search) params.append('search', filters.search);

      const response = await apiClient.get(`/admin/families?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get families:', error);
      throw error;
    }
  }

  async getFamily(familyId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/admin/families/${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get hourse:', error);
      throw error;
    }
  }

  async updateFamily(familyId: string, updates: any): Promise<any> {
    try {
      const response = await apiClient.put(`/admin/families/${familyId}`, updates);
      
      analyticsService.trackEvent('admin_family_updated', {
        familyId,
        updatedFields: Object.keys(updates)
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update hourse:', error);
      throw error;
    }
  }

  async deleteFamily(familyId: string, reason: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/families/${familyId}`, { data: { reason } });
      
      analyticsService.trackEvent('admin_family_deleted', {
        familyId,
        reason
      });
    } catch (error) {
      console.error('Failed to delete hourse:', error);
      throw error;
    }
  }

  async getReports(type?: string): Promise<AdminReport[]> {
    try {
      const params = type ? `?type=${type}` : '';
      const response = await apiClient.get(`/admin/reports${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get reports:', error);
      throw error;
    }
  }

  async generateReport(report: {
    type: string;
    title: string;
    description: string;
    filters: any;
  }): Promise<AdminReport> {
    try {
      const response = await apiClient.post('/admin/reports', report);
      
      analyticsService.trackEvent('admin_report_generated', {
        type: report.type,
        title: report.title
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  async downloadReport(reportId: string): Promise<string> {
    try {
      const response = await apiClient.get(`/admin/reports/${reportId}/download`);
      
      analyticsService.trackEvent('admin_report_downloaded', {
        reportId
      });
      
      return response.data.downloadUrl;
    } catch (error) {
      console.error('Failed to download report:', error);
      throw error;
    }
  }

  async getAdminActions(filters?: {
    adminId?: string;
    action?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<{
    actions: AdminAction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.adminId) params.append('adminId', filters.adminId);
      if (filters?.action) params.append('action', filters.action);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());

      const response = await apiClient.get(`/admin/actions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get admin actions:', error);
      throw error;
    }
  }

  async getSystemAlerts(): Promise<SystemAlert[]> {
    try {
      const response = await apiClient.get('/admin/alerts');
      return response.data;
    } catch (error) {
      console.error('Failed to get system alerts:', error);
      throw error;
    }
  }

  async createSystemAlert(alert: Omit<SystemAlert, 'id' | 'createdAt'>): Promise<SystemAlert> {
    try {
      const response = await apiClient.post('/admin/alerts', alert);
      
      analyticsService.trackEvent('admin_alert_created', {
        type: alert.type,
        severity: alert.severity
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create system alert:', error);
      throw error;
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      await apiClient.post(`/admin/alerts/${alertId}/resolve`);
      
      analyticsService.trackEvent('admin_alert_resolved', {
        alertId
      });
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      throw error;
    }
  }

  async getSystemLogs(filters?: {
    level?: string;
    service?: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  }): Promise<{
    logs: Array<{
      id: string;
      level: string;
      service: string;
      message: string;
      timestamp: Date;
      metadata: any;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.level) params.append('level', filters.level);
      if (filters?.service) params.append('service', filters.service);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters?.search) params.append('search', filters.search);

      const response = await apiClient.get(`/admin/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get system logs:', error);
      throw error;
    }
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    services: Array<{
      name: string;
      status: 'up' | 'down' | 'degraded';
      responseTime: number;
      lastCheck: Date;
    }>;
    databases: Array<{
      name: string;
      status: 'up' | 'down';
      connections: number;
      lastCheck: Date;
    }>;
    storage: {
      total: number;
      used: number;
      available: number;
      status: 'ok' | 'warning' | 'critical';
    };
  }> {
    try {
      const response = await apiClient.get('/admin/health');
      return response.data;
    } catch (error) {
      console.error('Failed to get system health:', error);
      throw error;
    }
  }

  async restartService(serviceName: string): Promise<void> {
    try {
      await apiClient.post(`/admin/services/${serviceName}/restart`);
      
      analyticsService.trackEvent('admin_service_restarted', {
        serviceName
      });
    } catch (error) {
      console.error('Failed to restart service:', error);
      throw error;
    }
  }

  async clearCache(cacheType: string): Promise<void> {
    try {
      await apiClient.post(`/admin/cache/${cacheType}/clear`);
      
      analyticsService.trackEvent('admin_cache_cleared', {
        cacheType
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  async backupDatabase(): Promise<{
    backupId: string;
    size: number;
    downloadUrl: string;
  }> {
    try {
      const response = await apiClient.post('/admin/database/backup');
      
      analyticsService.trackEvent('admin_database_backup_created', {
        backupId: response.data.backupId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to backup database:', error);
      throw error;
    }
  }

  async getBackupStatus(backupId: string): Promise<{
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress: number;
    downloadUrl?: string;
  }> {
    try {
      const response = await apiClient.get(`/admin/database/backup/${backupId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get backup status:', error);
      throw error;
    }
  }

  async sendSystemNotification(notification: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error';
    targetUsers?: string[];
    targetFamilies?: string[];
  }): Promise<void> {
    try {
      await apiClient.post('/admin/notifications/send', notification);
      
      analyticsService.trackEvent('admin_notification_sent', {
        type: notification.type,
        targetUsersCount: notification.targetUsers?.length,
        targetFamiliesCount: notification.targetFamilies?.length
      });
    } catch (error) {
      console.error('Failed to send system notification:', error);
      throw error;
    }
  }

  async getAnalytics(filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    metric?: string;
    groupBy?: string;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters?.metric) params.append('metric', filters.metric);
      if (filters?.groupBy) params.append('groupBy', filters.groupBy);

      const response = await apiClient.get(`/admin/analytics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService(); 