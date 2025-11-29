import { apiClient } from '../api/apiClient';
import { analyticsService } from '../analytics/AnalyticsService';

export interface EntertainmentItem {
  id: string;
  title: string;
  description: string;
  type: 'movie' | 'tv_show' | 'book' | 'game' | 'music' | 'podcast' | 'event' | 'activity';
  genre: string[];
  releaseDate: Date;
  duration?: number; // in minutes
  rating: number; // 1-10
  userRating?: number; // 1-5
  status: 'not_started' | 'watching' | 'completed' | 'paused' | 'dropped';
  progress?: number; // 0-100
  platform?: string; // Netflix, Amazon Prime, etc.
  language: string;
  country: string;
  cast?: string[];
  director?: string;
  producer?: string;
  awards?: string[];
  posterUrl?: string;
  trailerUrl?: string;
  isFamilyFriendly: boolean;
  ageRating?: string; // G, PG, PG-13, R, etc.
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EntertainmentList {
  id: string;
  userId: string;
  familyId: string;
  name: string;
  description?: string;
  type: 'watchlist' | 'favorites' | 'completed' | 'custom';
  items: EntertainmentItem[];
  isPublic: boolean;
  isShared: boolean;
  sharedWith: string[]; // hourse member IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface EntertainmentRecommendation {
  id: string;
  userId: string;
  familyId: string;
  item: EntertainmentItem;
  reason: string;
  confidence: number; // 0-1
  source: 'algorithm' | 'hourse' | 'trending' | 'similar';
  isViewed: boolean;
  createdAt: Date;
}

export interface EntertainmentPreferences {
  userId: string;
  familyId: string;
  genres: string[];
  platforms: string[];
  languages: string[];
  ageRating: string[];
  contentTypes: string[];
  notifications: {
    newReleases: boolean;
    recommendations: boolean;
    familyActivity: boolean;
    reminders: boolean;
  };
  privacy: {
    shareWatchHistory: boolean;
    shareRatings: boolean;
    shareLists: boolean;
    showProgress: boolean;
  };
}

export interface EntertainmentStats {
  totalItems: number;
  completedItems: number;
  watchTime: number; // in hours
  averageRating: number;
  topGenre: string;
  topPlatform: string;
  familyActivity: number;
  recommendationsViewed: number;
}

class EntertainmentService {
  async getEntertainmentItems(filters?: {
    type?: string;
    genre?: string;
    platform?: string;
    status?: string;
    rating?: number;
    familyFriendly?: boolean;
  }): Promise<EntertainmentItem[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.type) params.append('type', filters.type);
      if (filters?.genre) params.append('genre', filters.genre);
      if (filters?.platform) params.append('platform', filters.platform);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.rating) params.append('rating', filters.rating.toString());
      if (filters?.familyFriendly !== undefined) params.append('familyFriendly', filters.familyFriendly.toString());

      const response = await apiClient.get(`/entertainment/items?${params.toString()}`);
      
      analyticsService.trackEvent('entertainment_items_fetched', {
        filters: Object.keys(filters || {}).length,
        count: response.data.length
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get entertainment items:', error);
      throw error;
    }
  }

