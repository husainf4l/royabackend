import { Controller, Get, Post } from '@nestjs/common';
import { MatchDataService } from './match-data.service';
import { PlayerDto } from './dto/player.dto';
import { ReplayMomentDto } from './dto/replay-moment.dto';
import { GameInfoDto } from './dto/game.dto';
import { SeedService } from './seed.service';

@Controller('match')
export class MatchController {
  constructor(
    private readonly matchDataService: MatchDataService,
    private readonly seedService: SeedService,
  ) {}

  @Get('current-game')
  getCurrentGameInfo(): GameInfoDto {
    return this.matchDataService.getCurrentGameInfo();
  }

  @Get('players')
  getPlayers(): PlayerDto[] {
    return this.matchDataService.getPlayers();
  }

  @Get('active-players')
  getActivePlayers(): PlayerDto[] {
    return this.matchDataService.getActivePlayers();
  }

  @Get('replay-moments')
  getAllReplayMoments(): ReplayMomentDto[] {
    return this.matchDataService.getAllReplayMoments();
  }

  @Get('featured-players')
  getFeaturedPlayers(): PlayerDto[] {
    return this.matchDataService.getFeaturedPlayers();
  }

  @Get('top-moments')
  getTopMoments(): ReplayMomentDto[] {
    return this.matchDataService.getTopMoments();
  }

//   @Get('seed-data')
//   async seedDemoData() {
//     console.log('Seeding demo data...');

//     return await this.seedService.seedDemoData();
//   }
}
