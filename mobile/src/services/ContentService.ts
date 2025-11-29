import { API_BASE_URL } from '../config/api';

export interface ContentPage {
  id: string;
  title: string;
  slug: string;
  type: 'marketing' | 'news' | 'inspiration' | 'popup';
  status: 'draft' | 'published' | 'archived';
  components: ContentComponent[];
  mobileDisplay: {
    showOnLogin: boolean;
    showOnHome: boolean;
    showOnNews: boolean;
    showAsPopup: boolean;
    popupTrigger: 'immediate' | 'after_delay' | 'on_action';
    popupDelay?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContentComponent {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'container' | 'button' | 'spacer';
  props: Record<string, any>;
  children?: ContentComponent[];
  order: number;
}

export interface ContentAnalytics {
  views: number;
  clicks: number;
  conversions: number;
  lastViewed?: string;
}

class ContentService {
  private baseUrl = `${API_BASE_URL}/cms/mobile`;

  /**
   * Get content for mobile app based on display rules
   */
  async getMobileContent(params?: {
    type?: string;
    showOnLogin?: boolean;
    showOnHome?: boolean;
    showOnNews?: boolean;
    showAsPopup?: boolean;
  }): Promise<ContentPage[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.type) queryParams.append('type', params.type);
      if (params?.showOnLogin) queryParams.append('show_on_login', 'true');
      if (params?.showOnHome) queryParams.append('show_on_home', 'true');
      if (params?.showOnNews) queryParams.append('show_on_news', 'true');
      if (params?.showAsPopup) queryParams.append('show_as_popup', 'true');

      const response = await fetch(`${this.baseUrl}/content?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.content || [];
    } catch (error) {
      console.error('Error fetching mobile content:', error);
      return [];
    }
  }

  /**
   * Get marketing content for login screen
   */
  async getMarketingContent(): Promise<ContentPage[]> {
    return this.getMobileContent({
      type: 'marketing',
      showOnLogin: true
    });
  }

  /**
   * Get news and inspiration content
   */
  async getNewsContent(): Promise<ContentPage[]> {
    return this.getMobileContent({
      type: 'news',
      showOnNews: true
    });
  }

  /**
   * Get popup content for home screen
   */
  async getPopupContent(): Promise<ContentPage[]> {
    return this.getMobileContent({
      showAsPopup: true
    });
  }

  /**
   * Track content view
   */
  async trackContentView(pageId: string, userId?: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/content/${pageId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Error tracking content view:', error);
    }
  }

  /**
   * Track content interaction (click, conversion, etc.)
   */
  async trackContentInteraction(
    pageId: string,
    interactionType: 'click' | 'conversion' | 'share' | 'like',
    componentId?: string,
    metadata?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/content/${pageId}/interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interactionType,
          componentId,
          metadata,
          userId,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Error tracking content interaction:', error);
    }
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(pageId: string): Promise<ContentAnalytics | null> {
    try {
      const response = await fetch(`${this.baseUrl}/content/${pageId}/analytics`, {
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
      console.error('Error fetching content analytics:', error);
      return null;
    }
  }
}

export const contentService = new ContentService();
