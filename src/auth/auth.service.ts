import { Injectable, UnauthorizedException, HttpException, HttpStatus, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserWithoutPassword } from '../users/user.types';
import { TokenVerifier } from './token-verifier';
import { SocialUserData } from './social-user.interface';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(body: { email: string; password: string }) {
    const user = await this.validateUser(body.email, body.password);
    if (!user) {
      this.logger.warn(`Failed login attempt for email: ${body.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = await this.issueRefreshToken(user.id);

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async issueRefreshToken(userId: string): Promise<string> {
    const { v4: uuidv4 } = await import('uuid');
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    await this.usersService.createRefreshToken({ token, userId, expiresAt });
    return token;
  }

  async validateRefreshToken(token: string): Promise<any> {
    const record = await this.usersService.findRefreshToken(token);

    if (!record || record.revoked || record.expiresAt < new Date()) {
      this.logger.warn(`Invalid or expired refresh token: ${token}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return record.user;
  }

  async rotateRefreshToken(oldToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const record = await this.usersService.findRefreshToken(oldToken);

    if (!record || record.revoked || record.expiresAt < new Date()) {
      this.logger.warn(`Invalid or expired refresh token (rotate): ${oldToken}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token
    await this.usersService.updateRefreshToken(oldToken, { revoked: true });

    // Issue new tokens
    const user = await this.usersService.findUserById(record.userId);
    if (!user) {
      this.logger.warn(`User not found for refresh token rotation: ${record.userId}`);
      throw new UnauthorizedException('User not found');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = await this.issueRefreshToken(user.id);

    this.logger.log(`Refresh token rotated for user: ${user.email}`);

    return { access_token, refresh_token };
  }

  async generateToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.firstName + (user.lastName ? ` ${user.lastName}` : ''),
      role: user.role
    };
    
    return this.jwtService.sign(payload);
  }

  async verifyGoogleToken(token: string): Promise<SocialUserData> {
    return TokenVerifier.verifyGoogleToken(token);
  }

  async verifyAppleToken(token: string): Promise<SocialUserData> {
    return TokenVerifier.verifyAppleToken(token);
  }

  async socialLogin(body: { token: string; provider: string }) {
    try {
      const { token, provider } = body;
      let userInfo;

      if (provider === 'google') {
        userInfo = await this.verifyGoogleToken(token);
      } else if (provider === 'apple') {
        userInfo = await this.verifyAppleToken(token);
      } else {
        throw new HttpException('Unsupported provider', HttpStatus.BAD_REQUEST);
      }

      // Find or create user
      let user = await this.usersService.findByEmail(userInfo.email);
      
      if (!user) {
        user = await this.usersService.createFromSocial({
          email: userInfo.email,
          name: userInfo.name,
          password: null,
          socialProvider: provider,
          socialId: userInfo.id,
          profilePictureUrl: userInfo.picture,
        });
      }

      const authToken = await this.generateToken(user);
      const refresh_token = await this.issueRefreshToken(user.id);

      this.logger.log(`User ${user.email} logged in via ${provider}`);

      return {
        access_token: authToken,
        refresh_token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          // Use optional chaining to avoid type errors
          profilePictureUrl: user?.profilePictureUrl,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.warn(`Social login failed: ${error.message}`);
      throw new HttpException(`Social authentication failed: ${error.message}`, HttpStatus.UNAUTHORIZED);
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        this.logger.warn(`Registration attempt with existing email: ${registerDto.email}`);
        throw new ConflictException('User with this email already exists');
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);



      const newUser = await this.usersService.createFromSocial({
        email: registerDto.email,
        password: registerDto.password,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName || 'null',
        socialProvider: null,
        socialId: undefined,
        profilePictureUrl: undefined
      });

      // Generate tokens
      const payload = { email: newUser.email, sub: newUser.id, role: newUser.role };
      const access_token = this.jwtService.sign(payload);
      const refresh_token = await this.issueRefreshToken(newUser.id);

      this.logger.log(`User registered successfully: ${newUser.email}`);

      return {
        access_token,
        refresh_token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      throw new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
