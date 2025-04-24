import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { PlayerPerformanceService } from './player-performance.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlayersController],
  providers: [PlayersService, PlayerPerformanceService],
  exports: [PlayersService, PlayerPerformanceService]
})
export class PlayersModule {}
