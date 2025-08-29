import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser, JwtUser } from 'src/common/decorators/current-user.decorator';
import { TransactionsService } from './transaction.service';
import { DepositWithdrawDto } from './dto/deposit-withdraw.dto';
import { TransferDto } from './dto/transfer.dto';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Get('me')
  @ApiOkResponse({ description: 'List my transactions' })
  list(@CurrentUser() user: JwtUser) {
    return this.service.listMine(user.id);
  }

  @Post('deposit')
  deposit(@CurrentUser() user: JwtUser, @Body() dto: DepositWithdrawDto) {
    return this.service.deposit(user.id, dto);
  }

  @Post('withdraw')
  withdraw(@CurrentUser() user: JwtUser, @Body() dto: DepositWithdrawDto) {
    return this.service.withdraw(user.id, dto);
  }

  @Post('transfer')
  transfer(@CurrentUser() user: JwtUser, @Body() dto: TransferDto) {
    return this.service.transfer(user.id, dto);
  }

  // (opsional) detail by id, tapi hanya kalau transaksi terkait akun milik user
  @Get(':id')
  async getOne(@CurrentUser() user: JwtUser, @Param('id', ParseIntPipe) id: number) {
    const tx = await this.service['prisma'].transaction.findUnique({ where: { id } });
    if (!tx) return null;
    // keamanan: pastikan ia terkait akun user
    const count = await this.service['prisma'].transaction.count({
      where: { id, OR: [{ fromAccount: { userId: user.id } }, { toAccount: { userId: user.id } }] },
    });
    return count ? tx : null;
  }
}
