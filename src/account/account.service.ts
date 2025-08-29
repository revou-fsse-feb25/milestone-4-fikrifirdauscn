import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateAccountDto) {
    // unique accountNumber dijaga oleh constraint, tapi kita kasih pesan ramah
    const exists = await this.prisma.account.findUnique({ where: { accountNumber: dto.accountNumber } });
    if (exists) throw new BadRequestException('Account number already exists');

    return this.prisma.account.create({
      data: { accountNumber: dto.accountNumber, userId, balance: dto.balance ?? 0 },
    });
  }

  async findMine(userId: number) {
    return this.prisma.account.findMany({ where: { userId } });
  }

  async findByIdOrThrow(id: number) {
    const acc = await this.prisma.account.findUnique({ where: { id } });
    if (!acc) throw new NotFoundException('Account not found');
    return acc;
  }

  async ensureOwner(accId: number, userId: number) {
    const acc = await this.findByIdOrThrow(accId);
    if (acc.userId !== userId) throw new ForbiddenException();
    return acc;
  }

  async update(id: number, userId: number, dto: UpdateAccountDto) {
    await this.ensureOwner(id, userId);
    return this.prisma.account.update({ where: { id }, data: dto });
  }

  async remove(id: number, userId: number) {
    await this.ensureOwner(id, userId);
    await this.prisma.account.delete({ where: { id } });
    return { message: 'Account deleted' };
  }
}
