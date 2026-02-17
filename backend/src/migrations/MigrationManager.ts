import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

interface Migration {
  id: string;
  name: string;
  version: string;
  description: string;
  up: string;
  down: string;
  createdAt: Date;
  appliedAt?: Date;
}

interface MigrationResult {
  success: boolean;
  migration?: Migration;
  error?: string;
  duration: number;
}

class MigrationManager {
  private prisma: PrismaClient;
  private migrationsPath: string;
  private isInitialized: boolean = false;

  constructor(prisma: PrismaClient, migrationsPath: string = './src/migrations') {
    this.prisma = prisma;
    this.migrationsPath = migrationsPath;
  }

  /**
   * Initialize migration system
   */
  async initialize(): Promise<void> {
    try {
      // Create migrations directory if it doesn't exist
      await fs.mkdir(this.migrationsPath, { recursive: true });

      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();
      
      this.isInitialized = true;
      console.log('✅ Migration system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize migration system:', error);
      throw error;
    }
  }

  /**
   * Create migrations tracking table
   */
  private async createMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        version VARCHAR(50) NOT NULL,
        description TEXT,
        up_sql TEXT NOT NULL,
        down_sql TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        applied_at TIMESTAMP WITH TIME ZONE
      );
      
      CREATE INDEX IF NOT EXISTS idx_migrations_applied_at ON migrations(applied_at);
      CREATE INDEX IF NOT EXISTS idx_migrations_version ON migrations(version);
    `;

    await this.prisma.$executeRawUnsafe(createTableSQL);
  }

  /**
   * Create a new migration
   */
  async createMigration(name: string, description: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
    const migrationId = `${timestamp}_${name}`;
    const version = timestamp.replace(/[-_]/g, '');

    const migrationTemplate = `-- Migration: ${name}
-- Description: ${description}
-- Created: ${new Date().toISOString()}
-- Version: ${version}

-- UP SQL
BEGIN;

-- Add your migration SQL here
-- Example:
-- ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

COMMIT;

-- DOWN SQL
BEGIN;

-- Add your rollback SQL here
-- Example:
-- ALTER TABLE users DROP COLUMN new_field;

