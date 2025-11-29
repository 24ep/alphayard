import { apiClient } from '../api/apiClient';
import { analyticsService } from '../analytics/AnalyticsService';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl?: string;
  source: {
    name: string;
    url: string;
    logo?: string;
  };
  author?: string;
  publishedAt: Date;
  category: 'general' | 'business' | 'technology' | 'sports' | 'entertainment' | 'health' | 'science' | 'politics' | 'local' | 'world';
  tags: string[];
  language: string;
  country: string;
  isTopStory: boolean;
  isBreaking: boolean;
  readTime: number; // in minutes
  viewCount: number;
  shareCount: number;
  likeCount: number;
  isBookmarked: boolean;
  isRead: boolean;
}

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  articleCount: number;
}

export interface NewsSource {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: string;
  country: string;
  language: string;
  category: string;
  isVerified: boolean;
  isActive: boolean;
  articleCount: number;
  lastUpdated: Date;
}

export interface NewsPreferences {
  userId: string;
  familyId: string;
  categories: string[];
  sources: string[];
  countries: string[];
  languages: string[];
  notifications: {
    breakingNews: boolean;
    topStories: boolean;
    categoryUpdates: boolean;
    sourceUpdates: boolean;
  };
  displayOptions: {
    showImages: boolean;
    showReadTime: boolean;
    showSource: boolean;
    showDate: boolean;
    compactMode: boolean;
  };
  filters: {
    excludePaywall: boolean;
    excludeOpinion: boolean;
    minReadTime: number;
    maxReadTime: number;
  };
}

export interface NewsStats {
  totalArticles: number;
  readArticles: number;
  bookmarkedArticles: number;
  topCategory: string;
  topSource: string;
  averageReadTime: number;
  readingStreak: number;
}

export interface NewsComment {
  id: string;
  articleId: string;
  userId: string;
  userName?: string;
  text: string;
  createdAt: string;
}

export type NewsReaction = 'like' | 'dislike' | 'none';

