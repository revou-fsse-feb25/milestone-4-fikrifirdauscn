import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: '9000000099' })
  @IsOptional() @IsString() @Length(6, 32)
  accountNumber?: string;
}
