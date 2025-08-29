import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding start...');

  
  await prisma.$queryRaw`SELECT 1`;

  
  const [john, jane] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        email: 'john@example.com',
        name: 'John Doe',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane@example.com' },
      update: {},
      create: {
        email: 'jane@example.com',
        name: 'Jane Smith',
        password: await bcrypt.hash('password123', 10),
      },
    }),
  ]);

  
  const [accJohn, accJane] = await Promise.all([
    prisma.account.upsert({
      where: { accountNumber: '9000000010' },
      update: {},
      create: {
        accountNumber: '9000000010',
        userId: john.id,
        balance: 5000,
      },
    }),
    prisma.account.upsert({
      where: { accountNumber: '9000000020' },
      update: {},
      create: {
        accountNumber: '9000000020',
        userId: jane.id,
        balance: 3000,
      },
    }),
  ]);

  
  await prisma.transaction.createMany({
    data: [
      {
        type: 'DEPOSIT',
        amount: 1000,
        toAccountId: accJohn.id,
        performedById: john.id,
        description: 'Initial deposit',
        createdAt: new Date(),
      },
      {
        type: 'TRANSFER',
        amount: 500,
        fromAccountId: accJohn.id,
        toAccountId: accJane.id,
        performedById: john.id,
        description: 'Send to Jane',
        createdAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  
  const [u, a, t] = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.transaction.count(),
  ]);
  console.log(`✅ Seeding done. Users=${u}, Accounts=${a}, Transactions=${t}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
