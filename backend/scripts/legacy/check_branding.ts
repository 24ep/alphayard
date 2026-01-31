import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

const log = (msg: string) => {
    console.log(msg);
    fs.appendFileSync('branding_output.txt', msg + '\n');
};

async function checkBranding() {
  try {
    fs.writeFileSync('branding_output.txt', ''); // Clear file
    log('Checking app_settings using PG Pool...');
    
    // List all tables
    const tables = await pool.query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
        ORDER BY table_schema, table_name
    `);
    log('Tables found:');
    tables.rows.forEach(r => log(`- ${r.table_schema}.${r.table_name}`));

    // Check public.application_settings
    const tableRes2 = await pool.query("SELECT to_regclass('public.application_settings')");
    if (tableRes2.rows[0].to_regclass) {
        log('Table public.application_settings EXISTS. Checking content...');
        const { rows } = await pool.query("SELECT * FROM application_settings");
        log('Rows found: ' + rows.length);
        rows.forEach(r => {
             log(`Key: ${r.key || r.setting_key || r.config_key}`);
             log('Value: ' + JSON.stringify(r.value || r.setting_value || r.config_value, null, 2));
        });
    }

  } catch (err) {
    log('Database Error: ' + err);
  } finally {
    await pool.end();
  }
}

checkBranding();
