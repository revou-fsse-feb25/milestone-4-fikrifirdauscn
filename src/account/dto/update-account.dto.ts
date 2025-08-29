import { IsEnum, IsOptional } from 'class-validator';
import { AccountStatus } from '@prisma/client';
export class UpdateAccountDto {
  @IsOptional() @IsEnum(AccountStatus) status?: AccountStatus;
}