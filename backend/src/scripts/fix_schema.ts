
import { pool } from '../config/database';

async function fixSchema() {
  const client = await pool.connect();
  try {
    console.log('Starting schema fix...');
    await client.query('BEGIN');

    // Check and add date_of_birth
    console.log('Checking date_of_birth...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'date_of_birth') THEN 
          ALTER TABLE users ADD COLUMN date_of_birth DATE; 
          RAISE NOTICE 'Added date_of_birth column';
        ELSE
          RAISE NOTICE 'date_of_birth column already exists';
        END IF; 
      END $$;
    `);

    // Check and add push_token
    console.log('Checking push_token...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'push_token') THEN 
          ALTER TABLE users ADD COLUMN push_token TEXT; 
          RAISE NOTICE 'Added push_token column';
        ELSE
          RAISE NOTICE 'push_token column already exists';
        END IF; 
      END $$;
    `);

    // Check and add notification_settings
    console.log('Checking notification_settings...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'notification_settings') THEN 
          ALTER TABLE users ADD COLUMN notification_settings JSONB DEFAULT '{}'; 
          RAISE NOTICE 'Added notification_settings column';
        ELSE
          RAISE NOTICE 'notification_settings column already exists';
        END IF; 
      END $$;
    `);

    // Check and add preferences
    console.log('Checking preferences...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferences') THEN 
          ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}'; 
          RAISE NOTICE 'Added preferences column';
        ELSE
          RAISE NOTICE 'preferences column already exists';
        END IF; 
      END $$;
    `);

    // Check and add is_onboarding_complete
    console.log('Checking is_onboarding_complete...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_onboarding_complete') THEN 
          ALTER TABLE users ADD COLUMN is_onboarding_complete BOOLEAN DEFAULT FALSE; 
          RAISE NOTICE 'Added is_onboarding_complete column';
        ELSE
          RAISE NOTICE 'is_onboarding_complete column already exists';
        END IF; 
      END $$;
    `);

    await client.query('COMMIT');
    console.log('Schema fix completed successfully.');

    // Verify
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log('Current columns in users table:', res.rows.map(r => r.column_name).join(', '));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error fixing schema:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

fixSchema();
