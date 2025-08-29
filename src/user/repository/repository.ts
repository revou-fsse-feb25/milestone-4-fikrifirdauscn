// src/user/repository/repository.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // NOTE: pastikan password SUDAH di-hash dari service sebelum dipanggil
  async createUser(data: CreateUserDto): Promise<User> {
    try {
      return await this.prismaService.user.create({
        data: {
          name: data.name,
          // username: data.username, // <- dihapus karena tidak ada di schema
          email: data.email,
          phone: data.phone ?? null,
          password: data.password,
        },
      });
    } catch (e) {
      // P2002 = unique constraint violation (mis. email sudah ada)
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }
      throw e;
    }
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    try {
      const updated = await this.prismaService.user.update({
        where: { id },
        data,
      });
      return updated;
    } catch (e) {
      // P2025 = record not found
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw e;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await this.prismaService.user.delete({ where: { id } });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw e;
    }
  }

  async findUserById(id: number): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async findAllUsers(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }
}
