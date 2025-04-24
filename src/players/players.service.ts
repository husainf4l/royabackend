import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerPerformanceDto } from './dto/player-performance.dto';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async findPlayerByTeamAndNumber(team: string, number: number) {
    return this.prisma.player.findFirst({
      where: {
        team,
        number,
      },
    });
  }

  async getPlayerInfo(playerInfo: any) {
    const player = await this.prisma.player.findFirst({
      where: {
        team: playerInfo.team,
        number: playerInfo.number,
      },
    });
    if (!player) {
      throw new Error('Player not found');
    }

    const playerPerformance = await this.prisma.playerPerformance.findFirst({
      where: {
        playerId: player.id,
      },
    });

    return { player, playerPerformance }; 
  }
  
  async createPlayer(createPlayerDto: CreatePlayerDto) {
    return this.prisma.player.create({
      data: createPlayerDto,
    });
  }

  async findAllPlayers() {
    return this.prisma.player.findMany();
  }

  async findPlayerById(id: string) {
    return this.prisma.player.findUnique({
      where: { id },
    });
  }
  
  /**
   * Adds performance data for a player
   * @param playerId The ID of the player
   * @param performanceData The performance data to add
   * @returns The created player performance record
   */
  async addPlayerPerformance(playerId: string, performanceData: Omit<PlayerPerformanceDto, 'playerId'>) {
    // First check if player exists
    const player = await this.findPlayerById(playerId);
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }
    
    // Create the performance data
    return this.prisma.playerPerformance.create({
      data: {
        ...performanceData,
        playerId,
      },
      include: {
        player: true,
        match: true,
      },
    });
  }
  
  async updatePlayer(id: string, updateData: Partial<CreatePlayerDto>) {
    return this.prisma.player.update({
      where: { id },
      data: updateData,
    });
  }
  
  async deletePlayer(id: string) {
    return this.prisma.player.delete({
      where: { id },
    });
  }
}
