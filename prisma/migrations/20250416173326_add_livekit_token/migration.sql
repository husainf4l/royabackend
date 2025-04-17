/*
  Warnings:

  - You are about to drop the `games` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `live_players` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `match_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `matches` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `player_moments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `player_performances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `players` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `replay_moments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "live_players" DROP CONSTRAINT "live_players_playerId_fkey";

-- DropForeignKey
ALTER TABLE "match_events" DROP CONSTRAINT "match_events_matchId_fkey";

-- DropForeignKey
ALTER TABLE "player_moments" DROP CONSTRAINT "player_moments_playerId_fkey";

-- DropForeignKey
ALTER TABLE "player_moments" DROP CONSTRAINT "player_moments_replayMomentId_fkey";

-- DropForeignKey
ALTER TABLE "player_performances" DROP CONSTRAINT "player_performances_matchId_fkey";

-- DropForeignKey
ALTER TABLE "player_performances" DROP CONSTRAINT "player_performances_playerId_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "replay_moments" DROP CONSTRAINT "replay_moments_gameId_fkey";

-- DropTable
DROP TABLE "games";

-- DropTable
DROP TABLE "live_players";

-- DropTable
DROP TABLE "match_events";

-- DropTable
DROP TABLE "matches";

-- DropTable
DROP TABLE "player_moments";

-- DropTable
DROP TABLE "player_performances";

-- DropTable
DROP TABLE "players";

-- DropTable
DROP TABLE "refresh_tokens";

-- DropTable
DROP TABLE "replay_moments";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "livekitToken" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "socialProvider" TEXT,
    "socialId" TEXT,
    "profilePictureUrl" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "imageUrl" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "embedding" BYTEA,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "stadium" TEXT NOT NULL,
    "imageUrl" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "embedding" BYTEA,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerPerformance" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "topSpeed" DOUBLE PRECISION,
    "avgSpeed" DOUBLE PRECISION,
    "distanceKm" DOUBLE PRECISION,
    "sprintCount" INTEGER,
    "accelerations" INTEGER,
    "passesCompleted" INTEGER,
    "shotsOnTarget" INTEGER,
    "interceptions" INTEGER,
    "tackles" INTEGER,
    "heartRateAvg" INTEGER,
    "heartRateMax" INTEGER,
    "bodyTempC" DOUBLE PRECISION,
    "fatigueScore" DOUBLE PRECISION,
    "staminaScore" DOUBLE PRECISION,
    "heatmapUrl" TEXT,
    "positionLog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "embedding" BYTEA,

    CONSTRAINT "PlayerPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivePlayer" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coordinates" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "embedding" BYTEA,

    CONSTRAINT "LivePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchEvent" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT,
    "type" TEXT NOT NULL,
    "minute" INTEGER NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "embedding" BYTEA,

    CONSTRAINT "MatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplayMoment" (
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

    CONSTRAINT "ReplayMoment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMoment" (
    "playerId" TEXT NOT NULL,
    "replayMomentId" TEXT NOT NULL,
    "embedding" BYTEA,

    CONSTRAINT "PlayerMoment_pkey" PRIMARY KEY ("playerId","replayMomentId")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "currentTime" TEXT NOT NULL,
    "matchPhase" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "PlayerPerformance_playerId_idx" ON "PlayerPerformance"("playerId");

-- CreateIndex
CREATE INDEX "PlayerPerformance_matchId_idx" ON "PlayerPerformance"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "LivePlayer_playerId_key" ON "LivePlayer"("playerId");

-- CreateIndex
CREATE INDEX "MatchEvent_matchId_idx" ON "MatchEvent"("matchId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPerformance" ADD CONSTRAINT "PlayerPerformance_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPerformance" ADD CONSTRAINT "PlayerPerformance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivePlayer" ADD CONSTRAINT "LivePlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplayMoment" ADD CONSTRAINT "ReplayMoment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMoment" ADD CONSTRAINT "PlayerMoment_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMoment" ADD CONSTRAINT "PlayerMoment_replayMomentId_fkey" FOREIGN KEY ("replayMomentId") REFERENCES "ReplayMoment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
