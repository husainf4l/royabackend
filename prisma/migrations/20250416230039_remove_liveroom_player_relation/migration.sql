/*
  Warnings:

  - You are about to drop the column `roomId` on the `LivePlayer` table. All the data in the column will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LivePlayer" DROP CONSTRAINT "LivePlayer_roomId_fkey";

-- AlterTable
ALTER TABLE "LivePlayer" DROP COLUMN "roomId",
ADD COLUMN     "liveRoomId" TEXT;

-- DropTable
DROP TABLE "Room";

-- CreateTable
CREATE TABLE "LiveRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "livekitRoomId" TEXT NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiveRoom_livekitRoomId_key" ON "LiveRoom"("livekitRoomId");
