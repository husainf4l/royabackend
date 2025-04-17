-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "MomentType" AS ENUM ('GOAL', 'TACKLE', 'SAVE', 'ASSIST', 'FOUL');

-- CreateTable
CREATE TABLE "users" (
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

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
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

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "stadium" TEXT NOT NULL,
    "imageUrl" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "embedding" BYTEA,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_performances" (
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

    CONSTRAINT "player_performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_players" (
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

    CONSTRAINT "live_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_events" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT,
    "type" TEXT NOT NULL,
    "minute" INTEGER NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "embedding" BYTEA,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("id")
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
    "embedding" BYTEA,

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

-- CreateTable
CREATE TABLE "n8n_chat_histories" (
    "id" SERIAL NOT NULL,
    "session_id" VARCHAR(255) NOT NULL,
    "message" JSONB NOT NULL,

    CONSTRAINT "n8n_chat_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "n8n_vectors" (
    "id" TEXT NOT NULL,
    "text" TEXT,
    "metadata" JSONB,

    CONSTRAINT "n8n_vectors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "player_performances_playerId_idx" ON "player_performances"("playerId");

-- CreateIndex
CREATE INDEX "player_performances_matchId_idx" ON "player_performances"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "live_players_playerId_key" ON "live_players"("playerId");

-- CreateIndex
CREATE INDEX "match_events_matchId_idx" ON "match_events"("matchId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_performances" ADD CONSTRAINT "player_performances_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_performances" ADD CONSTRAINT "player_performances_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_players" ADD CONSTRAINT "live_players_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replay_moments" ADD CONSTRAINT "replay_moments_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_moments" ADD CONSTRAINT "player_moments_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_moments" ADD CONSTRAINT "player_moments_replayMomentId_fkey" FOREIGN KEY ("replayMomentId") REFERENCES "replay_moments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
