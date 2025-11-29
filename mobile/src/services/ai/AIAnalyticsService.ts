import { analyticsService } from '../analytics/AnalyticsService';
import { userService } from '../user/UserService';
import { familyService } from '../hourse/FamilyService';

export interface AIAnalyticsEvent {
  eventType: string;
  userId: string;
  familyId: string;
  timestamp: number;
  metadata: {
    intent?: string;
    confidence?: number;
    actionsCount?: number;
    responseTime?: number;
    success?: boolean;
    error?: string;
    context?: any;
  };
}

export interface AIAnalyticsMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  mostCommonIntents: Array<{
    intent: string;
    count: number;
    successRate: number;
  }>;
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionLength: number;
  };
  familyUsage: {
    totalFamilies: number;
    activeFamilies: number;
    averageFamilySize: number;
  };
  performanceMetrics: {
    averageConfidence: number;
    actionSuccessRate: number;
    userSatisfaction: number;
  };
}

export interface AIAnalyticsReport {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: number;
  endDate: number;
  metrics: AIAnalyticsMetrics;
  insights: string[];
  recommendations: string[];
}

class AIAnalyticsService {
  private events: AIAnalyticsEvent[] = [];
  private readonly MAX_EVENTS = 1000;

  async trackEvent(eventType: string, metadata: any = {}): Promise<void> {
    try {
      const event: AIAnalyticsEvent = {
        eventType,
        userId: metadata.userId || 'unknown',
        familyId: metadata.familyId || 'unknown',
        timestamp: Date.now(),
        metadata: {
          ...metadata,
          context: this.getContextInfo()
        }
      };

      this.events.push(event);

      // Keep only recent events
      if (this.events.length > this.MAX_EVENTS) {
        this.events = this.events.slice(-this.MAX_EVENTS);
      }

      // Send to analytics service
      await analyticsService.trackEvent(`ai_${eventType}`, {
        ...metadata,
        timestamp: event.timestamp,
        context: event.metadata.context
      });

      // Store locally for offline analysis
      await this.storeEventLocally(event);

    } catch (error) {
      console.error('Failed to track AI analytics event:', error);
    }
  }

  async trackRequest(request: any, response: any, responseTime: number): Promise<void> {
    try {
      const success = !response.error;
      
      await this.trackEvent('request', {
        intent: request.intent,
        confidence: request.confidence,
        actionsCount: response.actions?.length || 0,
        responseTime,
        success,
        error: response.error,
        userId: request.context?.userId,
        familyId: request.context?.familyId
      });

    } catch (error) {
      console.error('Failed to track AI request:', error);
    }
  }

