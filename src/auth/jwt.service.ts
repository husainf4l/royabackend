import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { SignOptions } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtService {
  private readonly jwtSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor(private readonly db: DatabaseService) {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
  }

  async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = jwt.sign(
      payload, 
      this.jwtSecret, 
      { expiresIn: this.accessTokenExpiry as any }
    );

    const refreshToken = uuidv4();
    
    // Calculate expiry date for refresh token using the configured refreshTokenExpiry
    const expiresAt = new Date();
    const expiryValue = parseInt(this.refreshTokenExpiry.replace(/\D/g, ''));
    const expiryUnit = this.refreshTokenExpiry.replace(/\d+/g, '');
    
    if (expiryUnit === 'd') {
      expiresAt.setDate(expiresAt.getDate() + expiryValue);
    } else if (expiryUnit === 'h') {
      expiresAt.setHours(expiresAt.getHours() + expiryValue);
    } else if (expiryUnit === 'm') {
      expiresAt.setMinutes(expiresAt.getMinutes() + expiryValue);
    }

    // Save refresh token to database
    await this.db.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt,
        userId,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async refreshAccessToken(refreshToken: string) {
    // Find the refresh token in the database
    const storedToken = await this.db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    // Generate new access token
    const payload: JwtPayload = {
      sub: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    };

    const accessToken = jwt.sign(
      payload, 
      this.jwtSecret, 
      { expiresIn: this.accessTokenExpiry as any }
    );

    return {
      accessToken,
    };
  }

  async revokeRefreshToken(token: string) {
    await this.db.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }
}
