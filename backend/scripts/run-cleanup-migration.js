// Run the cleanup migration - using pg client directly
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runCleanupMigration() {
    console.log('🗑️  Running cleanup migration to remove unused tables...\n');

    const migrationPath = path.join(__dirname, '../src/migrations/024_remove_unused_tables.sql');
    
    if (!fs.existsSync(migrationPath)) {
        console.error('❌ Migration file not found:', migrationPath);
        process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements and execute
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} statements to execute\n`);

    const client = await pool.connect();
    let successCount = 0;
    let skipCount = 0;

    try {
        for (const statement of statements) {
            if (statement.toLowerCase().includes('drop table')) {
                const tableName = statement.match(/drop table if exists\s+([^\s]+)/i)?.[1] || 'unknown';
                try {
                    await client.query(statement);
                    console.log(`✅ Dropped: ${tableName}`);
                    successCount++;
                } catch (error) {
                    if (error.code === '42P01') {
                        console.log(`⏭️  Skipped (not exists): ${tableName}`);
                        skipCount++;
                    } else {
                        console.error(`❌ Failed: ${tableName} - ${error.message}`);
                    }
                }
            } else if (statement.toLowerCase().includes('comment on')) {
                try {
                    await client.query(statement);
                    console.log(`✅ Updated schema comment`);
                } catch (error) {
                    console.log(`⚠️  Comment update skipped: ${error.message}`);
                }
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Dropped: ${successCount} tables`);
        console.log(`   ⏭️  Skipped: ${skipCount} tables (didn't exist)`);
        console.log('\n🎉 Cleanup migration completed!');
    } finally {
        client.release();
        await pool.end();
    }
}

runCleanupMigration()
    .catch(e => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    });
