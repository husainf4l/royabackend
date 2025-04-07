import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtService } from './jwt.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [JwtService],
  exports: [JwtService],
})
export class AuthModule {}
