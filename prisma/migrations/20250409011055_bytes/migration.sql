-- AlterTable
ALTER TABLE "live_players" ADD COLUMN     "embedding" BYTEA;

-- AlterTable
ALTER TABLE "match_events" ADD COLUMN     "embedding" BYTEA;

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "embedding" BYTEA;

-- AlterTable
ALTER TABLE "player_moments" ADD COLUMN     "embedding" BYTEA;

-- AlterTable
ALTER TABLE "player_performances" ADD COLUMN     "embedding" BYTEA;

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "embedding" BYTEA;
