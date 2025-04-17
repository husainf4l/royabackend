import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { authConfig } from '../auth/config/auth.config';
import { RoomStatus } from '@prisma/client';
import { CaptionService } from './caption/caption.service';

@Injectable()
export class LivekitService {
  private readonly logger = new Logger(LivekitService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly host: string;
  private readonly roomService: RoomServiceClient;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly captionService: CaptionService,
  ) {
    this.apiKey = authConfig.livekit.apiKey;
    this.apiSecret = authConfig.livekit.apiSecret;
    this.host = authConfig.livekit.host;
    
    const serviceUrl = this.host.startsWith('wss://') 
      ? this.host.replace('wss://', 'https://') 
      : this.host;
    
    // Initialize RoomServiceClient for server-side operations
    this.roomService = new RoomServiceClient(
      serviceUrl,
      this.apiKey,
      this.apiSecret
    );
    
    this.logger.log(`LiveKit configured with host: ${this.host}`);
  }

  async generateSubscriberToken(roomName: string, userId: string): Promise<string> {
    if (!this.apiKey || !this.apiSecret) {
      this.logger.error('LiveKit API credentials not configured');
      throw new Error('LiveKit API credentials not configured');
    }

    this.logger.log(`Generating subscriber token for user ${userId} in room ${roomName}`);

    try {
      // Create a clean participant identity - avoid special characters
      const participantIdentity = `user-${userId.replace(/[^a-zA-Z0-9]/g, '')}`;
      
      const accessToken = new AccessToken(this.apiKey, this.apiSecret, {
        identity: participantIdentity,
        ttl: 60 * 60, // 1 hour in seconds
      });

      accessToken.addGrant({
        roomJoin: true,
        room: roomName,
        canSubscribe: true,
        canPublish: false,
        canPublishData: false,
      });

      // Await the token generation since toJwt() returns a Promise<string>
      const token = await accessToken.toJwt();

      // Update user with token
      await this.prismaService.user.update({
        where: { id: userId },
        data: { livekitToken: token },
      });

      return token;
    } catch (error) {
      this.logger.error(`Failed to generate LiveKit token: ${error.message}`);
      throw new Error(`Failed to generate LiveKit token: ${error.message}`);
    }
  }

  async generatePublisherToken(roomName: string, userId: string): Promise<string> {
    if (!this.apiKey || !this.apiSecret) {
      this.logger.error('LiveKit API credentials not configured');
      throw new Error('LiveKit API credentials not configured');
    }

    this.logger.log(`Generating publisher token for user ${userId} in room ${roomName}`);

    try {
      // Create a clean participant identity - avoid special characters
      const participantIdentity = `user-${userId.replace(/[^a-zA-Z0-9]/g, '')}`;
      
      const accessToken = new AccessToken(this.apiKey, this.apiSecret, {
        identity: participantIdentity,
        ttl: 60 * 60, // 1 hour in seconds
      });

      accessToken.addGrant({
        roomJoin: true,
        room: roomName,
        canSubscribe: true,
        canPublish: true,
        canPublishData: true,
      });

      // Await the token generation since toJwt() returns a Promise<string>
      const token = await accessToken.toJwt();

      // Update user with token
      await this.prismaService.user.update({
        where: { id: userId },
        data: { livekitToken: token },
      });

      return token;
    } catch (error) {
      this.logger.error(`Failed to generate LiveKit publisher token: ${error.message}`);
      throw new Error(`Failed to generate LiveKit publisher token: ${error.message}`);
    }
  }

  async createRoom(name: string, livekitRoomId?: string): Promise<any> {
    this.logger.log(`Creating room with name: ${name}`);
    
    try {
      // Use provided livekit room id or create one from the name
      const roomId = livekitRoomId || name.toLowerCase().replace(/\s+/g, '-');
      
      // Check if room already exists with this livekitRoomId
      const existingRoom = await this.prismaService.liveRoom.findUnique({
        where: {
          livekitRoomId: roomId,
        },
      });

      if (existingRoom) {
        this.logger.log(`Room already exists with ID: ${existingRoom.id}`);
        return existingRoom;
      }

      // Create new room
      const room = await this.prismaService.liveRoom.create({
        data: {
          name,
          livekitRoomId: roomId,
          status: RoomStatus.ACTIVE,
        },
      });

      this.logger.log(`Created room: ${JSON.stringify(room)}`);
      return room;
    } catch (error) {
      this.logger.error(`Failed to create room: ${error.message}`);
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  async getRoom(livekitRoomId: string): Promise<any> {
    try {
      const room = await this.prismaService.liveRoom.findUnique({
        where: {
          livekitRoomId,
        },
      });

      if (!room) {
        throw new NotFoundException(`Room with ID ${livekitRoomId} not found`);
      }

      return room;
    } catch (error) {
      this.logger.error(`Failed to get room: ${error.message}`);
      throw new Error(`Failed to get room: ${error.message}`);
    }
  }

  async listRooms(): Promise<any[]> {
    try {
      const rooms = await this.prismaService.liveRoom.findMany({
        where: {
          status: RoomStatus.ACTIVE,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return rooms;
    } catch (error) {
      this.logger.error(`Failed to list rooms: ${error.message}`);
      throw new Error(`Failed to list rooms: ${error.message}`);
    }
  }

  async updateRoomStatus(livekitRoomId: string, status: RoomStatus): Promise<any> {
    try {
      const room = await this.prismaService.liveRoom.update({
        where: {
          livekitRoomId,
        },
        data: {
          status,
        },
      });

      return room;
    } catch (error) {
      this.logger.error(`Failed to update room status: ${error.message}`);
      throw new Error(`Failed to update room status: ${error.message}`);
    }
  }

  async sendCaption(roomName: string, captionText: string): Promise<string> {
    return this.captionService.sendCaption(roomName, captionText);
  }
}