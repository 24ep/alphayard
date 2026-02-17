import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function createUnifiedEntitiesTable() {
  try {
    console.log('🔍 Checking if unified_entities table exists...');

    // Check if table exists
    const tableCheck = await prisma.$queryRaw<any[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'unified_entities'
      ) as exists
    `;

    const exists = tableCheck[0]?.exists;

    if (exists) {
      console.log('✅ unified_entities table already exists');
      
      // Check foreign key constraint
      const fkCheck = await prisma.$queryRaw<any[]>`
        SELECT 
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'unified_entities'
        AND kcu.column_name = 'owner_id'
      `;

      if (fkCheck.length > 0) {
        console.log('✅ Foreign key constraint exists:', fkCheck[0]);
        if (fkCheck[0].foreign_table_name !== 'users' || fkCheck[0].foreign_table_name?.includes('core')) {
          console.log('⚠️  Foreign key might be pointing to wrong table. Expected: core.users');
        }
      } else {
        console.log('⚠️  No foreign key constraint found on owner_id');
      }
    } else {
      console.log('📋 Creating unified_entities table...');
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE public.unified_entities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type VARCHAR(100) NOT NULL,
          application_id UUID,
          owner_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'active',
          data JSONB DEFAULT '{}'::jsonb,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create indexes
      await prisma.$executeRawUnsafe(`
        CREATE INDEX idx_unified_entities_type ON public.unified_entities(type)
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX idx_unified_entities_owner ON public.unified_entities(owner_id)
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX idx_unified_entities_application ON public.unified_entities(application_id)
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX idx_unified_entities_status ON public.unified_entities(status)
      `);

      console.log('✅ unified_entities table created successfully');
    }

    // Verify the table structure
    const columns = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'unified_entities'
      ORDER BY ordinal_position
    `;

    console.log('\n📊 Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createUnifiedEntitiesTable();
