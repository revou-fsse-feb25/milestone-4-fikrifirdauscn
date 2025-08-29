import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransactionService', () => {
  const prisma = {
    account: { findUnique: jest.fn(), update: jest.fn() },
    transaction: { create: jest.fn() },
    $transaction: (fn: any) => fn(prisma),
  } as unknown as PrismaService;

  it('deposit increments balance', async () => {
    prisma.account.findUnique = jest.fn().mockResolvedValue({ id: 1, userId: 10, balance: 100 });
    prisma.account.update = jest.fn().mockResolvedValue({ id: 1, balance: 150 });
    prisma.transaction.create = jest.fn().mockResolvedValue({ id: 1 });

    const svc = new TransactionService(prisma as any);
    const res = await svc.deposit(10, 1, 50);
    expect(res.account.balance).toBe(150);
    expect(prisma.transaction.create).toHaveBeenCalled();
  });
});