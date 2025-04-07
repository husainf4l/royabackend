import { Injectable } from '@nestjs/common';
import { PlayerDto } from './dto/player.dto';
import { ReplayMomentDto, ReplayMomentType } from './dto/replay-moment.dto';
import { GameInfoDto } from './dto/game.dto';

@Injectable()
export class MatchDataService {
  private readonly teamColors = {
    primaryGreen: '#10814E',
    accentGold: '#E8B62F',
  };

  getCurrentGameInfo(): GameInfoDto {
    return {
      homeTeam: 'الهلال',
      awayTeam: 'النصر',
      homeScore: 2,
      awayScore: 1,
      currentTime: '78:24',
      matchPhase: 'الشوط الثاني',
    };
  }

  getPlayers(): PlayerDto[] {
    return [
      {
        id: '1',
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
        teamColor: this.teamColors.primaryGreen,
        rating: 8.7,
      },
      {
        id: '2',
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
        teamColor: this.teamColors.primaryGreen,
        rating: 8.4,
      },
      {
        id: '3',
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
        teamColor: this.teamColors.primaryGreen,
        rating: 7.9,
      },
      {
        id: '4',
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
        teamColor: this.teamColors.primaryGreen,
        rating: 7.2,
      },
      {
        id: '5',
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
        teamColor: this.teamColors.primaryGreen,
        rating: 7.8,
      },
      {
        id: '6',
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
        teamColor: this.teamColors.primaryGreen,
        rating: 7.5,
      },
      {
        id: '7',
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
        teamColor: this.teamColors.primaryGreen,
        rating: 7.6,
      },
      {
        id: '8',
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
        teamColor: this.teamColors.primaryGreen,
        rating: 7.4,
      },
      {
        id: '9',
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
        teamColor: this.teamColors.primaryGreen,
        rating: 8.2,
      },
      {
        id: '10',
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
        teamColor: this.teamColors.primaryGreen,
        rating: 7.7,
      },
      {
        id: '11',
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
        teamColor: this.teamColors.accentGold,
        rating: 6.8,
      },
      {
        id: '12',
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
        teamColor: this.teamColors.accentGold,
        rating: 6.5,
      },
    ];
  }

  getActivePlayers(): PlayerDto[] {
    return this.getPlayers().slice(0, 5);
  }

  getAllReplayMoments(): ReplayMomentDto[] {
    const players = this.getPlayers();

    return [
      {
        id: '1',
        title: 'هدف رائع من العبدالله',
        description: 'هدف من مهاجم الفريق بعد تمريرة متقنة',
        timestamp: '12:34',
        position: { minutes: 22, seconds: 15 },
        involvedPlayers: [players[0], players[1]],
        type: ReplayMomentType.GOAL,
        thumbnailUrl: null,
        minute: 12,
      },
      {
        id: '2',
        title: 'تدخل قوي من الغامدي',
        description: 'تدخل دفاعي قوي لإنقاذ هجمة خطيرة',
        timestamp: '23:10',
        position: { minutes: 33, seconds: 42 },
        involvedPlayers: [players[6], players[10]],
        type: ReplayMomentType.TACKLE,
        thumbnailUrl: null,
        minute: 23,
      },
      {
        id: '3',
        title: 'إنقاذ من الشهراني',
        description: 'تصدي رائع من حارس المرمى لكرة قوية',
        timestamp: '40:22',
        position: { minutes: 40, seconds: 22 },
        involvedPlayers: [players[8]],
        type: ReplayMomentType.SAVE,
        thumbnailUrl: null,
        minute: 40,
      },
      {
        id: '4',
        title: 'تمريرة حاسمة من المحمد',
        description: 'تمريرة بينية رائعة فتحت دفاع الخصم',
        timestamp: '55:17',
        position: { minutes: 55, seconds: 17 },
        involvedPlayers: [players[2], players[9]],
        type: ReplayMomentType.ASSIST,
        thumbnailUrl: null,
        minute: 55,
      },
      {
        id: '5',
        title: 'مخالفة من العتيبي',
        description: 'مخالفة واضحة وبطاقة صفراء',
        timestamp: '67:35',
        position: { minutes: 67, seconds: 35 },
        involvedPlayers: [players[4], players[11]],
        type: ReplayMomentType.FOUL,
        thumbnailUrl: null,
        minute: 67,
      },
      {
        id: '6',
        title: 'هدف التعادل للنصر',
        description: 'هدف التعادل في الدقائق الأخيرة',
        timestamp: '88:12',
        position: { minutes: 88, seconds: 12 },
        involvedPlayers: [players[11]],
        type: ReplayMomentType.GOAL,
        thumbnailUrl: null,
        minute: 88,
      },
    ];
  }

  getFeaturedPlayers(): PlayerDto[] {
    const players = this.getPlayers();
    return [...players].sort((a, b) => b.rating - a.rating).slice(0, 6);
  }

  getTopMoments(): ReplayMomentDto[] {
    const allMoments = this.getAllReplayMoments();
    return allMoments.filter(
      (moment) =>
        moment.type === ReplayMomentType.GOAL ||
        moment.type === ReplayMomentType.ASSIST ||
        moment.type === ReplayMomentType.SAVE,
    );
  }
}
