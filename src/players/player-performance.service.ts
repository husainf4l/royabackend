import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerPerformanceDto } from './dto/player-performance.dto';

@Injectable()
export class PlayerPerformanceService {
  constructor(private prisma: PrismaService) {}

  async recordPerformance(performanceDto: PlayerPerformanceDto) {
    return this.prisma.playerPerformance.create({
      data: performanceDto,
    });
  }

  async findPlayerPerformance(playerId: string) {
    return this.prisma.playerPerformance.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
      include: {
        match: true,
      },
    });
  }

  async getPerformanceById(id: string) {
    return this.prisma.playerPerformance.findUnique({
      where: { id },
      include: {
        player: true,
        match: true,
      },
    });
  }

  async getMatchPerformances(matchId: string) {
    return this.prisma.playerPerformance.findMany({
      where: { matchId },
      include: {
        player: true,
      },
    });
  }
}