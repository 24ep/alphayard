import mongoose from 'mongoose';
import redis from 'redis';
import { promisify } from 'util';
import { pool } from '../config/database';
import os from 'os';
import process from 'process';

export enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded',
  UNKNOWN = 'unknown',
}

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  message?: string;
  details?: any;
  duration: number;
  error?: string;
}

export interface HealthReport {
  status: HealthStatus;
  timestamp: string;
  duration: number;
  checks: any[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    healthPercentage: number;
  };
  additionalMetrics?: any;
}

class HealthService {
  private redisClient: any = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private customChecks: Record<string, () => Promise<any>> = {};

  constructor() {
    this.initializeRedis();
  }

  // Initialize Redis client
  private async initializeRedis() {
    try {
      this.redisClient = redis.createClient({
        // @ts-ignore
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        retry_strategy: (options: any) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        },
      });

      this.redisClient.on('error', (error: any) => {
        console.error('Redis client error:', error);
      });

      this.redisClient.on('connect', () => {
        console.log('✅ Redis client connected');
      });
    } catch (error) {
      console.error('Initialize Redis error:', error);
    }
  }

  // Perform comprehensive health check
  async performHealthCheck(): Promise<HealthReport> {
    try {
      const startTime = Date.now();
      
      const checks = await Promise.allSettled([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkExternalServices(),
        this.checkSystemResources(),
        this.checkCustomServices(),
      ]);

      const duration = Date.now() - startTime;

      const results = checks.map((result, index) => {
        const checkNames = ['database', 'redis', 'external_services', 'system', 'custom'];
        if (result.status === 'fulfilled') {
          return {
            name: checkNames[index],
            ...result.value,
          };
        } else {
          return {
            name: checkNames[index],
            status: HealthStatus.UNHEALTHY,
            error: result.reason.message,
            duration: 0,
          };
        }
      });

      const overallStatus = this.determineOverallStatus(results);
      const healthyChecks = results.filter(r => r.status === HealthStatus.HEALTHY).length;
      const totalChecks = results.length;

      return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        duration,
        checks: results,
        summary: {
          total: totalChecks,
          healthy: healthyChecks,
          unhealthy: totalChecks - healthyChecks,
          healthPercentage: Math.round((healthyChecks / totalChecks) * 100),
        },
      };
    } catch (error: any) {
      console.error('Perform health check error:', error);
      return {
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date().toISOString(),
        duration: 0,
        checks: [],
        summary: {
          total: 0,
          healthy: 0,
          unhealthy: 0,
          healthPercentage: 0,
        },
      };
    }
  }

  // Check database health (both PG and Mongo)
  async checkDatabase(): Promise<Omit<HealthCheckResult, 'name'>> {
    const startTime = Date.now();
    try {
      // Check PG connection
      const pgStart = Date.now();
      await pool.query('SELECT 1');
      const pgDuration = Date.now() - pgStart;

      // Check Mongo connection status
      const mongoStatus = mongoose.connection.readyState;
      const mongoConnected = mongoStatus === 1;

      let status = HealthStatus.HEALTHY;
      if (!mongoConnected) {
        status = HealthStatus.DEGRADED; // Still healthy if PG is up but Mongo is down? Or just health status.
      }

      return {
        status,
        message: mongoConnected ? 'Databases are healthy' : 'PostgreSQL is healthy, MongoDB is down',
        details: {
          postgresql: {
            status: 'connected',
            duration: pgDuration,
          },
          mongodb: {
            status: this.getReadyStateText(mongoStatus),
            readyState: mongoStatus,
          },
        },
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: 'Database health check failed',
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // Check Redis health
  async checkRedis(): Promise<Omit<HealthCheckResult, 'name'>> {
    const startTime = Date.now();
    try {
      if (!this.redisClient) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: 'Redis client not initialized',
          duration: Date.now() - startTime,
        };
      }

      // Test Redis connection
      const ping = promisify(this.redisClient.ping).bind(this.redisClient);
      const testStart = Date.now();
      const pong = await ping();
      const pingDuration = Date.now() - testStart;

      if (pong !== 'PONG') {
        return {
          status: HealthStatus.UNHEALTHY,
          message: 'Redis ping failed',
          details: { response: pong },
          duration: Date.now() - startTime,
        };
      }

      // Get Redis info
      const info = promisify(this.redisClient.info).bind(this.redisClient);
      const redisInfo = await info();

      return {
        status: HealthStatus.HEALTHY,
        message: 'Redis is healthy',
        details: {
          pingDuration,
          info: this.parseRedisInfo(redisInfo),
        },
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: 'Redis health check failed',
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // Check external services
  async checkExternalServices(): Promise<Omit<HealthCheckResult, 'name'>> {
    const startTime = Date.now();
    try {
      const checks: any[] = [];

      // Check Stripe
      if (process.env.STRIPE_SECRET_KEY) {
        try {
          const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
          const testStart = Date.now();
          await stripe.paymentMethods.list({ limit: 1 });
          checks.push({
            name: 'stripe',
            status: HealthStatus.HEALTHY,
            duration: Date.now() - testStart,
          });
        } catch (error: any) {
          checks.push({
            name: 'stripe',
            status: HealthStatus.UNHEALTHY,
            error: error.message,
          });
        }
      }

      // Check Twilio
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
          const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          const testStart = Date.now();
          await twilio.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
          checks.push({
            name: 'twilio',
            status: HealthStatus.HEALTHY,
            duration: Date.now() - testStart,
          });
        } catch (error: any) {
          checks.push({
            name: 'twilio',
            status: HealthStatus.UNHEALTHY,
            error: error.message,
          });
        }
      }

      const healthyChecks = checks.filter(c => c.status === HealthStatus.HEALTHY).length;
      const status = healthyChecks === checks.length ? HealthStatus.HEALTHY : 
                           healthyChecks > 0 ? HealthStatus.DEGRADED : HealthStatus.UNHEALTHY;

      return {
        status,
        message: `External services: ${healthyChecks}/${checks.length} healthy`,
        details: { checks },
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: 'External services health check failed',
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // Check system resources
  async checkSystemResources(): Promise<Omit<HealthCheckResult, 'name'>> {
    const startTime = Date.now();
    try {
      // Get system metrics
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsage = (usedMemory / totalMemory) * 100;

      const cpuUsage = os.loadavg();
      const uptime = os.uptime();
      const processUptime = process.uptime();

      // Determine memory status
      let memoryStatus = HealthStatus.HEALTHY;
      if (memoryUsage > 90) {
        memoryStatus = HealthStatus.UNHEALTHY;
      } else if (memoryUsage > 80) {
        memoryStatus = HealthStatus.DEGRADED;
      }

      // Determine CPU status
      let cpuStatus = HealthStatus.HEALTHY;
      const cpuLoad = cpuUsage[0]; // 1-minute load average
      const cpuCores = os.cpus().length;
      const cpuUsagePercent = (cpuLoad / cpuCores) * 100;

      if (cpuUsagePercent > 90) {
        cpuStatus = HealthStatus.UNHEALTHY;
      } else if (cpuUsagePercent > 70) {
        cpuStatus = HealthStatus.DEGRADED;
      }

      const status = (memoryStatus === HealthStatus.HEALTHY && cpuStatus === HealthStatus.HEALTHY) ?
                           HealthStatus.HEALTHY : HealthStatus.DEGRADED;

      return {
        status,
        message: 'System resources check completed',
        details: {
          memory: {
            status: memoryStatus,
            total: totalMemory,
            used: usedMemory,
            free: freeMemory,
            usagePercent: Math.round(memoryUsage * 100) / 100,
          },
          cpu: {
            status: cpuStatus,
            loadAverage: cpuUsage,
            cores: cpuCores,
            usagePercent: Math.round(cpuUsagePercent * 100) / 100,
          },
          uptime: {
            system: uptime,
            process: processUptime,
          },
          platform: {
            type: os.type(),
            release: os.release(),
            arch: os.arch(),
            nodeVersion: process.version,
          },
        },
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: 'System resources check failed',
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // Check custom services
  async checkCustomServices(): Promise<Omit<HealthCheckResult, 'name'>> {
    const startTime = Date.now();
    try {
      const checks: any[] = [];

      // Check if all required environment variables are set
      const requiredEnvVars = [
        'DB_USER',
        'DB_NAME',
        'JWT_SECRET',
        'NODE_ENV',
      ];

      const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

      if (missingEnvVars.length > 0) {
        checks.push({
          name: 'environment_variables',
          status: HealthStatus.UNHEALTHY,
          error: `Missing environment variables: ${missingEnvVars.join(', ')}`,
        });
      } else {
        checks.push({
          name: 'environment_variables',
          status: HealthStatus.HEALTHY,
        });
      }

      const healthyChecks = checks.filter(c => c.status === HealthStatus.HEALTHY).length;
      const status = healthyChecks === checks.length ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY;

      return {
        status,
        message: `Custom services: ${healthyChecks}/${checks.length} healthy`,
        details: { checks },
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: 'Custom services health check failed',
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // Determine overall status
  private determineOverallStatus(results: any[]): HealthStatus {
    const unhealthyCount = results.filter(r => r.status === HealthStatus.UNHEALTHY).length;
    const degradedCount = results.filter(r => r.status === HealthStatus.DEGRADED).length;

    if (unhealthyCount > 0) {
      return HealthStatus.UNHEALTHY;
    } else if (degradedCount > 0) {
      return HealthStatus.DEGRADED;
    } else {
      return HealthStatus.HEALTHY;
    }
  }

  // Get MongoDB ready state text
  private getReadyStateText(readyState: number): string {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[readyState] || 'unknown';
  }

  // Parse Redis info
  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const parsed: any = {};

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        parsed[key] = value;
      }
    }

    return {
      version: parsed.redis_version,
      uptime: parsed.uptime_in_seconds,
      connectedClients: parsed.connected_clients,
      usedMemory: parsed.used_memory_human,
      totalCommands: parsed.total_commands_processed,
    };
  }

  // Get detailed health report
  async getDetailedHealthReport(): Promise<HealthReport> {
    const healthCheck = await this.performHealthCheck();
    
    const additionalMetrics = {
      application: {
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      dependencies: {
        node: process.version,
        mongoose: mongoose.version,
      },
      timestamp: new Date().toISOString(),
    };

    return {
      ...healthCheck,
      additionalMetrics,
    };
  }
}

export const healthService = new HealthService();
export default healthService;