class NewsService {
  async getTopStories(country: string = 'us', category?: string): Promise<NewsArticle[]> {
    try {
      const params = new URLSearchParams();
      params.append('country', country);
      if (category) params.append('category', category);

      const response = await apiClient.get(`/news/top-stories?${params.toString()}`);
      
      analyticsService.trackEvent('news_top_stories_fetched', {
        country,
        category,
        count: response.data.length
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get top stories:', error);
      throw error;
    }
  }

  async getLatestNews(category?: string, page: number = 1, limit: number = 20): Promise<{
    articles: NewsArticle[];
    totalPages: number;
    currentPage: number;
    totalArticles: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get(`/news/latest?${params.toString()}`);
      
      analyticsService.trackEvent('news_latest_fetched', {
        category,
        page,
        count: response.data.articles.length
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get latest news:', error);
      throw error;
    }
  }

  async getBreakingNews(): Promise<NewsArticle[]> {
    try {
      const response = await apiClient.get('/news/breaking');
      return response.data;
    } catch (error) {
      console.error('Failed to get breaking news:', error);
      throw error;
    }
  }

  async getLocalNews(latitude: number, longitude: number, radius: number = 50): Promise<NewsArticle[]> {
    try {
      const response = await apiClient.get(`/news/local?lat=${latitude}&lon=${longitude}&radius=${radius}`);
      
      analyticsService.trackEvent('news_local_fetched', {
        latitude,
        longitude,
        radius,
        count: response.data.length
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get local news:', error);
      throw error;
    }
  }

  async searchNews(query: string, filters?: {
    category?: string;
    source?: string;
    dateFrom?: Date;
    dateTo?: Date;
    language?: string;
  }): Promise<{
    articles: NewsArticle[];
    totalResults: number;
    searchTime: number;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.source) params.append('source', filters.source);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters?.language) params.append('language', filters.language);

      const response = await apiClient.get(`/news/search?${params.toString()}`);
      
      analyticsService.trackEvent('news_search_performed', {
        query,
        filters: Object.keys(filters || {}).length,
        resultsCount: response.data.totalResults
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to search news:', error);
      throw error;
    }
  }

  async getArticle(articleId: string): Promise<NewsArticle> {
    try {
      const response = await apiClient.get(`/news/articles/${articleId}`);
      
      analyticsService.trackEvent('news_article_viewed', {
        articleId,
        category: response.data.category
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get article:', error);
      throw error;
    }
  }

  async getCategories(): Promise<NewsCategory[]> {
    try {
      const response = await apiClient.get('/news/categories');
      return response.data;
    } catch (error) {
      console.error('Failed to get categories:', error);
      throw error;
    }
  }

  async getSources(): Promise<NewsSource[]> {
    try {
      const response = await apiClient.get('/news/sources');
      return response.data;
    } catch (error) {
      console.error('Failed to get sources:', error);
      throw error;
    }
  }

  async getUserPreferences(userId: string, familyId: string): Promise<NewsPreferences> {
    try {
      const response = await apiClient.get(`/news/preferences?userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId: string, familyId: string, preferences: Partial<NewsPreferences>): Promise<NewsPreferences> {
    try {
      const response = await apiClient.put(`/news/preferences?userId=${userId}&familyId=${familyId}`, preferences);
      
      analyticsService.trackEvent('news_preferences_updated', {
        userId,
        categoriesCount: preferences.categories?.length,
        sourcesCount: preferences.sources?.length
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  async bookmarkArticle(articleId: string, userId: string): Promise<void> {
    try {
      await apiClient.post(`/news/articles/${articleId}/bookmark`, { userId });
      
      analyticsService.trackEvent('news_article_bookmarked', {
        articleId,
        userId
      });
    } catch (error) {
      console.error('Failed to bookmark article:', error);
      throw error;
    }
  }

  async unbookmarkArticle(articleId: string, userId: string): Promise<void> {
    try {
      await apiClient.delete(`/news/articles/${articleId}/bookmark?userId=${userId}`);
      
      analyticsService.trackEvent('news_article_unbookmarked', {
        articleId,
        userId
      });
    } catch (error) {
      console.error('Failed to unbookmark article:', error);
      throw error;
    }
  }

  async getBookmarkedArticles(userId: string): Promise<NewsArticle[]> {
    try {
      const response = await apiClient.get(`/news/bookmarks?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get bookmarked articles:', error);
      throw error;
    }
  }

  async markArticleAsRead(articleId: string, userId: string): Promise<void> {
    try {
      await apiClient.post(`/news/articles/${articleId}/read`, { userId });
      
      analyticsService.trackEvent('news_article_read', {
        articleId,
        userId
      });
    } catch (error) {
      console.error('Failed to mark article as read:', error);
      throw error;
    }
  }

  async getReadArticles(userId: string): Promise<NewsArticle[]> {
    try {
      const response = await apiClient.get(`/news/read?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get read articles:', error);
      throw error;
    }
  }

  async shareArticle(articleId: string, recipients: string[], message?: string): Promise<void> {
    try {
      await apiClient.post(`/news/articles/${articleId}/share`, { recipients, message });
      
      analyticsService.trackEvent('news_article_shared', {
        articleId,
        recipientsCount: recipients.length
      });
    } catch (error) {
      console.error('Failed to share article:', error);
      throw error;
    }
  }

  async likeArticle(articleId: string, userId: string): Promise<void> {
    try {
      await apiClient.post(`/news/articles/${articleId}/like`, { userId });
      
      analyticsService.trackEvent('news_article_liked', {
        articleId,
        userId
      });
    } catch (error) {
      console.error('Failed to like article:', error);
      throw error;
    }
  }

  async unlikeArticle(articleId: string, userId: string): Promise<void> {
    try {
      await apiClient.delete(`/news/articles/${articleId}/like?userId=${userId}`);
      
      analyticsService.trackEvent('news_article_unliked', {
        articleId,
        userId
      });
    } catch (error) {
      console.error('Failed to unlike article:', error);
      throw error;
    }
  }

  async getNewsStats(userId: string): Promise<NewsStats> {
    try {
      const response = await apiClient.get(`/news/stats?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get news stats:', error);
      throw error;
    }
  }

  async getTrendingTopics(): Promise<Array<{
    topic: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
    articles: NewsArticle[];
  }>> {
    try {
      const response = await apiClient.get('/news/trending');
      return response.data;
    } catch (error) {
      console.error('Failed to get trending topics:', error);
      throw error;
    }
  }

  async getRelatedArticles(articleId: string): Promise<NewsArticle[]> {
    try {
      const response = await apiClient.get(`/news/articles/${articleId}/related`);
      return response.data;
    } catch (error) {
      console.error('Failed to get related articles:', error);
      throw error;
    }
  }

  // Comments
  async getComments(articleId: string): Promise<NewsComment[]> {
    try {
      const response = await apiClient.get(`/news/articles/${articleId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Failed to get comments:', error);
      throw error;
    }
  }

  async addComment(articleId: string, userId: string, text: string): Promise<NewsComment> {
    try {
      const response = await apiClient.post(`/news/articles/${articleId}/comments`, { userId, text });
      analyticsService.trackEvent('news_comment_added', { articleId, userId });
      return response.data;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }

  // Reactions
  async setReaction(articleId: string, userId: string, reaction: NewsReaction): Promise<void> {
    try {
      await apiClient.post(`/news/articles/${articleId}/reaction`, { userId, reaction });
      analyticsService.trackEvent('news_reaction_set', { articleId, userId, reaction });
    } catch (error) {
      console.error('Failed to set reaction:', error);
      throw error;
    }
  }

  async subscribeToNewsletter(email: string, categories: string[]): Promise<void> {
    try {
      await apiClient.post('/news/newsletter/subscribe', { email, categories });
      
      analyticsService.trackEvent('news_newsletter_subscribed', {
        email,
        categoriesCount: categories.length
      });
    } catch (error) {
      console.error('Failed to subscribe to newsletter:', error);
      throw error;
    }
  }

  async unsubscribeFromNewsletter(email: string): Promise<void> {
    try {
      await apiClient.post('/news/newsletter/unsubscribe', { email });
      
      analyticsService.trackEvent('news_newsletter_unsubscribed', {
        email
      });
    } catch (error) {
      console.error('Failed to unsubscribe from newsletter:', error);
      throw error;
    }
  }

  async exportNewsData(userId: string, format: 'pdf' | 'csv' | 'json' = 'pdf'): Promise<string> {
    try {
      const response = await apiClient.get(`/news/export?userId=${userId}&format=${format}`);
      
      analyticsService.trackEvent('news_data_exported', {
        format,
        userId
      });
      
      return response.data.downloadUrl;
    } catch (error) {
      console.error('Failed to export news data:', error);
      throw error;
    }
  }
}

export const newsService = new NewsService(); 