  async getEntertainmentItem(itemId: string): Promise<EntertainmentItem> {
    try {
      const response = await apiClient.get(`/entertainment/items/${itemId}`);
      
      analyticsService.trackEvent('entertainment_item_viewed', {
        itemId,
        type: response.data.type
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get entertainment item:', error);
      throw error;
    }
  }

  async searchEntertainment(query: string, filters?: {
    type?: string;
    genre?: string;
    platform?: string;
  }): Promise<EntertainmentItem[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      if (filters?.type) params.append('type', filters.type);
      if (filters?.genre) params.append('genre', filters.genre);
      if (filters?.platform) params.append('platform', filters.platform);

      const response = await apiClient.get(`/entertainment/search?${params.toString()}`);
      
      analyticsService.trackEvent('entertainment_search_performed', {
        query,
        filters: Object.keys(filters || {}).length,
        resultsCount: response.data.length
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to search entertainment:', error);
      throw error;
    }
  }

  async getUserLists(userId: string, familyId: string): Promise<EntertainmentList[]> {
    try {
      const response = await apiClient.get(`/entertainment/lists?userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user lists:', error);
      throw error;
    }
  }

  async createList(list: Omit<EntertainmentList, 'id' | 'createdAt' | 'updatedAt'>): Promise<EntertainmentList> {
    try {
      const response = await apiClient.post('/entertainment/lists', list);
      
      analyticsService.trackEvent('entertainment_list_created', {
        type: list.type,
        userId: list.userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create list:', error);
      throw error;
    }
  }

  async updateList(listId: string, updates: Partial<EntertainmentList>): Promise<EntertainmentList> {
    try {
      const response = await apiClient.put(`/entertainment/lists/${listId}`, updates);
      
      analyticsService.trackEvent('entertainment_list_updated', {
        listId,
        itemsCount: updates.items?.length
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update list:', error);
      throw error;
    }
  }

  async deleteList(listId: string): Promise<void> {
    try {
      await apiClient.delete(`/entertainment/lists/${listId}`);
      
      analyticsService.trackEvent('entertainment_list_deleted', {
        listId
      });
    } catch (error) {
      console.error('Failed to delete list:', error);
      throw error;
    }
  }

  async addItemToList(listId: string, itemId: string): Promise<void> {
    try {
      await apiClient.post(`/entertainment/lists/${listId}/items`, { itemId });
      
      analyticsService.trackEvent('entertainment_item_added_to_list', {
        listId,
        itemId
      });
    } catch (error) {
      console.error('Failed to add item to list:', error);
      throw error;
    }
  }

  async removeItemFromList(listId: string, itemId: string): Promise<void> {
    try {
      await apiClient.delete(`/entertainment/lists/${listId}/items/${itemId}`);
      
      analyticsService.trackEvent('entertainment_item_removed_from_list', {
        listId,
        itemId
      });
    } catch (error) {
      console.error('Failed to remove item from list:', error);
      throw error;
    }
  }

  async updateItemStatus(itemId: string, userId: string, status: string, progress?: number): Promise<void> {
    try {
      await apiClient.put(`/entertainment/items/${itemId}/status`, {
        userId,
        status,
        progress
      });
      
      analyticsService.trackEvent('entertainment_item_status_updated', {
        itemId,
        status,
        progress
      });
    } catch (error) {
      console.error('Failed to update item status:', error);
      throw error;
    }
  }

  async rateItem(itemId: string, userId: string, rating: number): Promise<void> {
    try {
      await apiClient.post(`/entertainment/items/${itemId}/rate`, {
        userId,
        rating
      });
      
      analyticsService.trackEvent('entertainment_item_rated', {
        itemId,
        rating
      });
    } catch (error) {
      console.error('Failed to rate item:', error);
      throw error;
    }
  }

  async getRecommendations(userId: string, familyId: string, limit: number = 10): Promise<EntertainmentRecommendation[]> {
    try {
      const response = await apiClient.get(`/entertainment/recommendations?userId=${userId}&familyId=${familyId}&limit=${limit}`);
      
      analyticsService.trackEvent('entertainment_recommendations_fetched', {
        userId,
        count: response.data.length
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      throw error;
    }
  }

  async markRecommendationAsViewed(recommendationId: string): Promise<void> {
    try {
      await apiClient.put(`/entertainment/recommendations/${recommendationId}/viewed`);
      
      analyticsService.trackEvent('entertainment_recommendation_viewed', {
        recommendationId
      });
    } catch (error) {
      console.error('Failed to mark recommendation as viewed:', error);
      throw error;
    }
  }

  async getUserPreferences(userId: string, familyId: string): Promise<EntertainmentPreferences> {
    try {
      const response = await apiClient.get(`/entertainment/preferences?userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId: string, familyId: string, preferences: Partial<EntertainmentPreferences>): Promise<EntertainmentPreferences> {
    try {
      const response = await apiClient.put(`/entertainment/preferences?userId=${userId}&familyId=${familyId}`, preferences);
      
      analyticsService.trackEvent('entertainment_preferences_updated', {
        userId,
        genresCount: preferences.genres?.length,
        platformsCount: preferences.platforms?.length
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  async getEntertainmentStats(userId: string, familyId: string): Promise<EntertainmentStats> {
    try {
      const response = await apiClient.get(`/entertainment/stats?userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get entertainment stats:', error);
      throw error;
    }
  }

  async getTrendingItems(type?: string): Promise<EntertainmentItem[]> {
    try {
      const params = type ? `?type=${type}` : '';
      const response = await apiClient.get(`/entertainment/trending${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get trending items:', error);
      throw error;
    }
  }

  async getNewReleases(type?: string, days: number = 30): Promise<EntertainmentItem[]> {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      params.append('days', days.toString());

      const response = await apiClient.get(`/entertainment/new-releases?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get new releases:', error);
      throw error;
    }
  }

  async getFamilyActivity(familyId: string, days: number = 7): Promise<Array<{
    userId: string;
    userName: string;
    activity: string;
    item?: EntertainmentItem;
    timestamp: Date;
  }>> {
    try {
      const response = await apiClient.get(`/entertainment/hourse-activity?familyId=${familyId}&days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get hourse activity:', error);
      throw error;
    }
  }

  async shareList(listId: string, recipients: string[]): Promise<void> {
    try {
      await apiClient.post(`/entertainment/lists/${listId}/share`, { recipients });
      
      analyticsService.trackEvent('entertainment_list_shared', {
        listId,
        recipientsCount: recipients.length
      });
    } catch (error) {
      console.error('Failed to share list:', error);
      throw error;
    }
  }

  async getSimilarItems(itemId: string): Promise<EntertainmentItem[]> {
    try {
      const response = await apiClient.get(`/entertainment/items/${itemId}/similar`);
      return response.data;
    } catch (error) {
      console.error('Failed to get similar items:', error);
      throw error;
    }
  }

  async getWatchHistory(userId: string, days: number = 30): Promise<Array<{
    item: EntertainmentItem;
    watchedAt: Date;
    duration: number;
  }>> {
    try {
      const response = await apiClient.get(`/entertainment/watch-history?userId=${userId}&days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get watch history:', error);
      throw error;
    }
  }

  async exportEntertainmentData(userId: string, familyId: string, format: 'pdf' | 'csv' | 'json' = 'pdf'): Promise<string> {
    try {
      const response = await apiClient.get(`/entertainment/export?userId=${userId}&familyId=${familyId}&format=${format}`);
      
      analyticsService.trackEvent('entertainment_data_exported', {
        format,
        userId
      });
      
      return response.data.downloadUrl;
    } catch (error) {
      console.error('Failed to export entertainment data:', error);
      throw error;
    }
  }

  async getGenres(): Promise<Array<{
    name: string;
    description: string;
    icon: string;
    color: string;
    itemCount: number;
  }>> {
    try {
      const response = await apiClient.get('/entertainment/genres');
      return response.data;
    } catch (error) {
      console.error('Failed to get genres:', error);
      throw error;
    }
  }

  async getPlatforms(): Promise<Array<{
    name: string;
    description: string;
    logo: string;
    url: string;
    subscriptionRequired: boolean;
    itemCount: number;
  }>> {
    try {
      const response = await apiClient.get('/entertainment/platforms');
      return response.data;
    } catch (error) {
      console.error('Failed to get platforms:', error);
      throw error;
    }
  }
}

export const entertainmentService = new EntertainmentService(); 