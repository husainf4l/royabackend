import { Module } from '@nestjs/common';
import { LivePlayersController } from './live-players.controller';
import { LivePlayersService } from './live-players.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LivePlayersController],
  providers: [LivePlayersService],
  exports: [LivePlayersService],
})
export class LivePlayersModule {}
