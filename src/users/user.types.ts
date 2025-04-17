import { User as PrismaUser } from "@prisma/client";

export type User = PrismaUser;

// Create a type without the password field for security
export type UserWithoutPassword = Omit<User, 'password'>;

// Create helper types for social auth
export type SocialProvider = 'google' | 'apple' | null;

export interface UserCreateData {
  email: string;
  password?: string | null;
  name: string;
  socialProvider?: SocialProvider;
  socialId?: string | null;
  profilePictureUrl?: string | null;
}