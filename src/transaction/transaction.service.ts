import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async deposit(userId: number, accountId: number, amount: number) {
    const acc = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!acc) throw new NotFoundException('Account not found');
    if (acc.userId !== userId) throw new ForbiddenException();

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: amount } },
      });
      const t = await tx.transaction.create({
        data: {
          type: 'DEPOSIT',
          amount,
          toAccountId: accountId,
          performedById: userId,
          description: 'Deposit',
        },
      });
      return { account: updated, transaction: t };
    });
  }

  async withdraw(userId: number, accountId: number, amount: number) {
    const acc = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!acc) throw new NotFoundException('Account not found');
    if (acc.userId !== userId) throw new ForbiddenException();
    if (Number(acc.balance) < amount) throw new BadRequestException('Insufficient balance');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } },
      });
      const t = await tx.transaction.create({
        data: {
          type: 'WITHDRAWAL',
          amount,
          fromAccountId: accountId,
          performedById: userId,
          description: 'Withdrawal',
        },
      });
      return { account: updated, transaction: t };
    });
  }

  async transfer(userId: number, fromAccountId: number, toAccountId: number, amount: number) {
    if (fromAccountId === toAccountId) throw new BadRequestException('Cannot transfer to the same account');
    const [from, to] = await Promise.all([
      this.prisma.account.findUnique({ where: { id: fromAccountId } }),
      this.prisma.account.findUnique({ where: { id: toAccountId } }),
    ]);
    if (!from || !to) throw new NotFoundException('Account not found');
    if (from.userId !== userId) throw new ForbiddenException();
    if (Number(from.balance) < amount) throw new BadRequestException('Insufficient balance');

    return this.prisma.$transaction(async (tx) => {
      const fromUpdated = await tx.account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } },
      });
      const toUpdated = await tx.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      });
      const t = await tx.transaction.create({
        data: {
          type: 'TRANSFER',
          amount,
          fromAccountId,
          toAccountId,
          performedById: userId,
          description: 'Transfer',
        },
      });
      return { from: fromUpdated, to: toUpdated, transaction: t };
    });
  }

  async listMine(userId: number) {
    return this.prisma.transaction.findMany({
      where: { performedById: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}