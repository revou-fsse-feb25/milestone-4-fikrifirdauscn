import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

function randAccNo() {
  return '9' + Math.floor(100000000 + Math.random() * 900000000).toString(); // 10 digits
}

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, _dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: { userId, accountNumber: randAccNo() },
      select: { id: true, accountNumber: true, balance: true, status: true },
    });
  }

  async findAllMine(userId: number) {
    return this.prisma.account.findMany({
      where: { userId },
      select: { id: true, accountNumber: true, balance: true, status: true },
      orderBy: { id: 'asc' },
    });
  }

  async updateMine(userId: number, id: number, dto: UpdateAccountDto) {
    const acc = await this.prisma.account.findUnique({ where: { id } });
    if (!acc) throw new NotFoundException('Account not found');
    if (acc.userId !== userId) throw new ForbiddenException();
    return this.prisma.account.update({
      where: { id },
      data: dto,
      select: { id: true, accountNumber: true, balance: true, status: true },
    });
  }

  async removeMine(userId: number, id: number) {
    const acc = await this.prisma.account.findUnique({ where: { id } });
    if (!acc) throw new NotFoundException('Account not found');
    if (acc.userId !== userId) throw new ForbiddenException();
    return this.prisma.account.update({
      where: { id },
      data: { status: 'CLOSED' },
      select: { id: true, status: true },
    });
  }
}