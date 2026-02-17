import { prisma } from '../lib/prisma';

export enum MetricType {
  USER = 'user',
  CIRCLE = 'circle',
  SUBSCRIPTION = 'subscription',
  SAFETY = 'safety',
  COMMUNICATION = 'communication',
  LOCATION = 'location',
  PERFORMANCE = 'performance',
  BUSINESS = 'business',
}

class AnalyticsService {
  async getUserAnalytics(startDate: Date | null = null, endDate: Date | null = null) {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate || new Date();

      const [totalUsers, activeUsers] = await Promise.all([
        this.getTotalUsers(),
        this.getActiveUsers(start, end),
      ]);

      return {
        totalUsers,
        activeUsers,
        period: { start, end },
      };
    } catch (error) {
      console.error('Get user analytics error:', error);
      throw error;
    }
  }

  private async getTotalUsers(): Promise<number> {
    const result = await prisma.$queryRawUnsafe<Array<{ count: string }>>(
      'SELECT COUNT(*)::text as count FROM core.users WHERE is_active = true'
    );
    return parseInt(result[0].count);
  }

  private async getActiveUsers(start: Date, end: Date): Promise<number> {
    const result = await prisma.$queryRawUnsafe<Array<{ count: string }>>(
      'SELECT COUNT(DISTINCT user_id) FROM bondarys.user_locations WHERE created_at BETWEEN $1 AND $2',
      start, end
    );
    return parseInt(result[0].count);
  }

  async getcircleAnalytics(startDate: Date | null = null, endDate: Date | null = null) {
    // Placeholder
    return {
      totalCircles: 0,
      activeCircles: 0,
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
