const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
});

const migrationsToRun = [
    '027_rename_house_to_circle_types.sql',
    '032_consolidate_user_management.sql'
];

async function runSelected() {
    for (const file of migrationsToRun) {
        console.log(`Applying ${file}...`);
        const filePath = path.join(__dirname, '..', 'database', 'migrations', file);
        const sql = fs.readFileSync(filePath, 'utf8');
        try {
            await pool.query(sql);
            console.log(`Successfully applied ${file}`);
        } catch (err) {
            console.error(`Failed to apply ${file}:`, err.message);
        }
    }
    await pool.end();
}

runSelected();
