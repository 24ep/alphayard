import { apiClient } from '../api/apiClient';
import { analyticsService } from '../analytics/AnalyticsService';

export interface WeatherData {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    uvIndex: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    lastUpdated: Date;
  };
  forecast: Array<{
    date: Date;
    day: {
      maxTemp: number;
      minTemp: number;
      condition: {
        text: string;
        icon: string;
        code: number;
      };
      chanceOfRain: number;
      chanceOfSnow: number;
      humidity: number;
      windSpeed: number;
    };
    night: {
      maxTemp: number;
      minTemp: number;
      condition: {
        text: string;
        icon: string;
        code: number;
      };
      chanceOfRain: number;
      chanceOfSnow: number;
      humidity: number;
      windSpeed: number;
    };
    astro: {
      sunrise: string;
      sunset: string;
      moonrise: string;
      moonset: string;
      moonPhase: string;
    };
  }>;
  alerts: Array<{
    id: string;
    type: 'weather' | 'flood' | 'fire' | 'air_quality' | 'other';
    severity: 'minor' | 'moderate' | 'severe' | 'extreme';
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    areas: string[];
  }>;
}

export interface WeatherAlert {
  id: string;
  userId: string;
  circleId: string;
  type: 'temperature' | 'rain' | 'snow' | 'wind' | 'storm' | 'air_quality' | 'uv' | 'custom';
  condition: 'above' | 'below' | 'equals';
  value: number;
  unit: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  notifications: boolean;
  notificationTime: 'immediate' | '15min' | '30min' | '1hour';
  createdAt: Date;
  updatedAt: Date;
}

export interface WeatherPreferences {
  userId: string;
  circleId: string;
  defaultLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  units: 'metric' | 'imperial';
  language: string;
  notifications: {
    dailyForecast: boolean;
    severeWeather: boolean;
    rainAlerts: boolean;
    temperatureAlerts: boolean;
    airQualityAlerts: boolean;
  };
  displayOptions: {
    showHumidity: boolean;
    showWind: boolean;
    showPressure: boolean;
    showUV: boolean;
    showFeelsLike: boolean;
  };
}

class WeatherService {
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const response = await apiClient.get(`/weather/current?lat=${latitude}&lon=${longitude}`);
      
      analyticsService.trackEvent('weather_current_fetched', {
        latitude,
        longitude
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get current weather:', error);
      throw error;
    }
  }

