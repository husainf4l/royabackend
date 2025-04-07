import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateLivePlayerDto, UpdateLivePlayerDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class LivePlayersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.livePlayer.findMany({
      include: {
        player: true,
      },
    });
  }

  async findOne(id: string) {
    const livePlayer = await this.db.livePlayer.findUnique({
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
    const livePlayer = await this.db.livePlayer.findUnique({
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
    const player = await this.db.player.findUnique({
      where: { id: createLivePlayerDto.playerId },
    });

    if (!player) {
      throw new NotFoundException(`Player with ID ${createLivePlayerDto.playerId} not found`);
    }

    // Check if a live player entry already exists for this player
    const existingLivePlayer = await this.db.livePlayer.findUnique({
      where: { playerId: createLivePlayerDto.playerId },
    });

    if (existingLivePlayer) {
      // Update the existing record instead
      return this.update(existingLivePlayer.id, createLivePlayerDto);
    }

    // Create new live player entry
    return this.db.livePlayer.create({
      data: createLivePlayerDto,
      include: {
        player: true,
      },
    });
  }

  async update(id: string, updateLivePlayerDto: UpdateLivePlayerDto) {
    // Check if live player exists
    const livePlayer = await this.db.livePlayer.findUnique({
      where: { id },
    });

    if (!livePlayer) {
      throw new NotFoundException(`LivePlayer with ID ${id} not found`);
    }

    return this.db.livePlayer.update({
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
    const livePlayer = await this.db.livePlayer.findUnique({
      where: { id },
    });

    if (!livePlayer) {
      throw new NotFoundException(`LivePlayer with ID ${id} not found`);
    }

    return this.db.livePlayer.delete({
      where: { id },
    });
  }

  async getActiveLivePlayers() {
    return this.db.livePlayer.findMany({
      where: {
        isActive: true,
      },
      include: {
        player: true,
      },
    });
  }

  async updatePlayerCoordinates(id: string, coordinates: any) {
    return this.db.livePlayer.update({
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

  async seedDemoData() {
    const teamColors = {
      primaryGreen: '#10814E',
      accentGold: '#E8B62F',
    };

    try {
      // First check if migrations have been run
      try {
        // Try to query the database to check if tables exist
        await this.db.player.findFirst();
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.message.includes('does not exist in the current database')) {
          throw new InternalServerErrorException(
            'Database tables do not exist. Please run migrations first with: npm run prisma:migrate'
          );
        }
        throw error;
      }

      // Start transaction to ensure data consistency
      return this.db.$transaction(async (prisma) => {
        // Create sample players if not exist
        const players = [];
        
        // Create 6 sample players with different positions
        const samplePlayers = [
          {
            name: 'محمد الشمراني',
            number: 10,
            position: 'مهاجم',
            performance: 92,
            energy: 84,
            speed: 32.4,
            teamName: 'الهلال',
            topShots: ['https://example.com/player1_shot1.jpg', 'https://example.com/player1_shot2.jpg'],
            goals: 12,
            assists: 8,
            teamColor: teamColors.primaryGreen,
            rating: 8.7,
          },
          {
            name: 'خالد العتيبي',
            number: 7,
            position: 'جناح أيمن',
            performance: 88,
            energy: 79, 
            speed: 34.2,
            teamName: 'الهلال',
            topShots: ['https://example.com/player2_shot1.jpg'],
            goals: 8,
            assists: 14,
            teamColor: teamColors.primaryGreen,
            rating: 8.4,
          },
          {
            name: 'سعود المطيري',
            number: 5,
            position: 'مدافع',
            performance: 85,
            energy: 90,
            speed: 29.8,
            teamName: 'الهلال',
            topShots: ['https://example.com/player3_shot1.jpg'],
            goals: 2,
            assists: 5,
            teamColor: teamColors.primaryGreen,
            rating: 8.1,
          },
          {
            name: 'أحمد الدوسري',
            number: 1,
            position: 'حارس مرمى',
            performance: 89,
            energy: 75,
            speed: 25.6,
            teamName: 'الهلال',
            topShots: ['https://example.com/player4_shot1.jpg'],
            goals: 0,
            assists: 0,
            teamColor: teamColors.primaryGreen,
            rating: 8.5,
          },
          {
            name: 'نواف الحربي',
            number: 14,
            position: 'وسط',
            performance: 82,
            energy: 86,
            speed: 31.2,
            teamName: 'النصر',
            topShots: ['https://example.com/player5_shot1.jpg'],
            goals: 4,
            assists: 9,
            teamColor: teamColors.accentGold,
            rating: 7.9,
          },
          {
            name: 'محمد القحطاني',
            number: 9,
            position: 'مهاجم',
            performance: 87,
            energy: 82,
            speed: 33.1,
            teamName: 'النصر',
            topShots: ['https://example.com/player6_shot1.jpg'],
            goals: 10,
            assists: 6,
            teamColor: teamColors.accentGold,
            rating: 8.3,
          },
        ];

        // Create players
        for (const playerData of samplePlayers) {
          const existingPlayer = await prisma.player.findFirst({
            where: {
              name: playerData.name,
              number: playerData.number,
              teamName: playerData.teamName,
            },
          });

          if (existingPlayer) {
            players.push(existingPlayer);
            continue;
          }

          const player = await prisma.player.create({ data: playerData });
          players.push(player);
        }

        // Create LivePlayer entries for the players
        const livePlayerResults = [];

        for (let i = 0; i < players.length; i++) {
          // Create demo coordinates based on player position
          let coordinates;
          switch (players[i].position) {
            case 'مهاجم':
              coordinates = { x: 75 + Math.random() * 20, y: 40 + Math.random() * 20, zone: 'attack' };
              break;
            case 'جناح أيمن':
              coordinates = { x: 70 + Math.random() * 20, y: 10 + Math.random() * 20, zone: 'right_wing' };
              break;
            case 'وسط':
              coordinates = { x: 50 + Math.random() * 20, y: 40 + Math.random() * 20, zone: 'midfield' };
              break;
            case 'مدافع':
              coordinates = { x: 20 + Math.random() * 20, y: 40 + Math.random() * 20, zone: 'defense' };
              break;
            case 'حارس مرمى':
              coordinates = { x: 5 + Math.random() * 10, y: 40 + Math.random() * 20, zone: 'goal' };
              break;
            default:
              coordinates = { x: 50 + Math.random() * 10, y: 50 + Math.random() * 10, zone: 'midfield' };
          }

          // Create demo LivePlayer with media URLs
          const livePlayerData = {
            playerId: players[i].id,
            imageUrl: `https://example.com/live/${players[i].name.replace(/\s/g, '_')}.jpg`,
            videoUrl: `https://example.com/live/${players[i].name.replace(/\s/g, '_')}_reel.mp4`,
            isActive: true,
            coordinates,
          };

          // Check if a LivePlayer already exists for this player using findFirst
          // This prevents errors if the unique constraint doesn't exist yet
          const existingLivePlayer = await prisma.livePlayer.findFirst({
            where: { playerId: players[i].id },
          });

          let livePlayer;
          if (existingLivePlayer) {
            livePlayer = await prisma.livePlayer.update({
              where: { id: existingLivePlayer.id },
              data: livePlayerData,
              include: { player: true },
            });
          } else {
            livePlayer = await prisma.livePlayer.create({
              data: livePlayerData,
              include: { player: true },
            });
          }

          livePlayerResults.push(livePlayer);
        }

        return {
          message: 'Demo LivePlayer data seeded successfully',
          playerCount: players.length,
          livePlayerCount: livePlayerResults.length,
          livePlayers: livePlayerResults,
        };
      });
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      
      console.error('Error seeding demo data:', error);
      throw new InternalServerErrorException(
        'Failed to seed demo data. Make sure database migrations have been applied: npm run prisma:migrate'
      );
    }
  }
}
