import { API_BASE_URL } from '../config/api';

export interface ModalMarketingContent {
  id: string;
  title: string;
  content: string;
  modal_type: 'popup' | 'banner' | 'notification' | 'promotion' | 'announcement';
  trigger_type: 'immediate' | 'delayed' | 'user_action' | 'time_based' | 'location_based';
  trigger_delay: number;
  trigger_conditions?: any;
  display_settings: any;
  target_audience: any;
  priority: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  max_views_per_user: number;
  max_views_total?: number;
  current_views: number;
  created_at: string;
  updated_at: string;
}

export interface ModalAnalytics {
  id: string;
  modal_id: string;
  user_id?: string;
  family_id?: string;
  action_type: 'view' | 'click' | 'close' | 'dismiss' | 'interact';
  action_data?: any;
  device_info?: any;
  location_data?: any;
  created_at: string;
}

class ModalMarketingService {
  private baseUrl = `${API_BASE_URL}/cms/modal-marketing`;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 2 * 60 * 1000; // 2 minutes for modal content
  private viewedModals: Set<string> = new Set();

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getActiveModals(userId?: string, familyId?: string): Promise<ModalMarketingContent[]> {
    const cacheKey = `active-modals-${userId}-${familyId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (familyId) params.append('familyId', familyId);

      const response = await fetch(`${this.baseUrl}/active?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const modals = data.modals || [];
      
      // Filter out already viewed modals
      const filteredModals = modals.filter((modal: ModalMarketingContent) => 
        !this.viewedModals.has(modal.id)
      );

      this.setCachedData(cacheKey, filteredModals);
      return filteredModals;
    } catch (error) {
      console.error('Error fetching active modals:', error);
      return [];
    }
  }

  async trackModalInteraction(
    modalId: string,
    actionType: 'view' | 'click' | 'close' | 'dismiss' | 'interact',
    userId?: string,
    familyId?: string,
    actionData?: any
  ): Promise<void> {
    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: {
          width: window.screen.width,
          height: window.screen.height
        }
      };

      const locationData = await this.getLocationData();

      await fetch(`${this.baseUrl}/track/${modalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          familyId,
          actionType,
          actionData,
          deviceInfo,
          locationData
        })
      });

      // Mark modal as viewed if it's a view action
      if (actionType === 'view') {
        this.viewedModals.add(modalId);
      }
    } catch (error) {
      console.error('Error tracking modal interaction:', error);
    }
  }

  private async getLocationData(): Promise<any> {
    try {
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
            },
            () => resolve(null),
            { timeout: 5000, enableHighAccuracy: false }
          );
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
    return null;
  }

  shouldShowModal(modal: ModalMarketingContent): boolean {
    // Check if modal is active
    if (!modal.is_active) return false;

    // Check date range
    const now = new Date();
    if (modal.start_date && new Date(modal.start_date) > now) return false;
    if (modal.end_date && new Date(modal.end_date) < now) return false;

    // Check if already viewed
    if (this.viewedModals.has(modal.id)) return false;

    // Check trigger conditions
    if (modal.trigger_conditions) {
      // Implement specific trigger condition checks here
      // For example: user_type, family_size, location, etc.
    }

    return true;
  }

  getModalDisplaySettings(modal: ModalMarketingContent): any {
    return {
      width: modal.display_settings?.width || '90%',
      height: modal.display_settings?.height || 'auto',
      position: modal.display_settings?.position || 'center',
      animation: modal.display_settings?.animation || 'fadeIn',
      overlay: modal.display_settings?.overlay !== false,
      ...modal.display_settings
    };
  }

  getModalTriggerSettings(modal: ModalMarketingContent): any {
    return {
      type: modal.trigger_type,
      delay: modal.trigger_delay,
      conditions: modal.trigger_conditions
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheFor(key: string): void {
    this.cache.delete(key);
  }

  resetViewedModals(): void {
    this.viewedModals.clear();
  }

  // Get modal analytics (for admin use)
  async getModalAnalytics(modalId: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${this.baseUrl}/analytics/${modalId}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.analytics;
    } catch (error) {
      console.error('Error fetching modal analytics:', error);
      return null;
    }
  }

  // Get modal dashboard stats (for admin use)
  async getModalDashboard(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${this.baseUrl}/dashboard?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.dashboard;
    } catch (error) {
      console.error('Error fetching modal dashboard:', error);
      return null;
    }
  }
}

export default new ModalMarketingService();
