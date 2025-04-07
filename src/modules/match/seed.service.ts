import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ReplayMomentType } from './dto/replay-moment.dto';
import { MomentType } from '@prisma/client';

@Injectable()
export class SeedService {
  constructor(private readonly db: DatabaseService) {}

  async seedDemoData() {
    const teamColors = {
      primaryGreen: '#10814E',
      accentGold: '#E8B62F',
    };

    // Start transaction to ensure data consistency
    return this.db.$transaction(async (prisma) => {
      // Remove old data if exists
      await prisma.playerMoment.deleteMany({});
      await prisma.replayMoment.deleteMany({});
      await prisma.player.deleteMany({});
      await prisma.game.deleteMany({});
      
      // Create game
      const game = await prisma.game.create({
        data: {
          homeTeam: 'الهلال',
          awayTeam: 'النصر',
          homeScore: 2,
          awayScore: 1,
          currentTime: '78:24',
          matchPhase: 'الشوط الثاني',
        },
      });

      // Create players
      const players = await Promise.all([
        prisma.player.create({
          data: {
            name: 'محمد العبدالله',
            number: 10,
            position: 'مهاجم',
            performance: 92,
            energy: 84,
            speed: 32.4,
            teamName: 'الهلال',
            topShots: [
              'assets/images/players/player1_shot1.jpg',
              'assets/images/players/player1_shot2.jpg',
              'assets/images/players/player1_shot3.jpg',
            ],
            goals: 12,
            assists: 8,
            teamColor: teamColors.primaryGreen,
            rating: 8.7,
          },
        }),
        prisma.player.create({
          data: {
            name: 'أحمد الشمراني',
            number: 7,
            position: 'جناح أيمن',
            performance: 88,
            energy: 79,
            speed: 34.2,
            teamName: 'الهلال',
            topShots: [
              'assets/images/players/player2_shot1.jpg',
              'assets/images/players/player2_shot2.jpg',
            ],
            goals: 8,
            assists: 14,
            teamColor: teamColors.primaryGreen,
            rating: 8.4,
          },
        }),
        prisma.player.create({
          data: {
            name: 'خالد المحمد',
            number: 8,
            position: 'وسط ميدان',
            performance: 85,
            energy: 82,
            speed: 29.8,
            teamName: 'الهلال',
            topShots: [
              'assets/images/players/player3_shot1.jpg',
              'assets/images/players/player3_shot2.jpg',
            ],
            goals: 5,
            assists: 11,
            teamColor: teamColors.primaryGreen,
            rating: 7.9,
          },
        }),
        prisma.player.create({
          data: {
            name: 'عبدالله القحطاني',
            number: 6,
            position: 'وسط دفاعي',
            performance: 74,
            energy: 88,
            speed: 27.5,
            teamName: 'الهلال',
            topShots: [
              'assets/images/players/player4_shot1.jpg',
            ],
            goals: 1,
            assists: 4,
            teamColor: teamColors.primaryGreen,
            rating: 7.2,
          },
        }),
        prisma.player.create({
          data: {
            name: 'فهد العتيبي',
            number: 3,
            position: 'ظهير أيسر',
            performance: 82,
            energy: 76,
            speed: 31.9,
            teamName: 'الهلال',
            topShots: [
              'assets/images/players/player5_shot1.jpg',
              'assets/images/players/player5_shot2.jpg',
            ],
            goals: 2,
            assists: 7,
            teamColor: teamColors.primaryGreen,
            rating: 7.8,
          },
        }),
        prisma.player.create({
          data: {
            name: 'سعود الدوسري',
            number: 29,
            position: 'ظهير أيمن',
            performance: 79,
            energy: 81,
            speed: 30.2,
            teamName: 'الهلال',
            topShots: [
              'assets/images/players/player6_shot1.jpg',
            ],
            goals: 3,
            assists: 5,
            teamColor: teamColors.primaryGreen,
            rating: 7.5,
          },
        }),
        prisma.player.create({
          data: {
            name: 'سلطان الغامدي',
            number: 4,
            position: 'قلب دفاع',
            performance: 80,
            energy: 90,
            speed: 26.8,
            teamName: 'الهلال',
            topShots: [
              'assets/images/players/player7_shot1.jpg',
            ],
            goals: 2,
            assists: 1,
            teamColor: teamColors.primaryGreen,
            rating: 7.6,
          },
        }),
        prisma.player.create({
          data: {
            name: 'بندر العنزي',
            number: 5,
            position: 'قلب دفاع',
            performance: 77,
            energy: 85,
            speed: 26.5,
            teamName: 'الهلال',
            topShots: [
              'assets/images/players/player8_shot1.jpg',
            ],
            goals: 1,
            assists: 0,
            teamColor: teamColors.primaryGreen,
            rating: 7.4,
          },
        }),
        prisma.player.create({
          data: {
            name: 'ياسر الشهراني',
            number: 1,
            position: 'حارس مرمى',
            performance: 86,
            energy: 75,
            speed: 22.1,
            teamName: 'الهلال',
            topShots: [
              'assets/images/players/player9_shot1.jpg',
            ],
            goals: 0,
            assists: 0,
            teamColor: teamColors.primaryGreen,
            rating: 8.2,
          },
        }),
        prisma.player.create({
          data: {
            name: 'ناصر السهلي',
            number: 14,
            position: 'جناح أيسر',
            performance: 81,
            energy: 72,
            speed: 33.0,
            teamName: 'الهلال',
            topShots: [
              'assets/images/players/player10_shot1.jpg',
              'assets/images/players/player10_shot2.jpg',
            ],
            goals: 6,
            assists: 9,
            teamColor: teamColors.primaryGreen,
            rating: 7.7,
          },
        }),
        prisma.player.create({
          data: {
            name: 'تركي العمار',
            number: 11,
            position: 'مهاجم',
            performance: 65,
            energy: 54,
            speed: 28.8,
            teamName: 'النصر',
            topShots: [
              'assets/images/players/player11_shot1.jpg',
            ],
            goals: 7,
            assists: 3,
            teamColor: teamColors.accentGold,
            rating: 6.8,
          },
        }),
        prisma.player.create({
          data: {
            name: 'سعد الحارثي',
            number: 19,
            position: 'وسط هجومي',
            performance: 58,
            energy: 67,
            speed: 29.1,
            teamName: 'النصر',
            topShots: [
              'assets/images/players/player12_shot1.jpg',
            ],
            goals: 4,
            assists: 6,
            teamColor: teamColors.accentGold,
            rating: 6.5,
          },
        }),
      ]);

      // Create replay moments
      const moments = [
        {
          title: 'هدف رائع من العبدالله',
          description: 'هدف من مهاجم الفريق بعد تمريرة متقنة',
          timestamp: '12:34',
          positionMinutes: 22,
          positionSeconds: 15,
          type: MomentType.GOAL,
          thumbnailUrl: null,
          minute: 12,
          gameId: game.id,
          involvedPlayers: [0, 1],
        },
        {
          title: 'تدخل قوي من الغامدي',
          description: 'تدخل دفاعي قوي لإنقاذ هجمة خطيرة',
          timestamp: '23:10',
          positionMinutes: 33,
          positionSeconds: 42,
          type: MomentType.TACKLE,
          thumbnailUrl: null,
          minute: 23,
          gameId: game.id,
          involvedPlayers: [6, 10],
        },
        {
          title: 'إنقاذ من الشهراني',
          description: 'تصدي رائع من حارس المرمى لكرة قوية',
          timestamp: '40:22',
          positionMinutes: 40,
          positionSeconds: 22,
          type: MomentType.SAVE,
          thumbnailUrl: null,
          minute: 40,
          gameId: game.id,
          involvedPlayers: [8],
        },
        {
          title: 'تمريرة حاسمة من المحمد',
          description: 'تمريرة بينية رائعة فتحت دفاع الخصم',
          timestamp: '55:17',
          positionMinutes: 55,
          positionSeconds: 17,
          type: MomentType.ASSIST,
          thumbnailUrl: null,
          minute: 55,
          gameId: game.id,
          involvedPlayers: [2, 9],
        },
        {
          title: 'مخالفة من العتيبي',
          description: 'مخالفة واضحة وبطاقة صفراء',
          timestamp: '67:35',
          positionMinutes: 67,
          positionSeconds: 35,
          type: MomentType.FOUL,
          thumbnailUrl: null,
          minute: 67,
          gameId: game.id,
          involvedPlayers: [4, 11],
        },
        {
          title: 'هدف التعادل للنصر',
          description: 'هدف التعادل في الدقائق الأخيرة',
          timestamp: '88:12',
          positionMinutes: 88,
          positionSeconds: 12,
          type: MomentType.GOAL,
          thumbnailUrl: null,
          minute: 88,
          gameId: game.id,
          involvedPlayers: [11],
        },
      ];

      // Create replay moments and associate players
      for (const moment of moments) {
        const { involvedPlayers: playerIndices, ...momentData } = moment;
        const createdMoment = await prisma.replayMoment.create({
          data: momentData,
        });

        // Create player-moment relationships
        for (const idx of playerIndices) {
          await prisma.playerMoment.create({
            data: {
              playerId: players[idx].id,
              replayMomentId: createdMoment.id,
            },
          });
        }
      }

      return { 
        message: 'Demo data seeded successfully',
        game,
        playerCount: players.length,
        momentCount: moments.length
      };
    });
  }
}
