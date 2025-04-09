import { Controller, Get, Post } from '@nestjs/common';
import { MatchDataService } from './match-data.service';
import { PlayerDto } from './dto/player.dto';
import { ReplayMomentDto } from './dto/replay-moment.dto';
import { GameInfoDto } from './dto/game.dto';

@Controller('match')
export class MatchController {
  constructor(
    private readonly matchDataService: MatchDataService,
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


}
