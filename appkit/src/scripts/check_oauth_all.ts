
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from the root of appkit
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function check() {
  const targetId = '132bb02d-212b-43dc-b74c-79a42f4dbffa';
  console.log('--- Comprehensive Database Check ---');
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20));

  try {
    // 1. All applications
    const apps = await prisma.application.findMany({
      select: { id: true, name: true }
    });
    console.log(`\nFound ${apps.length} applications:`);
    apps.forEach(a => console.log(` - [${a.id}] ${a.name} ${a.id === targetId ? '<< TARGET' : ''}`));

    // 2. All OAuth Clients
    const clients = await prisma.oAuthClient.findMany({
      select: { id: true, clientId: true, name: true, applicationId: true, isActive: true }
    });
    console.log(`\nFound ${clients.length} OAuth Clients:`);
    clients.forEach(c => {
      console.log(` - [${c.id}] (clientId: ${c.clientId}) ${c.name} (appId: ${c.applicationId}) ${c.id === targetId || c.clientId === targetId ? '<< TARGET' : ''}`);
    });

  } catch (err) {
    console.error('Error during check:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
