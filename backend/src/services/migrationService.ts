import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

interface Migration {
  id: string;
  name: string;
  executed_at?: string;
  checksum: string;
}

interface MigrationResult {
  success: boolean;
  message: string;
  executedMigrations?: string[];
  failedMigrations?: Array<{ id: string; error: string }>;
}

class MigrationService {
  private migrationsPath: string;

  constructor() {
    this.migrationsPath = path.join(process.cwd(), 'src', 'database', 'migrations');
  }

  /**
   * Initialize the migrations table if it doesn't exist
   */
  async initializeMigrationsTable(): Promise<void> {
    try {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS migrations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          checksum VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      await pool.query(createTableSQL);
      console.log('✅ Migrations table verified');
    } catch (error) {
      console.error('❌ Failed to initialize migrations table:', error);
      throw error;
    }
  }

  /**
   * Get all migration files from the migrations directory
   */
  private getMigrationFiles(): string[] {
    if (!fs.existsSync(this.migrationsPath)) {
      fs.mkdirSync(this.migrationsPath, { recursive: true });
      return [];
    }

    return fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  /**
   * Parse migration file and extract up/down SQL
   */
  private parseMigrationFile(filePath: string): { up: string; down: string } {
    const content = fs.readFileSync(filePath, 'utf8');
    const parts = content.split('-- DOWN');
    
    if (parts.length !== 2) {
      // If no -- DOWN marker, assume entire file is UP and NO rollback possible
      const upContent = content.replace('-- UP', '').trim();
      return { up: upContent, down: '' };
    }

    const up = parts[0].replace('-- UP', '').trim();
    const down = parts[1].trim();

    return { up, down };
  }

  /**
   * Calculate checksum for migration content
   */
  private calculateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get executed migrations from database
   */
  private async getExecutedMigrations(): Promise<Map<string, Migration>> {
    const { rows } = await pool.query('SELECT * FROM migrations ORDER BY id');

    const executedMigrations = new Map<string, Migration>();
    rows.forEach(migration => {
      executedMigrations.set(migration.id, migration);
    });

    return executedMigrations;
  }

  /**
   * Execute SQL command
   */
  private async executeSQL(sql: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Some SQL files might contain multiple statements. 
      // pg pool.query() can handle multiple statements separated by semicolon in a single string,
      // but only if it's not a parameterized query. Raw migration SQL is fine.
      await client.query(sql);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('SQL execution error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Run pending migrations
   */
  async migrate(): Promise<MigrationResult> {
    try {
      await this.initializeMigrationsTable();

      const migrationFiles = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();
      const executedIds: string[] = [];
      const failedMigrations: Array<{ id: string; error: string }> = [];

      for (const file of migrationFiles) {
        const migrationId = file.replace('.sql', '');
        
        // Skip if already executed
        if (executedMigrations.has(migrationId)) {
          continue;
        }

        try {
          const filePath = path.join(this.migrationsPath, file);
          const { up } = this.parseMigrationFile(filePath);
          const content = fs.readFileSync(filePath, 'utf8');
          const checksum = this.calculateChecksum(content);

          console.log(`🔄 Running migration: ${migrationId}`);

          // Execute migration and record it in a single transaction if possible
          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            await client.query(up);
            await client.query(
              'INSERT INTO migrations (id, name, checksum, executed_at) VALUES ($1, $2, $3, NOW())',
              [migrationId, file, checksum]
            );
            await client.query('COMMIT');
          } catch (err) {
            await client.query('ROLLBACK');
            throw err;
          } finally {
            client.release();
          }

          executedIds.push(migrationId);
          console.log(`✅ Migration completed: ${migrationId}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Migration failed: ${migrationId}`, errorMessage);
          failedMigrations.push({ id: migrationId, error: errorMessage });
          
          // Stop migrations on first error to maintain state consistency
          break;
        }
      }

      return {
        success: failedMigrations.length === 0,
        message: `Executed ${executedIds.length} migrations, ${failedMigrations.length} failed`,
        executedMigrations: executedIds,
        failedMigrations
      };

    } catch (error) {
      console.error('❌ Migration process failed:', error);
      return {
        success: false,
        message: `Migration process failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Rollback last migration
   */
  async rollback(steps: number = 1): Promise<MigrationResult> {
    try {
      await this.initializeMigrationsTable();

      const { rows } = await pool.query(
        'SELECT * FROM migrations ORDER BY executed_at DESC LIMIT $1',
        [steps]
      );

      if (rows.length === 0) {
        return {
          success: true,
          message: 'No migrations to rollback'
        };
      }

      const rolledBackIds: string[] = [];
      const failedMigrations: Array<{ id: string; error: string }> = [];

      for (const migration of rows) {
        try {
          const filePath = path.join(this.migrationsPath, `${migration.id}.sql`);
          
          if (!fs.existsSync(filePath)) {
            throw new Error(`Migration file not found: ${filePath}`);
          }

          const { down } = this.parseMigrationFile(filePath);
          
          if (!down) {
            throw new Error(`No rollback (DOWN) SQL found for migration: ${migration.id}`);
          }

          console.log(`🔄 Rolling back migration: ${migration.id}`);

          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            await client.query(down);
            await client.query('DELETE FROM migrations WHERE id = $1', [migration.id]);
            await client.query('COMMIT');
          } catch (err) {
            await client.query('ROLLBACK');
            throw err;
          } finally {
            client.release();
          }

          rolledBackIds.push(migration.id);
          console.log(`✅ Migration rolled back: ${migration.id}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Rollback failed: ${migration.id}`, errorMessage);
          failedMigrations.push({ id: migration.id, error: errorMessage });
          break;
        }
      }

      return {
        success: failedMigrations.length === 0,
        message: `Rolled back ${rolledBackIds.length} migrations, ${failedMigrations.length} failed`,
        executedMigrations: rolledBackIds,
        failedMigrations
      };

    } catch (error) {
      console.error('❌ Rollback process failed:', error);
      return {
        success: false,
        message: `Rollback process failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get migration status
   */
  async status(): Promise<{
    executed: Migration[];
    pending: string[];
    total: number;
  }> {
    try {
      await this.initializeMigrationsTable();

      const migrationFiles = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();
      
      const executed: Migration[] = [];
      const pending: string[] = [];

      for (const file of migrationFiles) {
        const migrationId = file.replace('.sql', '');
        
        if (executedMigrations.has(migrationId)) {
          executed.push(executedMigrations.get(migrationId)!);
        } else {
          pending.push(migrationId);
        }
      }

      return {
        executed,
        pending,
        total: migrationFiles.length
      };

    } catch (error) {
      console.error('❌ Failed to get migration status:', error);
      throw error;
    }
  }

  /**
   * Create a new migration file
   */
  async createMigration(name: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
      const migrationId = `${timestamp}_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const fileName = `${migrationId}.sql`;
      const filePath = path.join(this.migrationsPath, fileName);

      const template = `-- UP
-- Add your migration SQL here
-- Example:
-- CREATE TABLE example_table (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- DOWN
-- Add your rollback SQL here
-- Example:
-- DROP TABLE IF EXISTS example_table;
`;

      fs.writeFileSync(filePath, template);
      console.log(`✅ Created migration: ${fileName}`);

      return migrationId;
    } catch (error) {
      console.error('❌ Failed to create migration:', error);
      throw error;
    }
  }

  /**
   * Validate migration files
   */
  async validate(): Promise<{
    valid: boolean;
    errors: Array<{ file: string; error: string }>;
  }> {
    try {
      const migrationFiles = this.getMigrationFiles();
      const errors: Array<{ file: string; error: string }> = [];

      for (const file of migrationFiles) {
        try {
          const filePath = path.join(this.migrationsPath, file);
          this.parseMigrationFile(filePath);
        } catch (error) {
          errors.push({
            file,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };

    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }

  /**
   * Reset database (drop all tables and re-run migrations)
   */
  async reset(): Promise<MigrationResult> {
    try {
      console.log('⚠️  WARNING: This will drop all tables and data!');
      
      // Get all tables in public schema
      const { rows } = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `);

      // Drop all tables
      for (const row of rows) {
        await pool.query(`DROP TABLE IF EXISTS "${row.table_name}" CASCADE;`);
      }

      console.log('✅ Database reset completed');

      // Re-run all migrations
      return await this.migrate();

    } catch (error) {
      console.error('❌ Database reset failed:', error);
      return {
        success: false,
        message: `Database reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const migrationService = new MigrationService();
export default migrationService;
