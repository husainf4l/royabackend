import { Controller, Post, Body, HttpException, HttpStatus, Get, Req, Res, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import passport from 'passport';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration endpoint called for email: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const result = await this.authService.login(body);
    this.logger.log(`Login endpoint called for email: ${body.email}`);
    return result;
  }

  @Get('google')
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    try {
      passport.authenticate('google', { 
        scope: ['profile', 'email'] 
      })(req, res);
    } catch (error) {
      console.error('Google auth error:', error);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/auth/error?message=${encodeURIComponent('Failed to initiate Google authentication')}`);
    }
  }

  @Get('google/callback')
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      passport.authenticate('google', { session: false }, async (err, user) => {
        if (err) {
          console.error('Google callback error:', err);
          return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/auth/error?message=${encodeURIComponent(err.message || 'Authentication failed')}`);
        }
        
        if (!user) {
          return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/auth/error?message=${encodeURIComponent('User information not available')}`);
        }
        
        try {
          const token = await this.authService.generateToken(user);
          return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/auth/success?token=${token}`);
        } catch (tokenErr) {
          console.error('Token generation error:', tokenErr);
          return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/auth/error?message=${encodeURIComponent('Failed to generate authentication token')}`);
        }
      })(req, res);
    } catch (error) {
      console.error('Unexpected error in googleAuthRedirect:', error);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/auth/error?message=${encodeURIComponent('An unexpected error occurred')}`);
    }
  }

  @Get('apple')
  async appleAuth(@Req() req: Request, @Res() res: Response) {
    passport.authenticate('apple')(req, res);
  }

  @Get('apple/callback')
  async appleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    passport.authenticate('apple', { session: false }, async (err, user) => {
      if (err || !user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/auth/error`);
      }
      
      const token = await this.authService.generateToken(user);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/auth/success?token=${token}`);
    })(req, res);
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    this.logger.log('Refresh endpoint called');
    return this.authService.rotateRefreshToken(body.refresh_token);
  }

  @Post('social-login')
  async socialLogin(@Body() body: SocialLoginDto) {
    this.logger.log(`Social login endpoint called for provider: ${body.provider}`);
    return this.authService.socialLogin(body);
  }
}
