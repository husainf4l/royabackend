import { Controller, Get, Param } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Controller('match/lists')
export class ListController {
  constructor(private readonly db: DatabaseService) {}

  @Get('teams')
  async getTeams() {
    // Get unique teams from players
    const players = await this.db.player.findMany();
    const teams = [...new Set(players.map(player => player.team))]; // Updated to match the `team` field in the schema
    return { teams };
  }

  @Get('players-by-team/:team')
  async getPlayersByTeam(@Param('team') team: string) {
    return await this.db.player.findMany({
      where: {
        team, // Updated to match the `team` field in the schema
      },
      orderBy: {
        number: 'asc', // Changed to order by `number` instead of `rating` (not in schema)
      },
    });
  }

  @Get('top-players/:count')
  async getTopPlayers(@Param('count') count: string) {
    const limit = parseInt(count) || 5;
    return await this.db.player.findMany({
      orderBy: {
        number: 'asc', // Changed to order by `number` (no `rating` field in schema)
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
