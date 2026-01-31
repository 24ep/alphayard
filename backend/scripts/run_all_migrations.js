const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const migrationsDir = path.join(__dirname, '../src/database/migrations');

if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations dir not found: ${migrationsDir}`);
    process.exit(1);
}

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

console.log(`Found ${files.length} migrations in ${migrationsDir}`);

for (const file of files) {
  console.log(`\n-----------------------------------`);
  console.log(`Running ${file}...`);
  console.log(`-----------------------------------`);
  
  const filePath = path.join(migrationsDir, file);
  
  // Use 'type' for Windows.
  // Note: This relies on the system having 'docker' in PATH and 'bondarys-db' container running.
  const cmd = `type "${filePath}" | docker exec -i bondarys-db psql -U postgres -d postgres`;
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n✅ ${file} completed.`);
  } catch (e) {
    console.error(`\n❌ ${file} failed with code ${e.status}.`);
    process.exit(1);
  }
}

console.log('\nAll migrations completed successfully.');
