import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserWithoutPassword } from './user.types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(user: User): Promise<UserWithoutPassword> {
    console.log('Creating user with data:', user); // Debugging log

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password if provided
    let hashedPassword = '';
    if (user.password) {
      hashedPassword = await bcrypt.hash(user.password, 10);
    }

    // Create the user
    const createdUser = await this.prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    });

    // Remove the password before returning the user
    const { password, ...result } = createdUser;
    return result;
  }

  // Add method for creating user from social login data
  async createFromSocial(userData: {
    email: string;
    firstName?: string;
    lastName?: string;
    password?: string | null;
    name?: string;
    socialProvider?: 'google' | 'apple' | null;
    socialId?: string;
    profilePictureUrl?: string;
  }): Promise<User> {
    // Extract firstName and lastName from name if they're not provided directly
    let firstName = userData.firstName || '';
    let lastName = userData.lastName || '';
    
    if (!firstName && userData.name) {
      if (userData.name.includes(' ')) {
        const nameParts = userData.name.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        firstName = userData.name;
      }
    }
    
    // Hash password if provided
    let hashedPassword = '';
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }
    
    return this.prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName,
        lastName,
        socialProvider: userData.socialProvider,
        socialId: userData.socialId,
        profilePictureUrl: userData.profilePictureUrl
      }
    });
  }

  // Link a social account to an existing user
  async linkSocialAccount(userId: string, provider: 'google' | 'apple', socialId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        socialProvider: provider,
        socialId: socialId
      }
    });
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.prisma.user.findMany();
    return users.map(({ password, ...rest }) => rest);
  }

  async findOne(id: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<UserWithoutPassword> {
    // Check if user exists
    await this.findOne(id);

    // Hash the password if it's being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  // Update user profile (name and profile picture)
  async updateUserProfile(userId: string, updateData: {
    name?: string;
    profilePictureUrl?: string;
  }): Promise<UserWithoutPassword> {
    // Extract firstName and lastName if name is provided
    const updateFields: any = {};
    
    if (updateData.name) {
      if (updateData.name.includes(' ')) {
        const nameParts = updateData.name.split(' ');
        updateFields.firstName = nameParts[0];
        updateFields.lastName = nameParts.slice(1).join(' ');
      } else {
        updateFields.firstName = updateData.name;
      }
    }
    
    if (updateData.profilePictureUrl) {
      updateFields.profilePictureUrl = updateData.profilePictureUrl;
    }
    
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateFields
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string): Promise<UserWithoutPassword> {
    // Check if user exists
    await this.findOne(id);

    const user = await this.prisma.user.delete({
      where: { id },
    });

    const { password, ...result } = user;
    return result;
  }

  // --- Refresh Token Methods ---
  async createRefreshToken(data: { token: string; userId: string; expiresAt: Date }) {
    return this.prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
  }

  async updateRefreshToken(token: string, updateData: Partial<{ revoked: boolean }>) {
    return this.prisma.refreshToken.update({ where: { token }, data: updateData });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
