// seed.ts - Full Prisma Seed File for Roaya34

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {

  // Create Match and Game
  const match = await prisma.match.create({
    data: {
      stadium: "استاد الرياض الذكي",
      date: new Date("2034-07-15T18:00:00Z"),
      homeTeam: "السعودية",
      awayTeam: "إسبانيا",
      status: "مباشر",
      imageUrl: "https://source.unsplash.com/800x600/?stadium", // Splash service for stadium image
    },
  });

  const game = await prisma.game.create({
    data: {
      homeTeam: "السعودية",
      awayTeam: "إسبانيا",
      homeScore: 1,
      awayScore: 2,
      currentTime: "75:00",
      matchPhase: "الشوط الثاني",
    },
  });

  // Create Players, Performances, LivePlayers, Events
  const players = []; const playerPerformances = []; const livePlayers = [];

  const names = [
    ...[
      ["محمد العويس", 1, "حارس مرمى"],
      ["ياسر الشهراني", 13, "ظهير أيسر"],
      ["علي البليهي", 5, "قلب دفاع"],
      ["عبدالإله العمري", 4, "قلب دفاع"],
      ["سلطان الغنام", 2, "ظهير أيمن"],
      ["محمد كنو", 23, "لاعب وسط"],
      ["عبدالله عطيف", 14, "لاعب وسط"],
      ["سلمان الفرج", 7, "لاعب وسط"],
      ["سالم الدوسري", 10, "جناح"],
      ["فراس البريكان", 9, "مهاجم"],
      ["هتان باهبري", 11, "جناح"],
    ].map(p => [...p, "السعودية", "السعودية"]),
    ...[
      ["أوناي سيمون", 1, "حارس مرمى"],
      ["جوردي ألبا", 18, "ظهير أيسر"],
      ["إيمريك لابورت", 24, "قلب دفاع"],
      ["باو توريس", 4, "قلب دفاع"],
      ["سيزار أزبيليكويتا", 2, "ظهير أيمن"],
      ["سيرجيو بوسكيتس", 5, "لاعب وسط"],
      ["بيدري", 26, "لاعب وسط"],
      ["جافي", 9, "لاعب وسط"],
      ["فيران توريس", 11, "جناح"],
      ["ألفارو موراتا", 7, "مهاجم"],
      ["داني أولمو", 21, "جناح"],
    ].map(p => [...p, "إسبانيا", "إسبانيا"]),
  ];

  for (const [name, number, position, team, nationality] of names) {
    const player = await prisma.player.create({
      data: {
        name: String(name),
        number: Number(number),
        position: String(position),
        team: String(team),
        nationality: String(nationality),
        imageUrl: `https://b.fssta.com/uploads/application/soccer/headshots/69097.png`, // Splash service for player image
      },
    });
    players.push(player);

    await prisma.playerPerformance.create({
      data: {
        playerId: player.id, // Ensure player.id is a String
        matchId: match.id,  // Ensure match.id is a String
        topSpeed: Math.random() * 10 + 25,
        avgSpeed: Math.random() * 5 + 18,
        distanceKm: Math.random() * 4 + 8,
        sprintCount: Math.floor(Math.random() * 15 + 5),
        accelerations: Math.floor(Math.random() * 10 + 2),
        passesCompleted: Math.floor(Math.random() * 30 + 20),
        shotsOnTarget: Math.floor(Math.random() * 4),
        interceptions: Math.floor(Math.random() * 4),
        tackles: Math.floor(Math.random() * 5),
        heartRateAvg: Math.floor(Math.random() * 40 + 120),
        heartRateMax: Math.floor(Math.random() * 30 + 160),
        bodyTempC: Math.random() + 36.5,
        fatigueScore: Math.random() * 0.5 + 0.5,
        staminaScore: Math.random() * 0.5 + 0.5,
        heatmapUrl: `https://data.roaya34.com/heatmaps/player_${player.id}_match_${match.id}.png`,
        positionLog: [{ time: "00:01:00", x: 50.0, y: 30.0 }],
      },
    });

    await prisma.livePlayer.create({
      data: {
        playerId: player.id, // Ensure player.id is a String
        imageUrl: `https://roaya34.com/images/${player.name.replace(/ /g, "_")}.jpg`,
        videoUrl: `https://roaya34.com/videos/${player.name.replace(/ /g, "_")}.mp4`,
        coordinates: { x: 42.3, y: 17.8 },
      },
    });
  }

  await prisma.matchEvent.createMany({
    data: [
      {
        matchId: match.id,
        playerId: players[8].id,
        type: "هدف",
        minute: 23,
        detail: "تسديدة بعيدة المدى",
      },
      {
        matchId: match.id,
        playerId: players[16].id,
        type: "بطاقة صفراء",
        minute: 41,
        detail: "خطأ في وسط الملعب",
      },
    ]
  });
}

main()
  .then(() => console.log("🌍 Full seed completed!"))
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
