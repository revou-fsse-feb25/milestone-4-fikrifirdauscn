import { IsInt, IsPositive } from 'class-validator';
export class WithdrawDto {
  @IsInt() accountId!: number;
  @IsPositive() amount!: number;
}