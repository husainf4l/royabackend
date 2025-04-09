import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchDataService } from './match-data.service';
import { ListController } from './list.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MatchController, ListController],
  providers: [MatchDataService],
  exports: [MatchDataService],
})
export class MatchModule {}
