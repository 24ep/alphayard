/**
 * Identity Management API Service for Mobile
 * Handles sessions, devices, MFA, security settings, and login history
 */

import { api } from './index';

// =====================================================
// INTERFACES
// =====================================================

export interface UserSession {
  id: string;
  userId: string;
  deviceType?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  location?: string;
  isActive: boolean;
  isCurrent?: boolean;
  lastActivityAt: string;
  expiresAt: string;
  createdAt: string;
  isExpired?: boolean;
}

export interface UserDevice {
  id: string;
  userId: string;
  deviceFingerprint?: string;
  deviceName?: string;
  deviceType: string;
  brand?: string;
  model?: string;
  osName?: string;
  osVersion?: string;
  browserName?: string;
  browserVersion?: string;
  appVersion?: string;
  isTrusted: boolean;
  isCurrent?: boolean;
  isBlocked?: boolean;
  firstSeenAt?: string;
  lastSeenAt: string;
  lastIpAddress?: string;
  lastLocationCountry?: string;
  lastLocationCity?: string;
  loginCount?: number;
  createdAt: string;
}

export interface UserMFA {
  id: string;
  userId: string;
  mfaType: 'totp' | 'sms' | 'email';
  isEnabled: boolean;
  isVerified?: boolean;
  lastUsedAt?: string;
  backupCodesRemaining?: number;
  createdAt: string;
}

export interface MFASetupResponse {
  mfaType: string;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  message: string;
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  method: string;
  success: boolean;
  failureReason?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  deviceType?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  isSuspicious?: boolean;
  riskScore?: number;
  createdAt: string;
}

export interface SecuritySettings {
  passwordLastChanged?: string;
  mfaEnabled: boolean;
  mfaMethods: string[];
  trustedDevicesCount: number;
  activeSessionsCount: number;
  lastLoginAt?: string;
  lastLoginLocation?: string;
  accountLocked?: boolean;
  accountLockedUntil?: string;
}

// =====================================================
// SESSION MANAGEMENT
// =====================================================

export const identityApi = {
  // Get all sessions for current user
  getSessions: async (includeExpired = false): Promise<{ sessions: UserSession[]; total: number }> => {
    const response = await api.get(`/identity/sessions`, {
      params: { includeExpired }
    });
    return response.data;
  },

  // Revoke a specific session
  revokeSession: async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/identity/sessions/${sessionId}/revoke`);
    return response.data;
  },

  // Revoke all sessions except current
  revokeAllSessions: async (): Promise<{ success: boolean; revokedCount: number }> => {
    const response = await api.post('/identity/sessions/revoke-all');
    return response.data;
  },

  // =====================================================
  // DEVICE MANAGEMENT
  // =====================================================

  // Get all devices for current user
  getDevices: async (): Promise<{ devices: UserDevice[]; total: number }> => {
    const response = await api.get('/identity/devices');
    return response.data;
  },

  // Trust a device
  trustDevice: async (deviceId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/identity/devices/${deviceId}/trust`);
    return response.data;
  },

  // Block a device
  blockDevice: async (deviceId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/identity/devices/${deviceId}/block`);
    return response.data;
  },

  // Remove a device
  removeDevice: async (deviceId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/identity/devices/${deviceId}`);
    return response.data;
  },

  // =====================================================
  // MFA MANAGEMENT
  // =====================================================

  // Get MFA settings
  getMFASettings: async (): Promise<{ mfaSettings: UserMFA[]; backupCodesRemaining?: number }> => {
    const response = await api.get('/identity/mfa');
    return response.data;
  },

  // Setup MFA (initiate)
  setupMFA: async (mfaType: 'totp' | 'sms' | 'email'): Promise<MFASetupResponse> => {
    const response = await api.post('/identity/mfa/setup', { mfaType });
    return response.data;
  },

  // Verify MFA setup
  verifyMFASetup: async (mfaType: string, code: string): Promise<{ success: boolean; backupCodes?: string[] }> => {
    const response = await api.post('/identity/mfa/verify', { mfaType, code });
    return response.data;
  },

  // Disable MFA
  disableMFA: async (mfaType: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/identity/mfa/disable', { mfaType, password });
    return response.data;
  },

  // Get new backup codes
  regenerateBackupCodes: async (password: string): Promise<{ backupCodes: string[] }> => {
    const response = await api.post('/identity/mfa/backup-codes', { password });
    return response.data;
  },

  // =====================================================
  // LOGIN HISTORY
  // =====================================================

  // Get login history
  getLoginHistory: async (options?: {
    page?: number;
    limit?: number;
    success?: boolean;
  }): Promise<{ history: LoginHistoryEntry[]; total: number; page: number; totalPages: number }> => {
    const response = await api.get('/identity/login-history', { params: options });
    return response.data;
  },

  // =====================================================
  // SECURITY SETTINGS
  // =====================================================

  // Get security overview
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    const response = await api.get('/identity/security');
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/identity/security/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Request account deletion
  requestAccountDeletion: async (password: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/identity/account/delete-request', { password, reason });
    return response.data;
  },

  // Export user data (GDPR)
  requestDataExport: async (): Promise<{ success: boolean; message: string; estimatedTime?: string }> => {
    const response = await api.post('/identity/account/export-data');
    return response.data;
  },
};

export default identityApi;
