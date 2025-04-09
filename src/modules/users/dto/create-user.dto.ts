export class CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string; // Default is "USER"
  isActive?: boolean; // Default is true
}
