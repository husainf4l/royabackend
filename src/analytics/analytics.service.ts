import { Body, Injectable, InternalServerErrorException } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class AnalyticsService {
  private readonly webhookUrl: string;

  constructor(private readonly prisma: DatabaseService) {
    // Get webhook URL from environment variables or use default
    this.webhookUrl =
      process.env.DEFAULT_ANALYTICS_WEBHOOK_URL ||
      "https://roxateltd.app.n8n.cloud/webhook-test/roya34-upload";
  }

  async processAnalyticsUpload(file: Express.Multer.File, body: any) {
    try {
      const matchData = await this.prisma.match.findFirst({
        where: { status: "LIVE" },
        orderBy: { date: "desc" },
      });

      const response = await axios.post(this.webhookUrl, {
        headers: {},
        file: file.buffer.toString("base64"),
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        matchData: {
          id: matchData.id,
          stadium: matchData.stadium,
          date: matchData.date,
          homeTeam: matchData.homeTeam,
          awayTeam: matchData.awayTeam,
          status: matchData.status,
        },
      });

      if (response.status !== 200) {
        throw new InternalServerErrorException(
        );
      }

      const playerInfo = response.data as {
        playerNumber: number;
        team: string;
      };

      const player = await this.prisma.player.findFirst({
        where: {
          number: playerInfo.playerNumber,
          team: playerInfo.team,
        },
      });

console.log("Player data:", player);


      const performance = await this.prisma.playerPerformance.findFirst({
        where: {
          playerId: player.id,
          matchId: matchData.id,
        },
      });

      console.log("Player performance data:", performance);

      return {
        performance,
        player,
      };
    } catch (error) {
      console.error("Error uploading analytics data:", error);
      throw new InternalServerErrorException(
        `Failed to process analytics upload: ${
          error.message || "Unknown error"
        }`
      );
    }
  }

  async saveUploadedFile(file: Express.Multer.File): Promise<string> {
    try {
      const uploadsDir = path.join(process.cwd(), "uploads");

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, file.originalname);
      fs.writeFileSync(filePath, file.buffer);

      return filePath;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to save file: ${error.message}`
      );
    }
  }
}
