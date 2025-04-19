import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIAgentController } from './ai-agent.controller';
import { AIAgentService } from './ai-agent.service';

@Module({
  imports: [ConfigModule],
  controllers: [AIAgentController],
  providers: [AIAgentService],
  exports: [AIAgentService],
})
export class AIAgentModule {}