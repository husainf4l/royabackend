import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchDataService } from './match-data.service';
import { SeedService } from './seed.service';
import { ListController } from './list.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MatchController, ListController],
  providers: [MatchDataService, SeedService],
  exports: [MatchDataService],
})
export class MatchModule {}
