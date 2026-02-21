import { Request, Response, NextFunction } from 'express';
import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics
} from 'prom-client';

const registry = new Registry();

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
collectDefaultMetrics({ register: registry });

// Custom metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [registry]
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry]
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [registry]
});

const databaseConnections = new Gauge({
  name: 'database_connections',
  help: 'Number of database connections',
  registers: [registry]
});

const redisConnections = new Gauge({
  name: 'redis_connections',
  help: 'Number of Redis connections',
  registers: [registry]
});

const authenticationAttempts = new Counter({
  name: 'authentication_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['method', 'status'],
  registers: [registry]
});

const rateLimitHits = new Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['endpoint', 'client_ip'],
  registers: [registry]
});

const errorCount = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type'],
  registers: [registry]
});

const userSessions = new Gauge({
  name: 'user_sessions_active',
  help: 'Number of active user sessions',
  registers: [registry]
});

const fileUploads = new Counter({
  name: 'file_uploads_total',
  help: 'Total number of file uploads',
  labelNames: ['status', 'file_type'],
  registers: [registry]
});

const apiResponseSize = new Histogram({
  name: 'api_response_size_bytes',
  help: 'Size of API responses in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 10000, 100000, 1000000],
  registers: [registry]
});

class MetricsService {
  private static instance: MetricsService;
  private connectionCount: number = 0;

  private constructor() {}

  static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  /**
   * Middleware to collect HTTP request metrics
   */
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = process.hrtime.bigint();
      this.connectionCount++;
      activeConnections.set(this.connectionCount);

      res.on('finish', () => {
        this.connectionCount--;
        activeConnections.set(this.connectionCount);

        const durationNs = Number(process.hrtime.bigint() - start);
        const durationSec = durationNs / 1e9;

        const route = (req.route?.path as string) || req.path || 'unknown';
        const labels = {
          method: req.method,
          route,
          status_code: String(res.statusCode)
        };

        httpRequestDuration.observe(labels, durationSec);
        httpRequestTotal.inc(labels);

        const contentLength = res.getHeader('content-length');
        if (contentLength) {
          apiResponseSize.observe(
            { method: req.method, route },
            Number(contentLength)
          );
        }
      });

      next();
    };
  }

  /**
   * Record authentication attempt
   */
  recordAuthAttempt(method: string, status: 'success' | 'failure'): void {
    authenticationAttempts.inc({ method, status });
  }

  /**
   * Record rate limit hit
   */
  recordRateLimitHit(endpoint: string, clientIp: string): void {
    rateLimitHits.inc({ endpoint, client_ip: clientIp });
  }

  /**
   * Record file upload
   */
  recordFileUpload(status: 'success' | 'failure', fileType: string): void {
    fileUploads.inc({ status, file_type: fileType });
  }

  /**
   * Update database connection count
   */
  updateDatabaseConnections(count: number): void {
    databaseConnections.set(count);
  }

  /**
   * Update Redis connection count
   */
  updateRedisConnections(count: number): void {
    redisConnections.set(count);
  }

  /**
   * Update active user sessions
   */
  updateUserSessions(count: number): void {
    userSessions.set(count);
  }

  /**
   * Record custom business metric
   */
  recordBusinessMetric(name: string, value: number, labels?: Record<string, string>): void {
    // For custom metrics, increment the error counter with a custom label
    errorCount.inc({ type: name }, value);
  }

  /**
   * Get metrics registry
   */
  getRegistry(): Registry {
    return registry;
  }

  /**
   * Get metrics for Prometheus
   */
  async getMetrics(): Promise<string> {
    return registry.metrics();
  }

  /**
   * Reset all metrics (useful for testing)
   */
  resetMetrics(): void {
    registry.resetMetrics();
  }
}

export const metricsService = MetricsService.getInstance();

// Metrics endpoint middleware
export async function metricsEndpoint(req: Request, res: Response): Promise<void> {
  res.set('Content-Type', registry.contentType);
  const metrics = await registry.metrics();
  res.end(metrics);
}

// Health check metrics
export function updateHealthMetrics(healthData: any): void {
  if (healthData?.database?.connections !== undefined) {
    databaseConnections.set(healthData.database.connections);
  }
  if (healthData?.redis?.connected !== undefined) {
    redisConnections.set(healthData.redis.connected ? 1 : 0);
  }
  if (healthData?.activeSessions !== undefined) {
    userSessions.set(healthData.activeSessions);
  }
}

export default metricsService;
