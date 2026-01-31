import { API_BASE_URL } from '../config/api';

export interface MarketingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string[];
  features: string[];
  slide_order: number;
}

export interface MarketingContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  priority: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  content_types: {
    name: string;
    description: string;
  };
  categories: {
    name: string;
    color: string;
  };
  slideData?: MarketingSlide;
}

class MarketingService {
  private baseUrl = `${API_BASE_URL}/cms/marketing`;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

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

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheFor(key: string): void {
    this.cache.delete(key);
  }

  async getMarketingSlides(): Promise<MarketingSlide[]> {
    const cacheKey = 'marketing-slides';
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      const response = await fetch(`${this.baseUrl}/slides`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const slides = data.slides.map((slide: MarketingContent) => slide.slideData);
      this.setCachedData(cacheKey, slides);
      return slides;
    } catch (error) {
      console.error('Error fetching marketing slides:', error);
      // Return fallback slides if API fails
      return this.getFallbackSlides();
    }
  }

  async getMarketingContent(): Promise<MarketingContent[]> {
    const cacheKey = 'marketing-content';
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.baseUrl}/content`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data.content);
      return data.content;
    } catch (error) {
      console.error('Error fetching marketing content:', error);
      return [];
    }
  }

  async getMarketingContentById(contentId: string): Promise<MarketingContent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/content/${contentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error fetching marketing content:', error);
      return null;
    }
  }

  private getFallbackSlides(): MarketingSlide[] {
    return [
      {
        id: '1',
        title: 'Stay Connected',
        subtitle: 'With Your Circle',
        description: 'Keep your loved ones close with real-time location sharing, instant messaging, and circle updates.',
        icon: 'home-heart',
        gradient: ['#FA7272', '#FFBBB4'],
        features: [
          'Real-time location tracking',
          'Instant circle messaging',
          'Safety alerts & notifications'
        ],
        slide_order: 1
      },
      {
        id: '2',
        title: 'Safety First',
        subtitle: 'Always Protected',
        description: 'Emergency alerts, geofencing, and safety features to ensure your circle\'s security and peace of mind.',
        icon: 'shield-check',
        gradient: ['#FA7272', '#FFBBB4'],
        features: [
          'Emergency panic button',
          'Geofence alerts',
          'Inactivity monitoring'
        ],
        slide_order: 2
      },
      {
        id: '3',
        title: 'Share Moments',
        subtitle: 'Create Memories',
        description: 'Share photos, videos, and memories with your circle in a secure, private environment.',
        icon: 'camera-plus',
        gradient: ['#FA7272', '#FFBBB4'],
        features: [
          'Circle photo gallery',
          'Secure file sharing',
          'Memory timeline'
        ],
        slide_order: 3
      },
      {
        id: '4',
        title: 'Organize Life',
        subtitle: 'Together',
        description: 'Manage circle schedules, tasks, and events with shared calendars and to-do lists.',
        icon: 'calendar-check',
        gradient: ['#FA7272', '#FFBBB4'],
        features: [
          'Shared circle calendar',
          'Task management',
          'Event planning'
        ],
        slide_order: 4
      }
    ];
  }
}

export default new MarketingService();

