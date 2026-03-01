
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const clientId = '132bb02d-212b-43dc-b74c-79a42f4dbffa';
  console.log('--- Checking for ID:', clientId, '---');

  try {
    // 1. Check OAuthClient by ID
    const clientById = await prisma.oAuthClient.findUnique({
      where: { id: clientId }
    });
    console.log('OAuthClient by ID (UUID):', clientById ? 'FOUND' : 'NOT FOUND');
    if (clientById) {
      console.log('  Name:', clientById.name);
      console.log('  client_id field:', clientById.clientId);
      console.log('  isActive:', clientById.isActive);
    }

    // 2. Check OAuthClient by clientId field
    const clientByField = await prisma.oAuthClient.findUnique({
      where: { clientId: clientId }
    });
    console.log('OAuthClient by client_id field:', clientByField ? 'FOUND' : 'NOT FOUND');

    // 3. Check Application by ID
    const appById = await prisma.application.findUnique({
      where: { id: clientId }
    });
    console.log('Application by ID:', appById ? 'FOUND' : 'NOT FOUND');
    if (appById) {
      console.log('  Name:', appById.name);
    }

  } catch (err) {
    console.error('Error during check:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
