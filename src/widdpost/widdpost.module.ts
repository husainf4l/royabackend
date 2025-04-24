import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { WiddPostController } from './widdpost.controller';
import { AIPostAgentService } from './aipostagent.service';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  ],
  controllers: [WiddPostController],
  providers: [AIPostAgentService],
  exports: [AIPostAgentService]
})
export class WiddPostModule {}