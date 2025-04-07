import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Controller('match/lists')
export class ListController {
  constructor(private readonly db: DatabaseService) {}

  @Get('teams')
  async getTeams() {
    // Get unique teams from players
    const players = await this.db.player.findMany();
    const teams = [...new Set(players.map(player => player.teamName))];
    return { teams };
  }

  @Get('players-by-team/:teamName')
  async getPlayersByTeam(@Param('teamName') teamName: string) {
    return await this.db.player.findMany({
      where: {
        teamName,
      },
      orderBy: {
        rating: 'desc',
      },
    });
  }

  @Get('top-players/:count')
  async getTopPlayers(@Param('count') count: string) {
    const limit = parseInt(count) || 5;
    return await this.db.player.findMany({
      orderBy: {
        rating: 'desc',
      },
      take: limit,
    });
  }

  @Get('moments-by-type/:type')
  async getMomentsByType(@Param('type') type: string) {
    return await this.db.replayMoment.findMany({
      where: {
        type: type.toUpperCase() as any,
      },
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
    });
  }

  @Get('active-game')
  async getActiveGame() {
    return await this.db.game.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
