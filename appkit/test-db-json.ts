import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.oAuthClient.findMany({
    select: { clientId: true, applicationId: true, name: true }
  });
  fs.writeFileSync('test-db-out.json', JSON.stringify(clients, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
