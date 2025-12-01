#!/usr/bin/env ts-node

/**
 * Seed Data Manager
 * 
 * Manages seed data for development and testing
 * 
 * Usage:
 *   ts-node src/scripts/seed-manager.ts seed        # Run seed
 *   ts-node src/scripts/seed-manager.ts clear       # Clear seed data
 *   ts-node src/scripts/seed-manager.ts validate    # Validate seed file
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';

const program = new Command();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_FILE = path.join(process.cwd(), '..', 'supabase', 'seed.sql');

/**
 * Run seed file
 */
async function runSeed() {
  console.log('🌱 Running seed data...\n');

  if (!fs.existsSync(SEED_FILE)) {
    console.error(`❌ Seed file not found: ${SEED_FILE}`);
    process.exit(1);
  }

  // const seedSQL = fs.readFileSync(SEED_FILE, 'utf8'); // Not used

  try {
    // Execute seed SQL
    // Note: Supabase client doesn't support raw SQL execution
    // This would need to be run via psql or Supabase CLI
    console.log('⚠️  Direct SQL execution not supported via Supabase client');
    console.log('💡 Use one of these methods:');
    console.log('   1. supabase db reset (runs seed automatically)');
    console.log('   2. psql < supabase/seed.sql');
    console.log('   3. Use Supabase CLI: supabase db execute < seed.sql');
  } catch (error) {
    console.error('❌ Failed to run seed:', error);
    process.exit(1);
  }
}

/**
 * Clear seed data
 */
async function clearSeed() {
  console.log('🧹 Clearing seed data...\n');

  const tables = [
    'family_members',
    'families',
    'users',
  ];

  try {
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) {
        console.warn(`⚠️  Could not clear ${table}: ${error.message}`);
      } else {
        console.log(`✅ Cleared ${table}`);
      }
    }

    console.log('\n✅ Seed data cleared');
  } catch (error) {
    console.error('❌ Failed to clear seed data:', error);
    process.exit(1);
  }
}

/**
 * Validate seed file
 */
function validateSeed() {
  console.log('🔍 Validating seed file...\n');

  if (!fs.existsSync(SEED_FILE)) {
    console.error(`❌ Seed file not found: ${SEED_FILE}`);
    process.exit(1);
  }

  const content = fs.readFileSync(SEED_FILE, 'utf8');

  const issues: string[] = [];

  // Check for common issues
  if (content.includes('password') && content.match(/password\s*=\s*['"][^'"]+['"]/i)) {
    issues.push('⚠️  Potential plaintext password found');
  }

  if (content.includes('TRUNCATE') && !content.includes('development')) {
    issues.push('⚠️  TRUNCATE without development check');
  }

  if (content.includes('DROP TABLE') || content.includes('DROP DATABASE')) {
    issues.push('❌ DROP statements found in seed file');
  }

  if (!content.includes('ON CONFLICT')) {
    issues.push('⚠️  Consider using ON CONFLICT for idempotent seeds');
  }

  if (issues.length === 0) {
    console.log('✅ Seed file looks good!');
  } else {
    console.log('Issues found:');
    issues.forEach(issue => console.log(`  ${issue}`));
  }
}

// CLI commands
program
  .name('seed-manager')
  .description('Manage database seed data')
  .version('1.0.0');

program
  .command('seed')
  .description('Run seed data')
  .action(runSeed);

program
  .command('clear')
  .description('Clear seed data')
  .action(clearSeed);

program
  .command('validate')
  .description('Validate seed file')
  .action(validateSeed);

program.parse();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

