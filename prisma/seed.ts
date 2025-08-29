// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // users
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

  // accounts
  const [accJohn, accJane] = await Promise.all([
    prisma.account.upsert({
      where: { accountNumber: '9000000010' },
      update: {},
      create: {
        accountNumber: '9000000010',
        userId: john.id,
        balance: 5000, // Decimal akan tersimpan ke NUMERIC(14,2)
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

  // transactions
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
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
