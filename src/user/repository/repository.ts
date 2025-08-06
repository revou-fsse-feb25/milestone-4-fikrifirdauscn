import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { User } from "@prisma/client";

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
      },
    });
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data,
      });
      return updatedUser;
    } catch (error) {
      throw new Error(`User with ID ${id} not found.`);
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await this.prismaService.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`User with ID ${id} not found.`);
    }
  }

  async findUserById(id: number): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findAllUsers(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }
}
