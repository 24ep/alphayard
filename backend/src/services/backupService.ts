import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  EXPORT = 'export',
}

export interface BackupOptions {
  includeFiles?: boolean;
  includeMedia?: boolean;
  compression?: boolean;
  encryption?: boolean;
  password?: string;
}

class BackupService {
  private backupDir = process.env.BACKUP_DIR || './backups';

  constructor() {
    this.ensureBackupDirectory();
  }

  private async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create backup directory:', error);
    }
  }

  async createFullBackup(options: BackupOptions = {}) {
    try {
      console.log('🔄 Starting full backup (PostgreSQL)...');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `full-backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, backupName);
      await fs.mkdir(backupPath, { recursive: true });

      // PostgreSQL backup using pg_dump
      const dbBackupPath = path.join(backupPath, 'database.sql');
      const dbUrl = process.env.DATABASE_URL; // Using DATABASE_URL instead of individual vars for simplicity
      
      if (!dbUrl) {
          throw new Error('DATABASE_URL is not defined in environment variables');
      }

      await execAsync(`pg_dump "${dbUrl}" > "${dbBackupPath}"`);

      console.log('✅ Full backup completed successfully');
      
      return {
        success: true,
        backupPath,
        backupName,
        timestamp,
      };
    } catch (error) {
      console.error('❌ Full backup failed:', error);
      throw error;
    }
  }

  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = await Promise.all(
        files.map(async (file) => {
          const stats = await fs.stat(path.join(this.backupDir, file));
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime,
          };
        })
      );
      return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      console.error('List backups error:', error);
      return [];
    }
  }
}

export const backupService = new BackupService();
export default backupService;
