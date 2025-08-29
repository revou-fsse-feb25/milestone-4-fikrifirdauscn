import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DepositWithdrawDto } from './dto/deposit-withdraw.dto';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  private async ensureOwner(accountId: number, userId: number) {
    const acc = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!acc) throw new NotFoundException('Account not found');
    if (acc.userId !== userId) throw new ForbiddenException();
    return acc;
  }

  async listMine(userId: number) {
    // transaksi yang melibatkan account milik user
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { fromAccount: { userId } },
          { toAccount: { userId } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deposit(userId: number, dto: DepositWithdrawDto) {
    await this.ensureOwner(dto.accountId, userId);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.account.update({
        where: { id: dto.accountId },
        data: { balance: { increment: dto.amount } },
      });

      await tx.transaction.create({
        data: {
          type: 'DEPOSIT',
          amount: dto.amount,
          toAccountId: dto.accountId,
          performedById: userId,
          description: 'Deposit',
        },
      });

      return updated;
    });
  }

  async withdraw(userId: number, dto: DepositWithdrawDto) {
    const acc = await this.ensureOwner(dto.accountId, userId);
    if (Number(acc.balance) < dto.amount) throw new BadRequestException('Insufficient balance');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.account.update({
        where: { id: dto.accountId },
        data: { balance: { decrement: dto.amount } },
      });

      await tx.transaction.create({
        data: {
          type: 'WITHDRAWAL',
          amount: dto.amount,
          fromAccountId: dto.accountId,
          performedById: userId,
          description: 'Withdraw',
        },
      });

      return updated;
    });
  }

  async transfer(userId: number, dto: TransferDto) {
    const from = await this.ensureOwner(dto.fromAccountId, userId);
    const to = await this.prisma.account.findUnique({ where: { id: dto.toAccountId } });
    if (!to) throw new NotFoundException('Destination account not found');
    if (from.id === to.id) throw new BadRequestException('Cannot transfer to the same account');
    if (Number(from.balance) < dto.amount) throw new BadRequestException('Insufficient balance');

    return this.prisma.$transaction(async (tx) => {
      const updatedFrom = await tx.account.update({
        where: { id: from.id },
        data: { balance: { decrement: dto.amount } },
      });
      await tx.account.update({
        where: { id: to.id },
        data: { balance: { increment: dto.amount } },
      });
      await tx.transaction.create({
        data: {
          type: 'TRANSFER',
          amount: dto.amount,
          fromAccountId: from.id,
          toAccountId: to.id,
          performedById: userId,
          description: 'Transfer',
        },
      });
      return updatedFrom;
    });
  }
}
