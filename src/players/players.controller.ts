import { Controller, Post, Body, Get, Param, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayerPerformanceService } from './player-performance.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerPerformanceDto } from './dto/player-performance.dto';

@Controller('players')
export class PlayersController {
  constructor(
    private readonly playersService: PlayersService,
    private readonly performanceService: PlayerPerformanceService
  ) {}

  @Post()
  async createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    try {
      // Check if player already exists
      const existingPlayer = await this.playersService.findPlayerByTeamAndNumber(
        createPlayerDto.team,
        createPlayerDto.number
      );
      
      if (existingPlayer) {
        throw new HttpException('Player with this team and number already exists', HttpStatus.CONFLICT);
      }

      const player = await this.playersService.createPlayer(createPlayerDto);
      return {
        message: 'Player created successfully',
        player
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create player: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAllPlayers() {
    try {
      const players = await this.playersService.findAllPlayers();
      return { players };
    } catch (error) {
      throw new HttpException('Failed to retrieve players: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findPlayerById(@Param('id') id: string) {
    try {
      const player = await this.playersService.findPlayerById(id);
      if (!player) {
        throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
      }
      return { player };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve player: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updatePlayer(@Param('id') id: string, @Body() updateData: Partial<CreatePlayerDto>) {
    try {
      const player = await this.playersService.findPlayerById(id);
      if (!player) {
        throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
      }
      
      const updatedPlayer = await this.playersService.updatePlayer(id, updateData);
      return {
        message: 'Player updated successfully',
        player: updatedPlayer
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update player: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deletePlayer(@Param('id') id: string) {
    try {
      const player = await this.playersService.findPlayerById(id);
      if (!player) {
        throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
      }
      
      await this.playersService.deletePlayer(id);
      return {
        message: 'Player deleted successfully'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to delete player: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Performance endpoints
  @Post(':id/performance')
  async recordPerformance(@Param('id') playerId: string, @Body() performanceDto: PlayerPerformanceDto) {
    try {
      // Ensure playerId in URL and body match
      performanceDto.playerId = playerId;
      
      // Check if player exists
      const player = await this.playersService.findPlayerById(playerId);
      if (!player) {
        throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
      }

      const performance = await this.performanceService.recordPerformance(performanceDto);
      return {
        message: 'Player performance recorded successfully',
        performance
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to record player performance: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/performance')
  async findPlayerPerformance(@Param('id') id: string) {
    try {
      const player = await this.playersService.findPlayerById(id);
      if (!player) {
        throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
      }
      
      const performances = await this.performanceService.findPlayerPerformance(id);
      return { 
        player,
        performances 
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve player performance: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  @Get('performance/:performanceId')
  async getPerformanceById(@Param('performanceId') performanceId: string) {
    try {
      const performance = await this.performanceService.getPerformanceById(performanceId);
      if (!performance) {
        throw new HttpException('Performance record not found', HttpStatus.NOT_FOUND);
      }
      
      return { performance };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve performance record: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  @Get('match/:matchId/performances')
  async getMatchPerformances(@Param('matchId') matchId: string) {
    try {
      const performances = await this.performanceService.getMatchPerformances(matchId);
      return { performances };
    } catch (error) {
      throw new HttpException('Failed to retrieve match performances: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
