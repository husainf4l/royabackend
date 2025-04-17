import { Module } from '@nestjs/common';
import { LivekitController } from './livekit.controller';
import { LivekitService } from './livekit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CaptionService } from './caption/caption.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [LivekitController],
  providers: [LivekitService, CaptionService],
  exports: [LivekitService, CaptionService],
})
export class LivekitModule {}
