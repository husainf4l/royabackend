-- CreateEnum
CREATE TYPE "MomentType" AS ENUM ('GOAL', 'TACKLE', 'SAVE', 'ASSIST', 'FOUL');

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "performance" INTEGER NOT NULL,
    "energy" INTEGER NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "teamName" TEXT NOT NULL,
    "topShots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "teamColor" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "replay_moments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "positionMinutes" INTEGER NOT NULL,
    "positionSeconds" INTEGER NOT NULL,
    "type" "MomentType" NOT NULL,
    "thumbnailUrl" TEXT,
    "minute" INTEGER NOT NULL,
    "gameId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "replay_moments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_moments" (
    "playerId" TEXT NOT NULL,
    "replayMomentId" TEXT NOT NULL,

    CONSTRAINT "player_moments_pkey" PRIMARY KEY ("playerId","replayMomentId")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "currentTime" TEXT NOT NULL,
    "matchPhase" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "replay_moments" ADD CONSTRAINT "replay_moments_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_moments" ADD CONSTRAINT "player_moments_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_moments" ADD CONSTRAINT "player_moments_replayMomentId_fkey" FOREIGN KEY ("replayMomentId") REFERENCES "replay_moments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
