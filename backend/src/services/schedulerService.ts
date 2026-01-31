import cron from 'node-cron';
import { pool } from '../config/database';
// import { notificationService } from './notificationService';
// import { healthService } from './healthService';

export interface SchedulerJob {
  name: string;
  schedule: string;
  task: () => Promise<void>;
  options?: any;
  cronJob: any | null;
  isRunning: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  runCount: number;
  errorCount: number;
  createdAt: Date;
}

class SchedulerService {
  private jobs = new Map<string, SchedulerJob>();
  public isInitialized = false;

  constructor() {
    this.initialize();
  }

  // Initialize scheduler
  async initialize() {
    try {
      console.log('🔄 Initializing scheduler service...');

      // Register default jobs
      await this.registerDefaultJobs();

      // Start all jobs
      await this.startAllJobs();

      this.isInitialized = true;
      console.log('✅ Scheduler service initialized successfully');
    } catch (error) {
      console.error('❌ Scheduler initialization failed:', error);
      throw error;
    }
  }

  // Register default jobs
  async registerDefaultJobs() {
    try {
      // Daily cleanup job
      this.registerJob('daily-cleanup', '0 2 * * *', async () => {
        await this.performDailyCleanup();
      });

      // Health check job
      this.registerJob('health-check', '*/5 * * * *', async () => {
        await this.performHealthCheck();
      });

      // Subscription check job
      this.registerJob('subscription-check', '0 6 * * *', async () => {
        await this.checkSubscriptions();
      });

      console.log('✅ Default jobs registered');
    } catch (error) {
      console.error('❌ Register default jobs error:', error);
      throw error;
    }
  }

  // Register a new job
  registerJob(name: string, schedule: string, task: () => Promise<void>, options: any = {}) {
    try {
      if (this.jobs.has(name)) {
        console.warn(`⚠️ Job "${name}" already exists, stopping previous instance`);
        this.stopJob(name);
      }

      const job: SchedulerJob = {
        name,
        schedule,
        task,
        options,
        cronJob: null,
        isRunning: false,
        lastRun: null,
        nextRun: null,
        runCount: 0,
        errorCount: 0,
        createdAt: new Date(),
      };

      this.jobs.set(name, job);
      console.log(`✅ Job "${name}" registered with schedule: ${schedule}`);

      return job;
    } catch (error) {
      console.error(`❌ Register job "${name}" error:`, error);
      throw error;
    }
  }

  // Start a specific job
  startJob(name: string) {
    try {
      const job = this.jobs.get(name);
      if (!job) {
        throw new Error(`Job "${name}" not found`);
      }

      if (job.cronJob) {
        console.warn(`⚠️ Job "${name}" is already running`);
        return job;
      }

      job.cronJob = cron.schedule(job.schedule, async () => {
        await this.executeJob(job);
      }, {
        scheduled: false,
        timezone: process.env.TZ || 'UTC',
        ...job.options,
      });

      job.cronJob.start();
      job.isRunning = true;
      // job.nextRun = job.cronJob.nextDate().toDate();

      console.log(`✅ Job "${name}" started`);
      return job;
    } catch (error) {
      console.error(`❌ Start job "${name}" error:`, error);
      throw error;
    }
  }

  // Stop a specific job
  stopJob(name: string) {
    try {
      const job = this.jobs.get(name);
      if (!job) {
        throw new Error(`Job "${name}" not found`);
      }

      if (job.cronJob) {
        job.cronJob.stop();
        job.cronJob = null;
        job.isRunning = false;
        job.nextRun = null;
      }

      console.log(`✅ Job "${name}" stopped`);
      return job;
    } catch (error) {
      console.error(`❌ Stop job "${name}" error:`, error);
      throw error;
    }
  }

  // Start all jobs
  async startAllJobs() {
    try {
      console.log('🔄 Starting all scheduled jobs...');

      for (const [name] of this.jobs) {
        try {
          await this.startJob(name);
        } catch (error) {
          console.error(`❌ Failed to start job "${name}":`, error);
        }
      }

      console.log(`✅ Started ${this.jobs.size} jobs`);
    } catch (error) {
      console.error('❌ Start all jobs error:', error);
      throw error;
    }
  }

  // Stop all jobs
  async stopAllJobs() {
    try {
      console.log('🔄 Stopping all scheduled jobs...');

      for (const [name] of this.jobs) {
        try {
          this.stopJob(name);
        } catch (error) {
          console.error(`❌ Failed to stop job "${name}":`, error);
        }
      }

      console.log(`✅ Stopped ${this.jobs.size} jobs`);
    } catch (error) {
      console.error('❌ Stop all jobs error:', error);
      throw error;
    }
  }

  // Execute a job
  async executeJob(job: SchedulerJob) {
    try {
      job.isRunning = true;
      job.lastRun = new Date();
      job.runCount++;

      console.log(`🔄 Executing job: ${job.name}`);

      await job.task();

      console.log(`✅ Job "${job.name}" completed successfully`);
    } catch (error) {
      job.errorCount++;
      console.error(`❌ Job "${job.name}" failed:`, error);
    } finally {
      job.isRunning = false;
      // job.nextRun = job.cronJob ? job.cronJob.nextDate().toDate() : null;
    }
  }

  // Perform daily cleanup (SQL version)
  async performDailyCleanup() {
    try {
      console.log('🧹 Performing daily cleanup...');

      // Clean up old safety alerts
      const { rowCount: deletedAlerts } = await pool.query(
        "DELETE FROM safety_alerts WHERE created_at < NOW() - INTERVAL '90 days' AND (is_acknowledged = true OR type = 'check_in')"
      );

      // Clean up old location history
      const { rowCount: deletedLocations } = await pool.query(
        "DELETE FROM location_history WHERE created_at < NOW() - INTERVAL '30 days'"
      );

      // Clean up old messages
      const { rowCount: deletedMessages } = await pool.query(
        "DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '90 days'"
      );

      console.log('✅ Daily cleanup completed:', {
        deletedAlerts,
        deletedLocations,
        deletedMessages,
      });
    } catch (error) {
      console.error('❌ Daily cleanup error:', error);
      throw error;
    }
  }

  // Perform health check
  async performHealthCheck() {
    try {
      console.log('🏥 Performing health check...');
      await pool.query('SELECT 1');
      console.log('✅ Health check completed: healthy');
    } catch (error) {
      console.error('❌ Health check error:', error);
    }
  }

  // Check subscriptions
  async checkSubscriptions() {
    try {
      console.log('💳 Checking subscriptions...');
      
      const { rows: expiring } = await pool.query(
        "SELECT * FROM subscriptions WHERE status IN ('active', 'trialing') AND current_period_end < NOW() + INTERVAL '7 days'"
      );

      console.log(`✅ Subscription check completed: ${expiring.length} expiring soon`);
    } catch (error) {
      console.error('❌ Subscription check error:', error);
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      totalJobs: this.jobs.size,
      runningJobs: Array.from(this.jobs.values()).filter(job => job.isRunning).length,
    };
  }

  // Shutdown scheduler
  async shutdown() {
    try {
      console.log('🔄 Shutting down scheduler...');
      await this.stopAllJobs();
      console.log('✅ Scheduler shutdown completed');
    } catch (error) {
      console.error('❌ Scheduler shutdown error:', error);
      throw error;
    }
  }
}

export const schedulerService = new SchedulerService();
export default schedulerService;