COMMIT;
`;

    const migrationPath = path.join(this.migrationsPath, `${migrationId}.sql`);
    await fs.writeFile(migrationPath, migrationTemplate, 'utf8');

    console.log(`✅ Migration created: ${migrationId}`);
    return migrationId;
  }

  /**
   * Load all migrations from files
   */
  private async loadMigrations(): Promise<Migration[]> {
    const files = await fs.readdir(this.migrationsPath);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();

    const migrations: Migration[] = [];

    for (const file of sqlFiles) {
      const filePath = path.join(this.migrationsPath, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Parse migration file
      const lines = content.split('\n');
      const nameMatch = file.match(/^(\d+)_(.+)\.sql$/);
      
      if (!nameMatch) continue;

      const [, timestamp, name] = nameMatch;
      const version = timestamp.replace(/[-_]/g, '');
      
      // Extract description from comments
      const descriptionMatch = content.match(/-- Description: (.+)/);
      const description = descriptionMatch ? descriptionMatch[1] : '';

      // Extract UP and DOWN SQL
      const upMatch = content.match(/-- UP SQL\s*\nBEGIN;(.*?);?\s*COMMIT;/s);
      const downMatch = content.match(/-- DOWN SQL\s*\nBEGIN;(.*?);?\s*COMMIT;/s);

      const up = upMatch ? upMatch[1].trim() : '';
      const downSql = downMatch ? downMatch[1].trim() : '';

      migrations.push({
        id: file.replace('.sql', ''),
        name,
        version,
        description,
        up,
        down: downSql,
        createdAt: new Date(parseInt(timestamp))
      });
    }

    return migrations;
  }

  /**
   * Get applied migrations from database
   */
  private async getAppliedMigrations(): Promise<Set<string>> {
    try {
      const result = await this.prisma.$queryRawUnsafe<Array<{ id: string }>>(
        'SELECT id FROM migrations ORDER BY applied_at'
      );
      
      return new Set(result.map(row => row.id));
    } catch (error) {
      // Table might not exist yet
      return new Set();
    }
  }

  /**
   * Run pending migrations
   */
  async migrate(): Promise<MigrationResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('🔄 Starting migrations...');
    
    const allMigrations = await this.loadMigrations();
    const appliedMigrations = await this.getAppliedMigrations();
    const pendingMigrations = allMigrations.filter(m => !appliedMigrations.has(m.id));

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return [];
    }

    const results: MigrationResult[] = [];

    for (const migration of pendingMigrations) {
      const startTime = Date.now();
      
      try {
        console.log(`⬆️  Applying migration: ${migration.name}`);
        
        // Execute migration in transaction
        await this.prisma.$transaction(async (tx) => {
          // Run migration SQL
          if (migration.up) {
            await tx.$executeRawUnsafe(migration.up);
          }
          
          // Record migration
          await tx.$executeRawUnsafe(`
            INSERT INTO migrations (id, name, version, description, up_sql, down_sql, created_at, applied_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          `, migration.id, migration.name, migration.version, migration.description, 
              migration.up, migration.down, migration.createdAt);
        });

        const duration = Date.now() - startTime;
        results.push({
          success: true,
          migration,
          duration
        });
        
        console.log(`✅ Migration applied: ${migration.name} (${duration}ms)`);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        results.push({
          success: false,
          migration,
          error: errorMessage,
          duration
        });
        
        console.error(`❌ Migration failed: ${migration.name} - ${errorMessage}`);
        throw error; // Stop on first failure
      }
    }

    console.log(`🎉 Migrations completed: ${results.filter(r => r.success).length}/${results.length}`);
    return results;
  }

  /**
   * Rollback last migration
   */
  async rollback(steps: number = 1): Promise<MigrationResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`⬇️  Rolling back ${steps} migration(s)...`);

    // Get last applied migrations
    const result = await this.prisma.$queryRawUnsafe<Array<{ id: string; name: string; version: string; description: string; down_sql: string; applied_at: Date }>>(
      'SELECT id, name, version, description, down_sql, applied_at FROM migrations ORDER BY applied_at DESC LIMIT $1',
      steps
    );

    const rollbackResults: MigrationResult[] = [];

    for (const row of result) {
      const startTime = Date.now();
      
      try {
        console.log(`⬇️  Rolling back migration: ${row.name}`);
        
        await this.prisma.$transaction(async (tx) => {
          // Run rollback SQL
          if (row.down_sql) {
            await tx.$executeRawUnsafe(row.down_sql);
          }
          
          // Remove migration record
          await tx.$executeRawUnsafe('DELETE FROM migrations WHERE id = $1', row.id);
        });

        const duration = Date.now() - startTime;
        rollbackResults.push({
          success: true,
          migration: {
            id: row.id,
            name: row.name,
            version: row.version,
            description: row.description,
            up: '',
            down: row.down_sql,
            createdAt: row.applied_at
          },
          duration
        });
        
        console.log(`✅ Migration rolled back: ${row.name} (${duration}ms)`);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        rollbackResults.push({
          success: false,
          migration: {
            id: row.id,
            name: row.name,
            version: row.version,
            description: row.description,
            up: '',
            down: row.down_sql,
            createdAt: row.applied_at
          },
          error: errorMessage,
          duration
        });
        
        console.error(`❌ Rollback failed: ${row.name} - ${errorMessage}`);
        throw error;
      }
    }

    console.log(`🎉 Rollback completed: ${rollbackResults.filter(r => r.success).length}/${rollbackResults.length}`);
    return rollbackResults;
  }

  /**
   * Get migration status
   */
  async status(): Promise<{
    pending: Migration[];
    applied: Migration[];
    total: number;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const allMigrations = await this.loadMigrations();
    const appliedMigrations = await this.getAppliedMigrations();
    
    const applied = allMigrations.filter(m => appliedMigrations.has(m.id));
    const pending = allMigrations.filter(m => !appliedMigrations.has(m.id));

    return {
      pending,
      applied,
      total: allMigrations.length
    };
  }

  /**
   * Reset all migrations (for development)
   */
  async reset(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Reset is not allowed in production environment');
    }

    console.log('🔄 Resetting all migrations...');
    
    // Drop migrations table
    await this.prisma.$executeRawUnsafe('DROP TABLE IF EXISTS migrations');
    
    // Re-initialize
    await this.initialize();
    
    console.log('✅ Migration system reset');
  }
}

export default MigrationManager;
