import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNumber } from 'class-validator';

export class DepositWithdrawDto {
  accountId: number;
  amount: number;
}

export class TransferDto {
  @ApiProperty({ example: 1 }) @IsInt() fromAccountId!: number;
  @ApiProperty({ example: 2 }) @IsInt() toAccountId!: number;
  @ApiProperty({ example: 500 }) @IsNumber() @IsPositive() amount!: number;
}
