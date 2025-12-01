import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';


interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
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
  private supabase: SupabaseClient;
  private migrationsPath: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.migrationsPath = path.join(process.cwd(), 'src', 'database', 'migrations');
  }

  /**
   * Initialize the migrations table if it doesn't exist
   */
  async initializeMigrationsTable(): Promise<void> {
    try {
      // Check if migrations table exists
      const { error } = await this.supabase
        .from('migrations')
        .select('id')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, create it
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS migrations (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            checksum VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;

        await this.supabase.rpc('exec_sql', { sql: createTableSQL });
        console.log('✅ Migrations table created');
      } else if (error) {
        throw error;
      } else {
        console.log('✅ Migrations table already exists');
      }
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
      throw new Error(`Invalid migration file format: ${filePath}`);
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
    const { data, error } = await this.supabase
      .from('migrations')
      .select('*')
      .order('id');

    if (error) {
      throw error;
    }

    const executedMigrations = new Map<string, Migration>();
    (data || []).forEach(migration => {
      executedMigrations.set(migration.id, migration);
    });

    return executedMigrations;
  }

  /**
   * Execute SQL command
   */
  private async executeSQL(sql: string): Promise<void> {
    try {
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          await this.supabase.rpc('exec_sql', { sql: statement });
        }
      }
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
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

          // Execute migration
          await this.executeSQL(up);

          // Record migration as executed
          await this.supabase
            .from('migrations')
            .insert({
              id: migrationId,
              name: file,
              checksum,
              executed_at: new Date().toISOString()
            });

          executedIds.push(migrationId);
          console.log(`✅ Migration completed: ${migrationId}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Migration failed: ${migrationId}`, errorMessage);
          failedMigrations.push({ id: migrationId, error: errorMessage });
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

      const { data, error } = await this.supabase
        .from('migrations')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(steps);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          message: 'No migrations to rollback'
        };
      }

      const rolledBackIds: string[] = [];
      const failedMigrations: Array<{ id: string; error: string }> = [];

      for (const migration of data) {
        try {
          const filePath = path.join(this.migrationsPath, `${migration.id}.sql`);
          
          if (!fs.existsSync(filePath)) {
            throw new Error(`Migration file not found: ${filePath}`);
          }

          const { down } = this.parseMigrationFile(filePath);
          
          console.log(`🔄 Rolling back migration: ${migration.id}`);

          // Execute rollback
          await this.executeSQL(down);

          // Remove migration record
          await this.supabase
            .from('migrations')
            .delete()
            .eq('id', migration.id);

          rolledBackIds.push(migration.id);
          console.log(`✅ Migration rolled back: ${migration.id}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Rollback failed: ${migration.id}`, errorMessage);
          failedMigrations.push({ id: migration.id, error: errorMessage });
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
      
      // Get all tables
      const { data: tables, error: tablesError } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) {
        throw tablesError;
      }

      // Drop all tables
      for (const table of tables || []) {
        await this.executeSQL(`DROP TABLE IF EXISTS "${table.table_name}" CASCADE;`);
      }

      // Clear migrations table
      await this.supabase
        .from('migrations')
        .delete()
        .neq('id', 'dummy'); // Delete all records

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
