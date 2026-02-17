const { PrismaClient } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

async function inspect() {
    try {
        console.log('--- Columns in circles ---');
        const cols = await prisma.$queryRawUnsafe(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'circles'
            ORDER BY ordinal_position
        `);
        console.table(cols);

        console.log('\n--- Constraints on circles ---');
        const cons = await prisma.$queryRawUnsafe(`
            SELECT conname, pg_get_constraintdef(oid)
            FROM pg_constraint
            WHERE conrelid = 'circles'::regclass
        `);
        console.table(cons);
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

inspect();
