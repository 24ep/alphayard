import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export interface EmotionRecord {
  id?: string;
  user_id: string;
  emotion: number; // 1-5 scale
  date: string; // YYYY-MM-DD format
  created_at?: string;
}

export interface CircleEmotionAverage {
  date: string;
  average_emotion: number;
  total_records: number;
}

class EmotionService {
  private readonly STORAGE_KEY = 'emotion_check_date';
  private readonly EMOTION_TABLE = 'emotion_records';

  /**
   * Check if user has already done emotion check today
   */
  async hasCheckedToday(): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastCheckDate = await AsyncStorage.getItem(this.STORAGE_KEY);
      return lastCheckDate === today;
    } catch (error) {
      console.error('Error checking today\'s emotion status:', error);
      return false;
    }
  }

  /**
   * Submit emotion check for a specific date (defaults to today)
   */
  async submitEmotionCheck(emotion: number, date?: string, tags?: string[]): Promise<void> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];

      // Convert tags to notes string if present
      const notes = tags && tags.length > 0 ? `Tags: ${tags.join(', ')}` : undefined;

      const response = await api.post('/emotions', {
        emotion,
        date: targetDate,
        notes,
      });

      if (response.success) {
        // Store the date in AsyncStorage for last check-in tracking
        await AsyncStorage.setItem(this.STORAGE_KEY, targetDate);
      }
    } catch (error) {
      console.error('Error submitting emotion check:', error);
      throw error;
    }
  }

  /**
   * Get user's emotion records for the last N days
   */
  async getUserEmotionHistory(days: number = 365): Promise<EmotionRecord[]> {
    try {
      const response = await api.get('/emotions/history', {
        params: { days }
      });

      // Handle both response.data.emotions and response.data.data.emotions structures
      const responseData = response.data || response;
      const emotions = responseData.data?.emotions || responseData.emotions || [];
      return emotions;
    } catch (error) {
      console.error('Error fetching user emotion history:', error);
      return []; // Return empty array instead of throwing to prevent UI crash
    }
  }

  /**
   * Get Circle's emotion averages for the last 30 days
   */
  async getCircleEmotionAverages(days: number = 30): Promise<CircleEmotionAverage[]> {
    try {
      const response = await api.get('/emotions/Circle-averages', {
        params: { days }
      });

      return response.data.averages || [];
    } catch (error) {
      console.error('Error fetching Circle emotion averages:', error);
      throw error;
    }
  }

  /**
   * Get emotion color based on value (1-5)
   */
  getEmotionColor(emotion: number): string {
    switch (emotion) {
      case 1: return '#FF4444'; // Very Bad - Red
      case 2: return '#FF8800'; // Bad - Orange
      case 3: return '#FFBB00'; // Okay - Yellow
      case 4: return '#88CC00'; // Good - Light Green
      case 5: return '#00AA00'; // Great - Green
      default: return '#CCCCCC'; // No data - Grey
    }
  }

  /**
   * Get emotion label based on value (1-5)
   */
  getEmotionLabel(emotion: number): string {
    switch (emotion) {
      case 1: return 'Very Bad';
      case 2: return 'Bad';
      case 3: return 'Okay';
      case 4: return 'Good';
      case 5: return 'Great';
      default: return 'No Data';
    }
  }
}

export const emotionService = new EmotionService();

