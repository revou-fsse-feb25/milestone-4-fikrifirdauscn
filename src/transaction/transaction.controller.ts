import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post('deposit')
  deposit(@CurrentUser() u: { sub: number }, @Body() dto: DepositDto) {
    return this.service.deposit(u.sub, dto.accountId, dto.amount);
  }

  @Post('withdraw')
  withdraw(@CurrentUser() u: { sub: number }, @Body() dto: WithdrawDto) {
    return this.service.withdraw(u.sub, dto.accountId, dto.amount);
  }

  @Post('transfer')
  transfer(@CurrentUser() u: { sub: number }, @Body() dto: TransferDto) {
    return this.service.transfer(u.sub, dto.fromAccountId, dto.toAccountId, dto.amount);
  }

  @Get('me')
  listMine(@CurrentUser() u: { sub: number }) {
    return this.service.listMine(u.sub);
  }
}