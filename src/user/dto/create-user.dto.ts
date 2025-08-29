// src/user/dto/create-user.dto.ts
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() @MinLength(6) password!: string;
}
