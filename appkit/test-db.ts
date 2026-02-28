import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clientId = '132bb02d-212b-43dc-b74c-79a42f4dbffa';
  console.log('Checking client ID:', clientId);
  const client = await prisma.oAuthClient.findUnique({
    where: { clientId }
  });
  console.log('Client:', client);

  if (client?.applicationId) {
    const app = await prisma.application.findUnique({
      where: { id: client.applicationId }
    });
    console.log('App:', app);
  } else {
    console.log('No applicationId found on client.');
  }

  const allClients = await prisma.oAuthClient.findMany({
    select: { clientId: true, applicationId: true, name: true }
  });
  console.log('All Clients:', allClients);
}

main().catch(console.error).finally(() => prisma.$disconnect());
