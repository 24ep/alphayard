import { apiClient } from '../api/apiClient';
import { analyticsService } from '../analytics/AnalyticsService';
import authService from '../auth/AuthService';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bio?: string;
  location?: {
    city: string;
    country: string;
    timezone: string;
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      push: boolean;
      email: boolean;
      sms: boolean;
      inApp: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'hourse' | 'private';
      locationSharing: boolean;
      activitySharing: boolean;
      dataCollection: boolean;
    };
    accessibility: {
      largeText: boolean;
      highContrast: boolean;
      reducedMotion: boolean;
      screenReader: boolean;
    };
  };
  stats: {
    joinDate: Date;
    lastActive: Date;
    totalLogins: number;
    familyCount: number;
    messageCount: number;
    locationShares: number;
  };
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'hourse';
    status: 'active' | 'inactive' | 'cancelled' | 'expired';
    startDate: Date;
    endDate?: Date;
    autoRenew: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  notifications: {
    familyUpdates: boolean;
    locationAlerts: boolean;
    safetyAlerts: boolean;
    chatMessages: boolean;
    reminders: boolean;
    marketing: boolean;
  };
  privacy: {
    shareProfile: boolean;
    shareLocation: boolean;
    shareActivity: boolean;
    allowTracking: boolean;
    dataRetention: number; // days
  };
  security: {
    twoFactorAuth: boolean;
    biometricAuth: boolean;
    sessionTimeout: number; // minutes
    passwordChangeRequired: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    language: string;
    timezone: string;
  };
  accessibility: {
    screenReader: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    voiceControl: boolean;
  };
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'profile_update' | 'location_share' | 'message_sent' | 'family_action' | 'safety_check' | 'subscription_change';
  description: string;
  metadata?: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

class UserService {
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await apiClient.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.put(`/users/${userId}/profile`, updates);
      
