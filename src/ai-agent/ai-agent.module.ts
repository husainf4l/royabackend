import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIAgentController } from './ai-agent.controller';
import { AIAgentService } from './ai-agent.service';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [ConfigModule, PlayersModule],
  controllers: [AIAgentController],
  providers: [AIAgentService],
  exports: [AIAgentService],
})
export class AIAgentModule {}