  async getWeatherForecast(latitude: number, longitude: number, days: number = 7): Promise<WeatherData> {
    try {
      const response = await apiClient.get(`/weather/forecast?lat=${latitude}&lon=${longitude}&days=${days}`);
      
      analyticsService.trackEvent('weather_forecast_fetched', {
        latitude,
        longitude,
        days
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get weather forecast:', error);
      throw error;
    }
  }

  async getWeatherAlerts(latitude: number, longitude: number): Promise<WeatherData['alerts']> {
    try {
      const response = await apiClient.get(`/weather/alerts?lat=${latitude}&lon=${longitude}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get weather alerts:', error);
      throw error;
    }
  }

  async searchLocation(query: string): Promise<Array<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
    region?: string;
  }>> {
    try {
      const response = await apiClient.get(`/weather/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search location:', error);
      throw error;
    }
  }

  async getUserWeatherAlerts(userId: string, circleId: string): Promise<WeatherAlert[]> {
    try {
      const response = await apiClient.get(`/weather/alerts/user?userId=${userId}&circleId=${circleId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user weather alerts:', error);
      throw error;
    }
  }

  async createWeatherAlert(alert: Omit<WeatherAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<WeatherAlert> {
    try {
      const response = await apiClient.post('/weather/alerts', alert);
      
      analyticsService.trackEvent('weather_alert_created', {
        type: alert.type,
        userId: alert.userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create weather alert:', error);
      throw error;
    }
  }

  async updateWeatherAlert(alertId: string, updates: Partial<WeatherAlert>): Promise<WeatherAlert> {
    try {
      const response = await apiClient.put(`/weather/alerts/${alertId}`, updates);
      
      analyticsService.trackEvent('weather_alert_updated', {
        alertId,
        isActive: updates.isActive
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update weather alert:', error);
      throw error;
    }
  }

  async deleteWeatherAlert(alertId: string): Promise<void> {
    try {
      await apiClient.delete(`/weather/alerts/${alertId}`);
      
      analyticsService.trackEvent('weather_alert_deleted', {
        alertId
      });
    } catch (error) {
      console.error('Failed to delete weather alert:', error);
      throw error;
    }
  }

  async getUserPreferences(userId: string, circleId: string): Promise<WeatherPreferences> {
    try {
      const response = await apiClient.get(`/weather/preferences?userId=${userId}&circleId=${circleId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId: string, circleId: string, preferences: Partial<WeatherPreferences>): Promise<WeatherPreferences> {
    try {
      const response = await apiClient.put(`/weather/preferences?userId=${userId}&circleId=${circleId}`, preferences);
      
      analyticsService.trackEvent('weather_preferences_updated', {
        userId,
        units: preferences.units
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  async getWeatherHistory(latitude: number, longitude: number, date: Date): Promise<{
    date: Date;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  }> {
    try {
      const response = await apiClient.get(`/weather/history?lat=${latitude}&lon=${longitude}&date=${date.toISOString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get weather history:', error);
      throw error;
    }
  }

  async getAirQuality(latitude: number, longitude: number): Promise<{
    aqi: number;
    level: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
    pollutants: {
      co: number;
      no2: number;
      o3: number;
      pm10: number;
      pm25: number;
      so2: number;
    };
    lastUpdated: Date;
  }> {
    try {
      const response = await apiClient.get(`/weather/air-quality?lat=${latitude}&lon=${longitude}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get air quality:', error);
      throw error;
    }
  }

  async getWeatherMaps(latitude: number, longitude: number, type: 'temperature' | 'precipitation' | 'wind' | 'clouds' = 'temperature'): Promise<{
    url: string;
    timestamp: Date;
    type: string;
  }> {
    try {
      const response = await apiClient.get(`/weather/maps?lat=${latitude}&lon=${longitude}&type=${type}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get weather maps:', error);
      throw error;
    }
  }

  async getWeatherRadar(latitude: number, longitude: number): Promise<{
    url: string;
    timestamp: Date;
    animation: string[];
  }> {
    try {
      const response = await apiClient.get(`/weather/radar?lat=${latitude}&lon=${longitude}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get weather radar:', error);
      throw error;
    }
  }

  async getWeatherInsights(latitude: number, longitude: number): Promise<Array<{
    type: 'clothing' | 'activity' | 'health' | 'travel';
    title: string;
    description: string;
    icon: string;
  }>> {
    try {
      const response = await apiClient.get(`/weather/insights?lat=${latitude}&lon=${longitude}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get weather insights:', error);
      throw error;
    }
  }

  async subscribeToWeatherUpdates(userId: string, circleId: string, location: {
    name: string;
    latitude: number;
    longitude: number;
  }): Promise<void> {
    try {
      await apiClient.post('/weather/subscribe', {
        userId,
        circleId,
        location
      });
      
      analyticsService.trackEvent('weather_subscription_created', {
        userId,
        location: location.name
      });
    } catch (error) {
      console.error('Failed to subscribe to weather updates:', error);
      throw error;
    }
  }

  async unsubscribeFromWeatherUpdates(userId: string, circleId: string): Promise<void> {
    try {
      await apiClient.delete(`/weather/subscribe?userId=${userId}&circleId=${circleId}`);
      
      analyticsService.trackEvent('weather_subscription_cancelled', {
        userId
      });
    } catch (error) {
      console.error('Failed to unsubscribe from weather updates:', error);
      throw error;
    }
  }

  async getWeatherStats(latitude: number, longitude: number, period: 'week' | 'month' | 'year' = 'month'): Promise<{
    averageTemperature: number;
    totalPrecipitation: number;
    sunnyDays: number;
    rainyDays: number;
    extremeEvents: number;
  }> {
    try {
      const response = await apiClient.get(`/weather/stats?lat=${latitude}&lon=${longitude}&period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get weather stats:', error);
      throw error;
    }
  }

  async shareWeatherData(location: {
    name: string;
    latitude: number;
    longitude: number;
  }, recipients: string[]): Promise<void> {
    try {
      await apiClient.post('/weather/share', {
        location,
        recipients
      });
      
      analyticsService.trackEvent('weather_data_shared', {
        location: location.name,
        recipientsCount: recipients.length
      });
    } catch (error) {
      console.error('Failed to share weather data:', error);
      throw error;
    }
  }
}

export const weatherService = new WeatherService(); 
