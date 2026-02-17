/**
 * Run Component Studio Full Seed Migration
 * This script populates all React Native component categories and styles
 */

const { PrismaClient } = require('../prisma/generated/prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment from .env if available
try {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
    console.log('No dotenv loaded, using defaults');
}

const prisma = new PrismaClient();

async function runMigration() {
    console.log('🚀 Running Component Studio Full Seed Migration...');
    console.log(`   Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'postgres'}`);
    
    const migrationPath = path.join(__dirname, '..', 'src', 'database', 'migrations', '055_component_studio_full_seed.sql');
    
    if (!fs.existsSync(migrationPath)) {
        console.error('❌ Migration file not found:', migrationPath);
        process.exit(1);
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    try {
        console.log('📦 Executing migration...');
        await prisma.$executeRawUnsafe(sql);
        console.log('✅ Migration completed successfully!');
        
        // Show stats
        const categoriesResult = await prisma.$queryRawUnsafe('SELECT COUNT(*) as count FROM component_categories');
        const stylesResult = await prisma.$queryRawUnsafe('SELECT COUNT(*) as count FROM component_styles');
        
        console.log(`\n📊 Results:`);
        console.log(`   - Component Categories: ${categoriesResult[0].count}`);
        console.log(`   - Component Styles: ${stylesResult[0].count}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        if (error.detail) console.error('   Detail:', error.detail);
        if (error.hint) console.error('   Hint:', error.hint);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runMigration();
