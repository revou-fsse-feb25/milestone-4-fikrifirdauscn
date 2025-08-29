import { IsInt, IsPositive } from 'class-validator';
export class DepositDto {
  @IsInt() accountId!: number;
  @IsPositive() amount!: number;
}