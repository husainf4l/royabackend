import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateLivePlayerDto, UpdateLivePlayerDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class LivePlayersService {
  constructor(private readonly prisma: DatabaseService) {}

  async findAll() {
    const players = await this.prisma.player.findMany({
      select: {
        id: true,
        performances: true,
        imageUrl: true,
      },
    });

    console.log('Players:', players);
    return players;
  }

  async findOne(id: string) {
    const livePlayer = await this.prisma.livePlayer.findUnique({
      where: { id },
      include: {
        player: true,
      },
    });

    if (!livePlayer) {
      throw new NotFoundException(`LivePlayer with ID ${id} not found`);
    }

    return livePlayer;
  }

  async findByPlayerId(playerId: string) {
    const livePlayer = await this.prisma.livePlayer.findUnique({
      where: { playerId },
      include: {
        player: true,
      },
    });

    if (!livePlayer) {
      throw new NotFoundException(`LivePlayer with player ID ${playerId} not found`);
    }

    return livePlayer;
  }

  async create(createLivePlayerDto: CreateLivePlayerDto) {
    // First check if player exists
    const player = await this.prisma.player.findUnique({
      where: { id: createLivePlayerDto.playerId },
    });

    if (!player) {
      throw new NotFoundException(`Player with ID ${createLivePlayerDto.playerId} not found`);
    }

    // Check if a live player entry already exists for this player
    const existingLivePlayer = await this.prisma.livePlayer.findUnique({
      where: { playerId: createLivePlayerDto.playerId },
    });

    if (existingLivePlayer) {
      // Update the existing record instead
      return this.update(existingLivePlayer.id, createLivePlayerDto);
    }

    // Create new live player entry
    return this.prisma.livePlayer.create({
      data: createLivePlayerDto,
      include: {
        player: true,
      },
    });
  }

  async update(id: string, updateLivePlayerDto: UpdateLivePlayerDto) {
    // Check if live player exists
    const livePlayer = await this.prisma.livePlayer.findUnique({
      where: { id },
    });

    if (!livePlayer) {
      throw new NotFoundException(`LivePlayer with ID ${id} not found`);
    }

    return this.prisma.livePlayer.update({
      where: { id },
      data: {
        ...updateLivePlayerDto,
        lastSeen: new Date(), // Update the last seen timestamp
      },
      include: {
        player: true,
      },
    });
  }

  async remove(id: string) {
    // Check if live player exists
    const livePlayer = await this.prisma.livePlayer.findUnique({
      where: { id },
    });

    if (!livePlayer) {
      throw new NotFoundException(`LivePlayer with ID ${id} not found`);
    }

    return this.prisma.livePlayer.delete({
      where: { id },
    });
  }

  async getActiveLivePlayers() {
    return this.prisma.livePlayer.findMany({
      where: {
        isActive: true,
      },
      include: {
        player: true,
      },
      orderBy: {
        lastSeen: 'desc',
      },
    });
  }

  async updatePlayerCoordinates(id: string, coordinates: any) {
    return this.prisma.livePlayer.update({
      where: { id },
      data: {
        coordinates,
        lastSeen: new Date(),
      },
      include: {
        player: true,
      },
    });
  }


  //create 

 
}
