import { Controller, Post, Body, Res, Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtService } from './jwt.service';
import { DatabaseService } from '../database/database.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly db: DatabaseService
  ) {}

  @Post('register')
  async register(@Body() body, @Res() res: Response) {
    try {
      const { email, password, firstName, lastName } = body;

      // Check if user already exists
      const existingUser = await this.db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await this.db.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
      });

      // Generate tokens
      const tokens = await this.jwtService.generateTokens(user.id, user.email, user.role);

      return res.status(201).json({
        message: 'User registered successfully',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('login')
  async login(@Body() body, @Res() res: Response) {
    try {
      const { email, password } = body;

      // Find user
      const user = await this.db.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate tokens
      const tokens = await this.jwtService.generateTokens(user.id, user.email, user.role);

      return res.json({
        message: 'Login successful',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('refresh-token')
  async refreshToken(@Body() body, @Res() res: Response) {
    try {
      const { refreshToken } = body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      const result = await this.jwtService.refreshAccessToken(refreshToken);

      return res.json({
        accessToken: result.accessToken,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  }

  @Post('logout')
  async logout(@Body() body, @Res() res: Response) {
    try {
      const { refreshToken } = body;

      if (refreshToken) {
        await this.jwtService.revokeRefreshToken(refreshToken);
      }

      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
