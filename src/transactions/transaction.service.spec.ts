import { Test } from '@nestjs/testing';
import { TransactionsService } from 'src/transactions/transaction.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('TransactionsService', () => {
  const prisma = {
    account: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: { create: jest.fn(), createMany: jest.fn(), count: jest.fn() },
    $transaction: (cb: any) => cb(prisma),
  } as unknown as PrismaService;

  let service: TransactionsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(TransactionsService);
    jest.clearAllMocks();
  });

  it('deposit increases balance', async () => {
    (prisma.account.findUnique as any).mockResolvedValue({ id: 1, userId: 10, balance: 1000 });
    (prisma.account.update as any).mockResolvedValue({ id: 1, balance: 1500 });

    const res = await service.deposit(10, { accountId: 1, amount: 500 });
    expect(res.balance).toBe(1500);
    expect(prisma.transaction.create).toHaveBeenCalled();
  });

  it('withdraw throws on insufficient balance', async () => {
    (prisma.account.findUnique as any).mockResolvedValue({ id: 1, userId: 10, balance: 100 });
    await expect(service.withdraw(10, { accountId: 1, amount: 200 })).rejects.toThrow('Insufficient balance');
  });
});
