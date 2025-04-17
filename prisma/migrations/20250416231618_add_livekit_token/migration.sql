/*
  Warnings:

  - You are about to drop the column `liveRoomId` on the `LivePlayer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LivePlayer" DROP COLUMN "liveRoomId";

-- AlterTable
ALTER TABLE "LiveRoom" ADD COLUMN     "description" TEXT;
