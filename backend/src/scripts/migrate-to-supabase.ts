#!/usr/bin/env ts-node

/**
 * Migration Converter Script
 * 
 * Converts numbered migrations (001_xxx.sql) to Supabase timestamped format
 * and moves them to supabase/migrations/
 * 
 * Usage:
 *   ts-node src/scripts/migrate-to-supabaseService.getSupabaseClient().ts
 */

import fs from 'fs';
import path from 'path';

interface MigrationFile {
  name: string;
  content: string;
  timestamp: string;
}

const BACKEND_MIGRATIONS_DIR = path.join(process.cwd(), 'src', 'database', 'migrations');
const SUPABASE_MIGRATIONS_DIR = path.join(process.cwd(), '..', 'supabase', 'migrations');

/**
 * Generate timestamp for Supabase migration format
 * Format: YYYYMMDDHHMMSS
 */
function generateTimestamp(offset: number = 0): string {
  const now = new Date();
  now.setSeconds(now.getSeconds() + offset);
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
}

/**
 * Extract description from migration filename
 */
function extractDescription(filename: string): string {
  // Remove number prefix and .sql extension
  const match = filename.match(/^\d+_(.+)\.sql$/);
  if (match) {
    return match[1];
  }
  // Fallback: use filename without extension
  return filename.replace('.sql', '');
}

/**
 * Read and process migration files
 */
function readMigrations(): MigrationFile[] {
  if (!fs.existsSync(BACKEND_MIGRATIONS_DIR)) {
    console.error(`❌ Migrations directory not found: ${BACKEND_MIGRATIONS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(BACKEND_MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

  const migrations: MigrationFile[] = [];
  
  files.forEach((file, index) => {
    const filePath = path.join(BACKEND_MIGRATIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    // const description = extractDescription(file); // Not used
    const timestamp = generateTimestamp(index); // Stagger timestamps
    
    migrations.push({
      name: file,
      content,
      timestamp,
    });
  });

  return migrations;
}

/**
 * Convert migration to Supabase format
 */
function convertToSupabaseFormat(migration: MigrationFile): string {
  const description = extractDescription(migration.name);
  const header = `-- Migration: ${description}\n-- Converted from: ${migration.name}\n\n`;
  
  // Ensure migration has UP/DOWN sections
  if (migration.content.includes('-- UP') && migration.content.includes('-- DOWN')) {
    return header + migration.content;
  }
  
  // If no UP/DOWN markers, assume all content is UP migration
  return header + '-- UP\n' + migration.content + '\n\n-- DOWN\n-- Rollback not defined\n';
}

/**
 * Main conversion function
 */
function convertMigrations() {
  console.log('🔄 Converting migrations to Supabase format...\n');

  // Ensure Supabase migrations directory exists
  if (!fs.existsSync(SUPABASE_MIGRATIONS_DIR)) {
    fs.mkdirSync(SUPABASE_MIGRATIONS_DIR, { recursive: true });
    console.log(`✅ Created directory: ${SUPABASE_MIGRATIONS_DIR}`);
  }

  const migrations = readMigrations();
  
  if (migrations.length === 0) {
    console.log('⚠️  No migrations found to convert');
    return;
  }

  console.log(`📋 Found ${migrations.length} migration(s) to convert\n`);

  const converted: string[] = [];

  migrations.forEach((migration) => {
    const description = extractDescription(migration.name);
    const newFilename = `${migration.timestamp}_${description}.sql`;
    const newFilePath = path.join(SUPABASE_MIGRATIONS_DIR, newFilename);
    const convertedContent = convertToSupabaseFormat(migration);

    // Check if file already exists
    if (fs.existsSync(newFilePath)) {
      console.log(`⚠️  Skipping ${newFilename} (already exists)`);
      return;
    }

    fs.writeFileSync(newFilePath, convertedContent, 'utf8');
    converted.push(newFilename);
    console.log(`✅ Converted: ${migration.name} → ${newFilename}`);
  });

  console.log(`\n✅ Conversion complete! ${converted.length} migration(s) converted`);
  console.log(`📁 Migrations saved to: ${SUPABASE_MIGRATIONS_DIR}`);
  console.log('\n📝 Next steps:');
  console.log('   1. Review the converted migrations');
  console.log('   2. Test with: supabase db reset');
  console.log('   3. Commit the new migration files');
  console.log('   4. Update your deployment process to use Supabase migrations');
}

// Run conversion
if (require.main === module) {
  convertMigrations();
}

export { convertMigrations };

