import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();


async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function main() {
  
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      username: 'johndoe123',
      email: 'johndoe@example.com',
      password: await hashPassword('securepassword123'),
      phone: '1234567890',
    },
  });

  
  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      username: 'janesmith456',
      email: 'janesmith@example.com',
      password: await hashPassword('anotherpassword456'),
      phone: '0987654321',
    },
  });

  
  const account1 = await prisma.account.create({
    data: {
      accountNumber: '1234567890',
      balance: 5000.0,
      status: 'ACTIVE',
      userId: user1.id,  // Menggunakan userId, bukan customerId
    },
  });

  // Membuat rekening untuk user kedua
  const account2 = await prisma.account.create({
    data: {
      accountNumber: '9876543210',
      balance: 10000.0,
      status: 'ACTIVE',
      userId: user2.id,  // Menggunakan userId, bukan customerId
    },
  });

  // Membuat transaksi untuk akun pertama (user1)
  await prisma.transaction.create({
    data: {
      type: 'DEPOSIT',
      amount: 1000.0,
      transactionDate: new Date(),
      description: 'Initial deposit',
      accountId: account1.id,
    },
  });

  // Membuat transaksi untuk akun kedua (user2)
  await prisma.transaction.create({
    data: {
      type: 'WITHDRAWAL',
      amount: 500.0,
      transactionDate: new Date(),
      description: 'ATM withdrawal',
      accountId: account2.id,
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding the database:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
