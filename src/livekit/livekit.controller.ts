import { Controller, Post, Body, UseGuards, Req, HttpException, HttpStatus, Logger, Get, Param } from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { SendCaptionDto } from './dto/send-caption.dto';
import { RoomStatus } from '@prisma/client';
import { authConfig } from '../auth/config/auth.config';
import { CaptionService } from './caption/caption.service';

@Controller('livekit')
export class LivekitController {
  private readonly logger = new Logger(LivekitController.name);
  private readonly livekitHost: string;

  constructor(
    private readonly livekitService: LivekitService,
    private readonly captionService: CaptionService
  ) {
    this.livekitHost = authConfig.livekit.host;
  }

  /**
   * Standardizes room name to a consistent format for room ID generation
   * Ensures the same room name always produces the same room ID
   */
  private standardizeRoomId(roomName: string): string {
    return roomName.trim().toLowerCase().replace(/\s+/g, '-');
  }

  @UseGuards(JwtAuthGuard)
  @Post('token/publisher')
  async generatePublisherToken(@Body() dto: GenerateTokenDto, @Req() req) {
    try {
      this.logger.debug(`User from request: ${JSON.stringify(req.user)}`);
      if (!req.user || (!req.user.id && !req.user.userId)) {
        throw new HttpException('User ID not found in request', HttpStatus.UNAUTHORIZED);
      }
      const userId = String(req.user.id || req.user.userId);
      
      // Use standardized room ID method
      const roomId = this.standardizeRoomId(dto.roomName);
      this.logger.log(`Using standardized room ID: ${roomId} from name: ${dto.roomName}`);
      
      const room = await this.livekitService.createRoom(dto.roomName, roomId);
      
      this.logger.log(`Generating publisher token for user ID: ${userId}, room: ${room.livekitRoomId}`);
      
      const token = await this.livekitService.generatePublisherToken(room.livekitRoomId, userId);
      
      return {
        token,
        userId,
        room,
        url: this.livekitHost,
        role: 'publisher'
      };
    } catch (error) {
      this.logger.error(`Error generating LiveKit publisher token: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to generate LiveKit publisher token',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('token')
  async generateToken(@Body() dto: GenerateTokenDto, @Req() req) {
    try {
      this.logger.debug(`User from request: ${JSON.stringify(req.user)}`);
      if (!req.user || (!req.user.id && !req.user.userId)) {
        throw new HttpException('User ID not found in request', HttpStatus.UNAUTHORIZED);
      }
      const userId = String(req.user.id || req.user.userId);
      
      // Use standardized room ID method - ensures same room ID as publisher endpoint
      const roomId = this.standardizeRoomId(dto.roomName);
      this.logger.log(`Using standardized room ID: ${roomId} from name: ${dto.roomName}`);
      
      const room = await this.livekitService.createRoom(dto.roomName, roomId);
      
      this.logger.log(`Generating subscriber token for user ID: ${userId}, room: ${room.livekitRoomId}`);
      
      const token = await this.livekitService.generateSubscriberToken(room.livekitRoomId, userId);
      
      return {
        token,
        userId,
        room,
        url: this.livekitHost,
        role: 'subscriber'
      };
    } catch (error) {
      this.logger.error(`Error generating LiveKit token: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to generate LiveKit token',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('rooms')
  async listRooms() {
    try {
      const rooms = await this.livekitService.listRooms();
      return { rooms };
    } catch (error) {
      this.logger.error(`Error listing rooms: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to list rooms',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/:roomId/status')
  async updateRoomStatus(@Body() body: { status: RoomStatus }, @Req() req) {
    try {
      const roomId = req.params.roomId;
      const room = await this.livekitService.updateRoomStatus(roomId, body.status);
      return { room };
    } catch (error) {
      this.logger.error(`Error updating room status: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to update room status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('captions/auto/:roomName/start')
  async startAutoCaptions(@Param('roomName') roomName: string) {
    try {
      // Add the room to active rooms for auto-captions
      this.captionService.addActiveRoom(roomName);
      
      return { 
        success: true,
        message: `Automatic captions started for room ${roomName}`,
      };
    } catch (error) {
      this.logger.error(`Error starting auto captions: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to start automatic captions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('captions/auto/:roomName/stop')
  async stopAutoCaptions(@Param('roomName') roomName: string) {
    try {
      // Remove the room from active rooms for auto-captions
      this.captionService.removeActiveRoom(roomName);
      
      return { 
        success: true,
        message: `Automatic captions stopped for room ${roomName}`,
      };
    } catch (error) {
      this.logger.error(`Error stopping auto captions: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to stop automatic captions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('captions')
  async sendCaption(@Body() dto: SendCaptionDto) {
    try {
     
     const caption2 =  await this.livekitService.sendCaption(
        dto.roomName, 
        dto.captionText, 
      );
      
      return { 
        success: true,
        message: `Caption sent to room ${dto.roomName}`,
        captionText: caption2
      };
    } catch (error) {
      this.logger.error(`Error sending caption: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to send caption',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
