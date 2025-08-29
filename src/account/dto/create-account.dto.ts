import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsOptional, IsNumber } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: '9000000010' })
  @IsString() @Length(6, 32)
  accountNumber!: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional() @IsNumber()
  balance?: number;
}
