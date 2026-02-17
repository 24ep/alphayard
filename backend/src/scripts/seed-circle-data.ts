
import { prisma } from '../lib/prisma';
import { Prisma } from '../../prisma/generated/prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function seedCircleData() {
  console.log('🌱 Seeding Circle Types and Jaroonwit Circle...');

  try {
    // 1. Seed Circle Types (renamed from House Types)
    
    // Migration: Ensure 'circle' and 'team' exist with correct codes
    await prisma.$executeRaw(Prisma.sql`UPDATE bondarys.circle_types SET code = 'circle', name = 'Circle', description = 'Private circle' WHERE code = 'circle'`);
    await prisma.$executeRaw(Prisma.sql`UPDATE bondarys.circle_types SET code = 'team', name = 'Team', description = 'Work or project team' WHERE code = 'workplace'`);

    const circleTypes = [
      { name: 'Home', code: 'home', sort_order: 1, icon: 'home-heart', description: 'Your main family or home circle' },
      { name: 'Sharehouse', code: 'sharehouse', sort_order: 2, icon: 'home-group', description: 'Shared living space' },
      { name: 'Team', code: 'team', sort_order: 3, icon: 'briefcase-outline', description: 'Work or project team' },
      { name: 'Friendship', code: 'friend', sort_order: 4, icon: 'account-multiple-outline', description: 'Friend group' },
      { name: 'Club', code: 'club', sort_order: 5, icon: 'cards-club', description: 'Interest group or club' },
      { name: 'Other', code: 'other', sort_order: 6, icon: 'dots-horizontal', description: 'Other circle type' }
    ];

    for (const type of circleTypes) {
      const res = await prisma.$queryRaw<Array<{ id: string; code: string; name: string }>>(Prisma.sql`SELECT * FROM bondarys.circle_types WHERE code = ${type.code}`);
      if (res.length === 0) {
        console.log(`Creating circle type: ${type.name}`);
        await prisma.$executeRaw(Prisma.sql`
          INSERT INTO bondarys.circle_types (name, code, sort_order, icon, description) VALUES (${type.name}, ${type.code}, ${type.sort_order}, ${type.icon}, ${type.description})
        `);
      } else {
        console.log(`Circle type ${type.name} already exists. Updating...`);
        await prisma.$executeRaw(Prisma.sql`
          UPDATE bondarys.circle_types SET name = ${type.name}, sort_order = ${type.sort_order}, icon = ${type.icon}, description = ${type.description} WHERE code = ${type.code}
        `);
      }
    }

    // 2. Ensure User Jaroonwit Exists
    const email = 'jaroonwit.pool@gmail.com';
    let userId: string;
    let userRes = await prisma.$queryRaw<Array<{ id: string; email: string }>>(Prisma.sql`SELECT * FROM core.users WHERE email = ${email}`);

    if (userRes.length === 0) {
      console.log('Creating user Jaroonwit...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newUserId = uuidv4();
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO core.users (
            id, email, password_hash, first_name, last_name, 
            user_type, is_active, is_email_verified, is_onboarding_complete
        ) VALUES (${newUserId}::uuid, ${email}, ${hashedPassword}, 'Jaroonwit', 'Pool', 'circle', true, true, true)
      `);
      userId = newUserId;
    } else {
      console.log('User Jaroonwit already exists.');
      userId = userRes[0].id;
    }

    // 3. Create 'Jaroonwit Circle'
    const circleName = 'Jaroonwit Circle';
    let circleId: string;
    let circleRes = await prisma.$queryRaw<Array<{ id: string; name: string }>>(Prisma.sql`SELECT * FROM bondarys.circles WHERE name = ${circleName}`);

    if (circleRes.length === 0) {
        console.log('Creating Jaroonwit Circle...');
        const inviteCode = Math.random().toString(36).substring(7).toUpperCase();
        
        try {
             const fId = uuidv4();
             await prisma.$executeRaw(Prisma.sql`
                INSERT INTO bondarys.circles (id, name, type, description, owner_id, invite_code) 
                 VALUES (${fId}::uuid, ${circleName}, 'circle', 'Circle for Jaroonwit', ${userId}::uuid, ${inviteCode})
             `);
             circleId = fId;
        } catch (e: any) {
             console.log('Complex insert failed, trying simple insert...', e.message);
             const fId = uuidv4();
             await prisma.$executeRaw(Prisma.sql`
                INSERT INTO bondarys.circles (id, name, type) VALUES (${fId}::uuid, ${circleName}, 'circle')
             `);
             circleId = fId;
        }
    } else {
        console.log('Jaroonwit Circle already exists.');
        circleId = circleRes[0].id;
    }

    // 4. Link User to circle
    await prisma.$executeRaw(Prisma.sql`
        INSERT INTO bondarys.circle_members (circle_id, user_id, role, joined_at) 
         VALUES (${circleId}::uuid, ${userId}::uuid, 'owner', NOW()) 
         ON CONFLICT DO NOTHING
    `);
    console.log('Linked Jaroonwit to Circle.');

    console.log('✅ Seeding Complete.');
    await prisma.$disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedCircleData();