      analyticsService.trackEvent('user_profile_updated', {
        userId,
        updatedFields: Object.keys(updates)
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  async uploadAvatar(userId: string, imageFile: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', imageFile);

      const response = await apiClient.post(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      analyticsService.trackEvent('user_avatar_uploaded', {
        userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  }

  async deleteAvatar(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${userId}/avatar`);
      
      analyticsService.trackEvent('user_avatar_deleted', {
        userId
      });
    } catch (error) {
      console.error('Failed to delete avatar:', error);
      throw error;
    }
  }

  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const response = await apiClient.get(`/users/${userId}/settings`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user settings:', error);
      throw error;
    }
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await apiClient.put(`/users/${userId}/settings`, updates);
      
      analyticsService.trackEvent('user_settings_updated', {
        userId,
        updatedSections: Object.keys(updates)
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw error;
    }
  }

  async getUserActivity(userId: string, page: number = 1, limit: number = 20): Promise<{
    activities: UserActivity[];
    totalPages: number;
    currentPage: number;
    totalActivities: number;
  }> {
    try {
      const response = await apiClient.get(`/users/${userId}/activity?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user activity:', error);
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<{
    totalLogins: number;
    lastLogin: Date;
    familyCount: number;
    messageCount: number;
    locationShares: number;
    safetyChecks: number;
    subscriptionDays: number;
  }> {
    try {
      const response = await apiClient.get(`/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      throw error;
    }
  }

  async changePasswordInternal(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post(`/users/${userId}/change-password`, {
        currentPassword,
        newPassword
      });
      
      analyticsService.trackEvent('user_password_changed', {
        userId
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }

  async enableTwoFactorAuth(userId: string): Promise<{
    qrCode: string;
    secret: string;
    backupCodes: string[];
  }> {
    try {
      const response = await apiClient.post(`/users/${userId}/2fa/enable`);
      
      analyticsService.trackEvent('user_2fa_enabled', {
        userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      throw error;
    }
  }

  async disableTwoFactorAuth(userId: string, code: string): Promise<void> {
    try {
      await apiClient.post(`/users/${userId}/2fa/disable`, { code });
      
      analyticsService.trackEvent('user_2fa_disabled', {
        userId
      });
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      throw error;
    }
  }

  async verifyTwoFactorAuth(userId: string, code: string): Promise<{ verified: boolean }> {
    try {
      const response = await apiClient.post(`/users/${userId}/2fa/verify`, { code });
      return response.data;
    } catch (error) {
      console.error('Failed to verify 2FA:', error);
      throw error;
    }
  }

  async getBackupCodes(userId: string): Promise<string[]> {
    try {
      const response = await apiClient.get(`/users/${userId}/2fa/backup-codes`);
      return response.data;
    } catch (error) {
      console.error('Failed to get backup codes:', error);
      throw error;
    }
  }

  async regenerateBackupCodes(userId: string): Promise<string[]> {
    try {
      const response = await apiClient.post(`/users/${userId}/2fa/regenerate-codes`);
      
      analyticsService.trackEvent('user_backup_codes_regenerated', {
        userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to regenerate backup codes:', error);
      throw error;
    }
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    try {
      await apiClient.post(`/users/${userId}/delete-account`, { password });
      
      analyticsService.trackEvent('user_account_deleted', {
        userId
      });
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }

  async exportUserData(userId: string, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<string> {
    try {
      const response = await apiClient.get(`/users/${userId}/export?format=${format}`);
      
      analyticsService.trackEvent('user_data_exported', {
        userId,
        format
      });
      
      return response.data.downloadUrl;
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  async getActiveSessions(userId: string): Promise<Array<{
    id: string;
    device: string;
    location: string;
    lastActive: Date;
    ipAddress: string;
  }>> {
    try {
      const response = await apiClient.get(`/users/${userId}/sessions`);
      return response.data;
    } catch (error) {
      console.error('Failed to get active sessions:', error);
      throw error;
    }
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${userId}/sessions/${sessionId}`);
      
      analyticsService.trackEvent('user_session_revoked', {
        userId,
        sessionId
      });
    } catch (error) {
      console.error('Failed to revoke session:', error);
      throw error;
    }
  }

  async revokeAllSessions(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${userId}/sessions`);
      
      analyticsService.trackEvent('user_all_sessions_revoked', {
        userId
      });
    } catch (error) {
      console.error('Failed to revoke all sessions:', error);
      throw error;
    }
  }

  async getPrivacySettings(userId: string): Promise<{
    dataSharing: boolean;
    analytics: boolean;
    marketing: boolean;
    thirdParty: boolean;
    dataRetention: number;
  }> {
    try {
      const response = await apiClient.get(`/users/${userId}/privacy`);
      return response.data;
    } catch (error) {
      console.error('Failed to get privacy settings:', error);
      throw error;
    }
  }

  async updatePrivacySettings(userId: string, settings: any): Promise<void> {
    try {
      await apiClient.put(`/users/${userId}/privacy`, settings);
      
      analyticsService.trackEvent('user_privacy_settings_updated', {
        userId,
        settings: Object.keys(settings)
      });
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      throw error;
    }
  }

  async requestDataDeletion(userId: string, reason?: string): Promise<{
    requestId: string;
    estimatedCompletion: Date;
  }> {
    try {
      const response = await apiClient.post(`/users/${userId}/data-deletion`, { reason });
      
      analyticsService.trackEvent('user_data_deletion_requested', {
        userId,
        reason
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to request data deletion:', error);
      throw error;
    }
  }

  async getDataDeletionStatus(userId: string, requestId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    estimatedCompletion?: Date;
  }> {
    try {
      const response = await apiClient.get(`/users/${userId}/data-deletion/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get data deletion status:', error);
      throw error;
    }
  }

  // Profile cache
  private profileCache: UserProfile | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Enhanced profile management with caching
  async getProfile(useCache: boolean = true): Promise<{ data: UserProfile }> {
    try {
      // Check cache first
      if (useCache && this.profileCache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
        return { data: this.profileCache };
      }

      // Mock data for development - replace with actual API call
      const mockProfile: UserProfile = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+1 (555) 123-4567',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        bio: 'hourse-oriented person who loves technology and outdoor activities.',
        preferences: {
          language: 'en',
          theme: 'auto',
          notifications: {
            push: true,
            email: true,
            sms: false,
          },
          privacy: {
            locationSharing: true,
            profileVisibility: 'hourse',
            dataSharing: true,
          },
          hourse: {
            autoJoin: true,
            locationUpdates: true,
            eventReminders: true,
          },
        },
        subscription: {
          plan: 'premium',
          status: 'active',
          expiresAt: '2024-12-31T23:59:59Z',
        },
        emergencyContacts: [
          {
            id: 'contact-1',
            name: 'Sarah Doe',
            phoneNumber: '+1 (555) 987-6543',
            relationship: 'Spouse',
            isPrimary: true,
          },
          {
            id: 'contact-2',
            name: 'Michael Smith',
            phoneNumber: '+1 (555) 456-7890',
            relationship: 'Friend',
            isPrimary: false,
          },
          {
            id: 'contact-3',
            name: 'Dr. Emily Johnson',
            phoneNumber: '+1 (555) 321-0987',
            relationship: 'Doctor',
            isPrimary: false,
          },
        ],
        createdAt: '2023-01-15T10:30:00Z',
        lastActiveAt: '2024-01-15T14:22:00Z',
      };

      // Cache the profile
      this.profileCache = mockProfile;
      this.cacheTimestamp = Date.now();

      return { data: mockProfile };
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw new Error('Failed to load profile. Please try again.');
    }
  }

  // Update profile with optimistic updates
  async updateProfile(updates: Partial<UserProfile>): Promise<{ data: UserProfile }> {
    try {
      // Optimistic update
      if (this.profileCache) {
        this.profileCache = { ...this.profileCache, ...updates };
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In real implementation, make API call here
      const response = await this.getProfile(false);
      const updatedProfile = { ...response.data, ...updates };

      // Update cache
      this.profileCache = updatedProfile;
      this.cacheTimestamp = Date.now();

      return { data: updatedProfile };
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Revert optimistic update
      await this.getProfile(false);
      throw new Error('Failed to update profile. Please try again.');
    }
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<{ data: UserProfile['preferences'] }> {
    try {
      const profile = await this.getProfile();
      const updatedPreferences = { ...profile.data.preferences, ...preferences };
      
      await this.updateProfile({ preferences: updatedPreferences });
      
      return { data: updatedPreferences };
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw new Error('Failed to update preferences. Please try again.');
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Validate inputs
      if (!currentPassword || !newPassword) {
        throw new Error('Both current and new passwords are required.');
      }

      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long.');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real implementation, make API call here
      console.log('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to change password. Please try again.');
    }
  }

  // Upload avatar
  async uploadAvatar(imageUri: string): Promise<{ data: { avatar: string } }> {
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real implementation, upload to cloud storage
      const avatarUrl = `https://api.bondarys.com/avatars/${Date.now()}.jpg`;
      
      // Update profile with new avatar
      await this.updateProfile({ avatar: avatarUrl });
      
      return { data: { avatar: avatarUrl } };
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw new Error('Failed to upload avatar. Please try again.');
    }
  }

  // Delete account
  async deleteAccount(): Promise<void> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cache
      this.profileCache = null;
      this.cacheTimestamp = 0;

      console.log('Account deleted successfully');
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw new Error('Failed to delete account. Please try again.');
    }
  }

  // Clear cache
  clearCache(): void {
    this.profileCache = null;
    this.cacheTimestamp = 0;
  }

  // Get cached profile if available
  getCachedProfile(): UserProfile | null {
    if (this.profileCache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.profileCache;
    }
    return null;
  }

  async updateProfile(updates: any): Promise<{ data: any }> {
    try {
      // Mock update - simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return updated mock data
      const mockProfile = {
        id: 'user-123',
        firstName: updates.firstName || 'John',
        lastName: updates.lastName || 'Doe',
        email: updates.email || 'john.doe@example.com',
        phoneNumber: updates.phoneNumber || '+1 (555) 123-4567',
        avatar: updates.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: updates.dateOfBirth || '1990-05-15',
        gender: updates.gender || 'male',
        bio: updates.bio || 'hourse-oriented person who loves technology and outdoor activities.',
        preferences: {
          language: 'en',
          theme: 'auto',
          notifications: {
            push: true,
            email: true,
            sms: false,
          },
          privacy: {
            locationSharing: true,
            profileVisibility: 'hourse',
            dataSharing: true,
          },
          hourse: {
            autoJoin: true,
            locationUpdates: true,
            eventReminders: true,
          },
        },
        subscription: {
          plan: 'premium',
          status: 'active',
          expiresAt: '2024-12-31T23:59:59Z',
        },
        emergencyContacts: [
          {
            id: 'contact-1',
            name: 'Sarah Doe',
            phoneNumber: '+1 (555) 987-6543',
            relationship: 'Spouse',
            isPrimary: true,
          },
          {
            id: 'contact-2',
            name: 'Michael Smith',
            phoneNumber: '+1 (555) 456-7890',
            relationship: 'Friend',
            isPrimary: false,
          },
          {
            id: 'contact-3',
            name: 'Dr. Emily Johnson',
            phoneNumber: '+1 (555) 321-0987',
            relationship: 'Doctor',
            isPrimary: false,
          },
        ],
        createdAt: '2023-01-15T10:30:00Z',
        lastActiveAt: '2024-01-15T14:22:00Z',
      };

      return { data: mockProfile };
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Mock password change - simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate validation
      if (currentPassword !== 'currentPassword123') {
        throw new Error('Current password is incorrect');
      }
      
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }
      
      console.log('Password changed successfully (mock)');
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: any): Promise<{ data: any }> {
    try {
      // Mock preferences update - simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return updated preferences
      const updatedPreferences = {
        language: 'en',
        theme: 'auto',
        notifications: {
          push: preferences?.notifications?.push ?? true,
          email: preferences?.notifications?.email ?? true,
          sms: preferences?.notifications?.sms ?? false,
        },
        privacy: {
          locationSharing: preferences?.privacy?.locationSharing ?? true,
          profileVisibility: preferences?.privacy?.profileVisibility ?? 'hourse',
          dataSharing: preferences?.privacy?.dataSharing ?? true,
        },
        hourse: {
          autoJoin: preferences?.hourse?.autoJoin ?? true,
          locationUpdates: preferences?.hourse?.locationUpdates ?? true,
          eventReminders: preferences?.hourse?.eventReminders ?? true,
        },
      };

      return { data: updatedPreferences };
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      // Mock account deletion - simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Account deleted successfully (mock)');
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }



  private async getCurrentUser(): Promise<any> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      return currentUser;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }
}

export const userService = new UserService(); 