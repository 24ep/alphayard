import cron from 'node-cron';
import { backupService } from './backupService';
import { auditService, AuditCategory, AuditAction } from './auditService';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

interface BackupSchedule {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  time: string; // cron format
  enabled: boolean;
  retention: number; // days to keep
  lastRun?: Date;
  nextRun?: Date;
}

class BackupScheduler {
  private schedules: Map<string, BackupSchedule> = new Map();
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.initializeDefaultSchedules();
  }

  /**
   * Initialize default backup schedules
   */
  private initializeDefaultSchedules(): void {
    // Daily backup at 2 AM
    this.addSchedule({
      id: 'daily-backup',
      name: 'Daily Full Backup',
      type: 'daily',
      time: '0 2 * * *',
      enabled: true,
      retention: 7,
    });

    // Weekly backup on Sunday at 3 AM
    this.addSchedule({
      id: 'weekly-backup',
      name: 'Weekly Full Backup',
      type: 'weekly',
      time: '0 3 * * 0',
      enabled: true,
      retention: 30,
    });

    // Monthly backup on 1st at 4 AM
    this.addSchedule({
      id: 'monthly-backup',
      name: 'Monthly Full Backup',
      type: 'monthly',
      time: '0 4 1 * *',
      enabled: true,
      retention: 365,
    });
  }

  /**
   * Add a backup schedule
   */
  addSchedule(schedule: BackupSchedule): void {
    this.schedules.set(schedule.id, schedule);
    
    if (schedule.enabled) {
      this.scheduleJob(schedule);
    }
  }

  /**
   * Remove a backup schedule
   */
  removeSchedule(id: string): void {
    const job = this.jobs.get(id);
    if (job) {
      job.stop();
      this.jobs.delete(id);
    }
    
    this.schedules.delete(id);
  }

  /**
   * Enable/disable a schedule
   */
  toggleSchedule(id: string, enabled: boolean): void {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error(`Schedule ${id} not found`);
    }

    schedule.enabled = enabled;

    if (enabled) {
      this.scheduleJob(schedule);
    } else {
      const job = this.jobs.get(id);
      if (job) {
        job.stop();
        this.jobs.delete(id);
      }
    }
  }

  /**
   * Schedule a backup job
   */
  private scheduleJob(schedule: BackupSchedule): void {
    // Stop existing job if any
    const existingJob = this.jobs.get(schedule.id);
    if (existingJob) {
      existingJob.stop();
    }

    // Create new job
    const job = cron.schedule(schedule.time, async () => {
      await this.executeBackup(schedule);
    }, {
      scheduled: true,
      timezone: 'UTC',
    });

    this.jobs.set(schedule.id, job);
    
    // Calculate next run time
    schedule.nextRun = this.getNextRunTime(schedule.time);
  }

  /**
   * Execute backup
   */
  private async executeBackup(schedule: BackupSchedule): Promise<void> {
    if (this.isRunning) {
      console.warn(`Backup ${schedule.id} skipped - another backup is running`);
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log(`🔄 Starting ${schedule.name}...`);
      
      // Log audit event
      await auditService.logAuditEvent({
        userId: null,
        action: AuditAction.SYSTEM_STARTUP,
        category: AuditCategory.SYSTEM,
        description: `Starting ${schedule.name}`,
        details: {
          scheduleId: schedule.id,
          scheduleType: schedule.type,
        },
      });

      // Execute backup
      const result = await backupService.createFullBackup({
        includeFiles: true,
        includeMedia: true,
        compression: true,
        encryption: true,
      });

      if (result.success) {
        // Update last run time
        schedule.lastRun = new Date();
        schedule.nextRun = this.getNextRunTime(schedule.time);

        // Clean up old backups
        await this.cleanupOldBackups(schedule);

        // Verify backup
        await this.verifyBackup(result.backupPath);

        // Upload to cloud storage if configured
        if (process.env.AWS_S3_BUCKET) {
          await this.uploadToCloud(result.backupPath);
        }

        const duration = Date.now() - startTime;
        console.log(`✅ ${schedule.name} completed successfully in ${duration}ms`);

        // Log success
        await auditService.logAuditEvent({
          userId: null,
          action: AuditAction.SYSTEM_STARTUP,
          category: AuditCategory.SYSTEM,
          description: `${schedule.name} completed successfully`,
          details: {
            scheduleId: schedule.id,
            backupPath: result.backupPath,
            duration,
          },
        });

      } else {
        throw new Error('Backup failed');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ ${schedule.name} failed after ${duration}ms:`, errorMessage);

      // Log failure
      await auditService.logAuditEvent({
        userId: null,
        action: AuditAction.SECURITY_ALERT,
        category: AuditCategory.SECURITY,
        description: `${schedule.name} failed`,
        details: {
          scheduleId: schedule.id,
          error: errorMessage,
          duration,
        },
      });

      // Send notification (if configured)
      await this.sendFailureNotification(schedule, errorMessage);

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Clean up old backups
   */
  private async cleanupOldBackups(schedule: BackupSchedule): Promise<void> {
    try {
      const backups = await backupService.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - schedule.retention);

      const oldBackups = backups.filter(backup => 
        backup.created < cutoffDate && 
        backup.name.includes(schedule.type)
      );

      for (const oldBackup of oldBackups) {
        await this.deleteBackup(oldBackup.name);
      }

      if (oldBackups.length > 0) {
        console.log(`🗑️  Cleaned up ${oldBackups.length} old backups for ${schedule.name}`);
      }

    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  /**
   * Delete backup
   */
  private async deleteBackup(backupName: string): Promise<void> {
    try {
      const fs = require('fs/promises');
      const path = require('path');
      const backupDir = process.env.BACKUP_DIR || './backups';
      const backupPath = path.join(backupDir, backupName);

      await fs.rm(backupPath, { recursive: true, force: true });
    } catch (error) {
      console.error(`Failed to delete backup ${backupName}:`, error);
    }
  }

  /**
   * Verify backup integrity
   */
  private async verifyBackup(backupPath: string): Promise<void> {
    try {
      const fs = require('fs/promises');
      const stats = await fs.stat(backupPath);
      
      if (!stats.isDirectory()) {
        throw new Error('Backup path is not a directory');
      }

      // Check for essential files
      const essentialFiles = ['database.sql'];
      for (const file of essentialFiles) {
        const filePath = `${backupPath}/${file}`;
        try {
          await fs.access(filePath);
        } catch {
          throw new Error(`Missing essential file: ${file}`);
        }
      }

      console.log(`✅ Backup verification passed for ${backupPath}`);

    } catch (error) {
      throw new Error(`Backup verification failed: ${error}`);
    }
  }

  /**
   * Upload backup to cloud storage
   */
  private async uploadToCloud(backupPath: string): Promise<void> {
    if (!process.env.AWS_S3_BUCKET) {
      return;
    }

    try {
      const AWS = require('aws-sdk');
      const s3 = new AWS.S3();
      const path = require('path');

      const backupName = path.basename(backupPath);
      const key = `backups/${backupName}.tar.gz`;

      // Create compressed archive
      const archivePath = `${backupPath}.tar.gz`;
      await execAsync(`tar -czf ${archivePath} -C ${path.dirname(backupPath)} ${path.basename(backupPath)}`);

      // Upload to S3
      const fileContent = require('fs').createReadStream(archivePath);
      
      await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: fileContent,
        ServerSideEncryption: 'AES256',
        StorageClass: 'STANDARD_IA',
      }).promise();

      // Clean up local archive
      await require('fs/promises').unlink(archivePath);

      console.log(`☁️  Backup uploaded to cloud: s3://${process.env.AWS_S3_BUCKET}/${key}`);

    } catch (error) {
      console.error('Failed to upload backup to cloud:', error);
      // Don't throw error - backup is still valid locally
    }
  }

  /**
   * Send failure notification
   */
  private async sendFailureNotification(schedule: BackupSchedule, error: string): Promise<void> {
    try {
      // Send email notification (if configured)
      if (process.env.SMTP_HOST && process.env.ADMIN_EMAIL) {
        const nodemailer = require('nodemailer');
        
        const transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: process.env.ADMIN_EMAIL,
          subject: `🚨 Backup Failed: ${schedule.name}`,
          html: `
            <h2>Backup Failure Alert</h2>
            <p><strong>Schedule:</strong> ${schedule.name}</p>
            <p><strong>Type:</strong> ${schedule.type}</p>
            <p><strong>Error:</strong> ${error}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p>Please check the backup system immediately.</p>
          `,
        });
      }

      // Send Slack notification (if configured)
      if (process.env.SLACK_WEBHOOK_URL) {
        const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 Backup Failed: ${schedule.name}`,
            attachments: [{
              color: 'danger',
              fields: [
                { title: 'Schedule', value: schedule.name },
                { title: 'Type', value: schedule.type },
                { title: 'Error', value: error },
                { title: 'Time', value: new Date().toISOString() },
              ],
            }],
          }),
        });

        if (!response.ok) {
          console.error('Failed to send Slack notification');
        }
      }

    } catch (notificationError) {
      console.error('Failed to send failure notification:', notificationError);
    }
  }

  /**
   * Get next run time for cron schedule
   */
  private getNextRunTime(cronExpression: string): Date {
    // Simple calculation - in production, use a proper cron parser
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setDate(nextRun.getDate() + 1); // Next day for simplicity
    return nextRun;
  }

  /**
   * Get all schedules
   */
  getSchedules(): BackupSchedule[] {
    return Array.from(this.schedules.values());
  }

  /**
   * Get schedule by ID
   */
  getSchedule(id: string): BackupSchedule | undefined {
    return this.schedules.get(id);
  }

  /**
   * Start the scheduler
   */
  start(): void {
    console.log('🚀 Starting backup scheduler...');
    
    // Schedule all enabled jobs
    for (const schedule of this.schedules.values()) {
      if (schedule.enabled) {
        this.scheduleJob(schedule);
      }
    }

    console.log(`✅ Backup scheduler started with ${this.jobs.size} active schedules`);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    console.log('🛑 Stopping backup scheduler...');
    
    // Stop all jobs
    for (const job of this.jobs.values()) {
      job.stop();
    }
    
    this.jobs.clear();
    console.log('✅ Backup scheduler stopped');
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    activeSchedules: number;
    nextRun?: Date;
  } {
    const activeSchedules = Array.from(this.schedules.values()).filter(s => s.enabled);
    const nextRuns = activeSchedules
      .filter(s => s.nextRun)
      .map(s => s.nextRun!)
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      isRunning: this.isRunning,
      activeSchedules: this.jobs.size,
      nextRun: nextRuns[0],
    };
  }
}

export const backupScheduler = new BackupScheduler();
export default backupScheduler;
