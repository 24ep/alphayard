import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function fixForeignKey() {
  try {
    console.log('🔍 Checking users table schemas...');
    
    const usersTables = await prisma.$queryRaw<any[]>`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'users' 
      ORDER BY table_schema
    `;
    
    console.log('Users tables found:', usersTables);
    
    // Check current FK constraint
    const fkCheck = await prisma.$queryRaw<any[]>`
      SELECT 
        tc.constraint_name, 
        tc.table_schema,
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
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
    
    console.log('\n📋 Current FK constraint:', fkCheck[0]);
    
    if (fkCheck.length > 0 && fkCheck[0].foreign_table_schema !== 'core') {
      console.log('\n🔧 Fixing foreign key constraint...');
      
      // First, check for orphaned records
      const orphanedCount = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count
        FROM public.unified_entities ue
        WHERE ue.owner_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM core.users u WHERE u.id = ue.owner_id
        )
      `;
      
      const orphaned = parseInt(orphanedCount[0]?.count || '0');
      console.log(`⚠️  Found ${orphaned} orphaned records`);
      
      if (orphaned > 0) {
        console.log('🔧 Setting orphaned owner_id to NULL...');
        await prisma.$executeRawUnsafe(`
          UPDATE public.unified_entities ue
          SET owner_id = NULL
          WHERE ue.owner_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM core.users u WHERE u.id = ue.owner_id
          )
        `);
        console.log('✅ Orphaned records fixed');
      }
      
      // Drop old constraint
      console.log('🔧 Dropping old constraint...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE public.unified_entities 
        DROP CONSTRAINT IF EXISTS unified_entities_owner_id_fkey
      `);
      
      // Make owner_id nullable temporarily if it's NOT NULL
      const ownerIdNullable = await prisma.$queryRaw<any[]>`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'unified_entities' 
        AND column_name = 'owner_id'
      `;
      
      if (ownerIdNullable[0]?.is_nullable === 'NO') {
        console.log('🔧 Making owner_id nullable...');
        await prisma.$executeRawUnsafe(`
          ALTER TABLE public.unified_entities 
          ALTER COLUMN owner_id DROP NOT NULL
        `);
      }
      
      // Create new constraint pointing to core.users
      console.log('🔧 Creating new constraint...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE public.unified_entities 
        ADD CONSTRAINT unified_entities_owner_id_fkey 
        FOREIGN KEY (owner_id) 
        REFERENCES core.users(id) 
        ON DELETE CASCADE
      `);
      
      console.log('✅ Foreign key constraint fixed!');
    } else if (fkCheck.length > 0 && fkCheck[0].foreign_table_schema === 'core') {
      console.log('✅ Foreign key constraint is already correct (points to core.users)');
    } else {
      console.log('⚠️  No foreign key constraint found, creating one...');
      
      // First, clean up orphaned records
      const orphanedCount = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count
        FROM public.unified_entities ue
        WHERE ue.owner_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM core.users u WHERE u.id = ue.owner_id
        )
      `;
      
      const orphaned = parseInt(orphanedCount[0]?.count || '0');
      console.log(`⚠️  Found ${orphaned} orphaned records`);
      
      if (orphaned > 0) {
        console.log('🔧 Setting orphaned owner_id to NULL...');
        await prisma.$executeRawUnsafe(`
          UPDATE public.unified_entities ue
          SET owner_id = NULL
          WHERE ue.owner_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM core.users u WHERE u.id = ue.owner_id
          )
        `);
        console.log('✅ Orphaned records fixed');
      }
      
      // Make owner_id nullable if needed
      const ownerIdNullable = await prisma.$queryRaw<any[]>`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'unified_entities' 
        AND column_name = 'owner_id'
      `;
      
      if (ownerIdNullable[0]?.is_nullable === 'NO') {
        console.log('🔧 Making owner_id nullable...');
        await prisma.$executeRawUnsafe(`
          ALTER TABLE public.unified_entities 
          ALTER COLUMN owner_id DROP NOT NULL
        `);
      }
      
      await prisma.$executeRawUnsafe(`
        ALTER TABLE public.unified_entities 
        ADD CONSTRAINT unified_entities_owner_id_fkey 
        FOREIGN KEY (owner_id) 
        REFERENCES core.users(id) 
        ON DELETE CASCADE
      `);
      console.log('✅ Foreign key constraint created!');
    }
    
    // Verify
    const verify = await prisma.$queryRaw<any[]>`
      SELECT 
        tc.constraint_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'unified_entities'
      AND tc.constraint_name = 'unified_entities_owner_id_fkey'
    `;
    
    console.log('\n✅ Verification:', verify[0]);
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixForeignKey();
