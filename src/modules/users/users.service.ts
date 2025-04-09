import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Role } from '@prisma/client'; // Import the Role enum from Prisma

@Injectable()
export class UsersService {
  constructor(private readonly prisma: DatabaseService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    // Ensure default values for optional fields and cast role to the Role enum
    const data = {
      ...createUserDto,
      role: (createUserDto.role || Role.USER) as Role, // Cast role to Role enum
      isActive: createUserDto.isActive ?? true, // Default isActive
    };
    return this.prisma.user.create({ data });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data = {
      ...updateUserDto,
      role: updateUserDto.role ? (updateUserDto.role as Role) : undefined, // Cast role to Role enum if provided
    };
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