  async trackIntent(intent: string, confidence: number, success: boolean): Promise<void> {
    try {
      await this.trackEvent('intent', {
        intent,
        confidence,
        success,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Failed to track AI intent:', error);
    }
  }

  async trackAction(action: any, success: boolean): Promise<void> {
    try {
      await this.trackEvent('action', {
        actionType: action.type,
        service: action.service,
        method: action.method,
        success,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Failed to track AI action:', error);
    }
  }

  async trackUserInteraction(interaction: string, metadata: any = {}): Promise<void> {
    try {
      await this.trackEvent('user_interaction', {
        interaction,
        ...metadata,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Failed to track user interaction:', error);
    }
  }

  async trackError(error: Error, context: any = {}): Promise<void> {
    try {
      await this.trackEvent('error', {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: Date.now()
      });

    } catch (err) {
      console.error('Failed to track AI error:', err);
    }
  }

  async getMetrics(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AIAnalyticsMetrics> {
    try {
      const now = Date.now();
      const periodMs = this.getPeriodMs(period);
      const startTime = now - periodMs;

      const periodEvents = this.events.filter(event => event.timestamp >= startTime);

      const totalRequests = periodEvents.filter(e => e.eventType === 'request').length;
      const successfulRequests = periodEvents.filter(e => 
        e.eventType === 'request' && e.metadata.success
      ).length;
      const failedRequests = totalRequests - successfulRequests;

      const responseTimes = periodEvents
        .filter(e => e.eventType === 'request' && e.metadata.responseTime)
        .map(e => e.metadata.responseTime!);
      
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;

      const intentCounts = new Map<string, { count: number; success: number }>();
      periodEvents
        .filter(e => e.eventType === 'intent')
        .forEach(e => {
          const intent = e.metadata.intent || 'unknown';
          const current = intentCounts.get(intent) || { count: 0, success: 0 };
          current.count++;
          if (e.metadata.success) current.success++;
          intentCounts.set(intent, current);
        });

      const mostCommonIntents = Array.from(intentCounts.entries())
        .map(([intent, data]) => ({
          intent,
          count: data.count,
          successRate: data.count > 0 ? data.success / data.count : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const uniqueUsers = new Set(periodEvents.map(e => e.userId));
      const uniqueFamilies = new Set(periodEvents.map(e => e.familyId));

      const confidences = periodEvents
        .filter(e => e.metadata.confidence)
        .map(e => e.metadata.confidence!);
      
      const averageConfidence = confidences.length > 0 
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
        : 0;

      const actionEvents = periodEvents.filter(e => e.eventType === 'action');
      const successfulActions = actionEvents.filter(e => e.metadata.success).length;
      const actionSuccessRate = actionEvents.length > 0 
        ? successfulActions / actionEvents.length 
        : 0;

      return {
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime,
        mostCommonIntents,
        userEngagement: {
          dailyActiveUsers: uniqueUsers.size,
          weeklyActiveUsers: uniqueUsers.size, // Simplified
          monthlyActiveUsers: uniqueUsers.size, // Simplified
          averageSessionLength: 0 // Would need session tracking
        },
        familyUsage: {
          totalFamilies: uniqueFamilies.size,
          activeFamilies: uniqueFamilies.size,
          averageFamilySize: 0 // Would need hourse data
        },
        performanceMetrics: {
          averageConfidence,
          actionSuccessRate,
          userSatisfaction: 0 // Would need user feedback
        }
      };

    } catch (error) {
      console.error('Failed to get AI metrics:', error);
      throw error;
    }
  }

  async generateReport(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AIAnalyticsReport> {
    try {
      const metrics = await this.getMetrics(period);
      const insights = this.generateInsights(metrics);
      const recommendations = this.generateRecommendations(metrics);

      const now = Date.now();
      const periodMs = this.getPeriodMs(period);

      return {
        period,
        startDate: now - periodMs,
        endDate: now,
        metrics,
        insights,
        recommendations
      };

    } catch (error) {
      console.error('Failed to generate AI report:', error);
      throw error;
    }
  }

  private generateInsights(metrics: AIAnalyticsMetrics): string[] {
    const insights: string[] = [];

    // Request insights
    if (metrics.totalRequests > 0) {
      const successRate = metrics.successfulRequests / metrics.totalRequests;
      if (successRate < 0.8) {
        insights.push(`Low success rate: ${(successRate * 100).toFixed(1)}% of requests failed`);
      }
      if (successRate > 0.95) {
        insights.push(`Excellent success rate: ${(successRate * 100).toFixed(1)}% of requests succeeded`);
      }
    }

    // Response time insights
    if (metrics.averageResponseTime > 2000) {
      insights.push(`Slow response time: ${metrics.averageResponseTime.toFixed(0)}ms average`);
    } else if (metrics.averageResponseTime < 500) {
      insights.push(`Fast response time: ${metrics.averageResponseTime.toFixed(0)}ms average`);
    }

    // Intent insights
    if (metrics.mostCommonIntents.length > 0) {
      const topIntent = metrics.mostCommonIntents[0];
      insights.push(`Most popular intent: "${topIntent.intent}" (${topIntent.count} requests)`);
      
      if (topIntent.successRate < 0.7) {
        insights.push(`Low success rate for "${topIntent.intent}": ${(topIntent.successRate * 100).toFixed(1)}%`);
      }
    }

    // User engagement insights
    if (metrics.userEngagement.dailyActiveUsers > 0) {
      insights.push(`${metrics.userEngagement.dailyActiveUsers} active users today`);
    }

    // hourse usage insights
    if (metrics.familyUsage.activeFamilies > 0) {
      insights.push(`${metrics.familyUsage.activeFamilies} active families`);
    }

    return insights;
  }

  private generateRecommendations(metrics: AIAnalyticsMetrics): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (metrics.averageResponseTime > 2000) {
      recommendations.push('Optimize AI response time by improving intent recognition');
    }

    if (metrics.performanceMetrics.averageConfidence < 0.7) {
      recommendations.push('Improve AI confidence by enhancing training data');
    }

    if (metrics.performanceMetrics.actionSuccessRate < 0.8) {
      recommendations.push('Review and fix failing AI actions');
    }

    // User engagement recommendations
    if (metrics.userEngagement.dailyActiveUsers < 10) {
      recommendations.push('Increase user engagement through better onboarding');
    }

    // Intent-specific recommendations
    const lowSuccessIntents = metrics.mostCommonIntents.filter(i => i.successRate < 0.7);
    if (lowSuccessIntents.length > 0) {
      recommendations.push(`Improve success rate for: ${lowSuccessIntents.map(i => i.intent).join(', ')}`);
    }

    return recommendations;
  }

  private getPeriodMs(period: 'daily' | 'weekly' | 'monthly'): number {
    switch (period) {
      case 'daily':
        return 24 * 60 * 60 * 1000;
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  private getContextInfo(): any {
    return {
      platform: 'mobile',
      timestamp: Date.now(),
      version: '1.0.0'
    };
  }

  private async storeEventLocally(event: AIAnalyticsEvent): Promise<void> {
    try {
      // Store in local storage for offline analysis
      const storedEvents = await this.getStoredEvents();
      storedEvents.push(event);
      
      // Keep only recent events
      if (storedEvents.length > this.MAX_EVENTS) {
        storedEvents.splice(0, storedEvents.length - this.MAX_EVENTS);
      }
      
      // Store back to local storage
      await this.setStoredEvents(storedEvents);
    } catch (error) {
      console.error('Failed to store event locally:', error);
    }
  }

  private async getStoredEvents(): Promise<AIAnalyticsEvent[]> {
    try {
      // This would use AsyncStorage in a real implementation
      return [];
    } catch (error) {
      console.error('Failed to get stored events:', error);
      return [];
    }
  }

  private async setStoredEvents(events: AIAnalyticsEvent[]): Promise<void> {
    try {
      // This would use AsyncStorage in a real implementation
    } catch (error) {
      console.error('Failed to set stored events:', error);
    }
  }

  // Public methods for external access
  async getTopIntents(limit: number = 10): Promise<Array<{ intent: string; count: number; successRate: number }>> {
    const metrics = await this.getMetrics();
    return metrics.mostCommonIntents.slice(0, limit);
  }

  async getSuccessRate(): Promise<number> {
    const metrics = await this.getMetrics();
    return metrics.totalRequests > 0 ? metrics.successfulRequests / metrics.totalRequests : 0;
  }

  async getAverageResponseTime(): Promise<number> {
    const metrics = await this.getMetrics();
    return metrics.averageResponseTime;
  }

  async getActiveUsers(): Promise<number> {
    const metrics = await this.getMetrics();
    return metrics.userEngagement.dailyActiveUsers;
  }

  async exportData(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      if (format === 'json') {
        return JSON.stringify(this.events, null, 2);
      } else {
        // CSV format
        const headers = ['eventType', 'userId', 'familyId', 'timestamp', 'metadata'];
        const csvRows = [headers.join(',')];
        
        this.events.forEach(event => {
          const row = [
            event.eventType,
            event.userId,
            event.familyId,
            event.timestamp,
            JSON.stringify(event.metadata)
          ];
          csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  async clearData(): Promise<void> {
    try {
      this.events = [];
      await this.setStoredEvents([]);
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }
}

export const aiAnalyticsService = new AIAnalyticsService(); 