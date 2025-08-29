import { IsOptional, IsString } from 'class-validator';
export class CreateAccountDto {
  @IsOptional() @IsString() nickname?: string; // optional label
}