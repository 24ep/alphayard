const { PrismaClient } = require('../prisma/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

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
            await prisma.$executeRawUnsafe(sql);
            console.log(`Successfully applied ${file}`);
        } catch (err) {
            console.error(`Failed to apply ${file}:`, err.message);
        }
    }
    await prisma.$disconnect();
}

runSelected();
