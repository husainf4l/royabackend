import { Body, Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AIAgentService } from './ai-agent.service';
import { ImageUploadDto } from './dto/image-upload.dto';
import { AIAgentResponseDto } from './dto/ai-agent-response.dto';
import { Express } from 'express';
import { MatchDataDto } from './dto/image-upload.dto';
import { PlayersService } from '../players/players.service';

@Controller('ai-agent')
export class AIAgentController {
  constructor(
    private readonly aiAgentService: AIAgentService,
    private readonly playersService: PlayersService
  ) {}

  @Post('roya34-upload')
  async analyzePlayerImage(@Body() dto: ImageUploadDto): Promise<AIAgentResponseDto> {
    return this.aiAgentService.analyzeImage(dto);
  }

  @Post('roya34-upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async analyzePlayerImageFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('matchData') matchDataString: string,
  ): Promise<any> {
    let matchData: MatchDataDto;
    
    // Check if matchDataString is provided
    if (!matchDataString) {
      throw new BadRequestException('matchData is required');
    }
    
    try {
      // Parse match data from string to object
      matchData = JSON.parse(matchDataString);
    } catch (error) {
      throw new BadRequestException('Invalid JSON format for matchData');
    }
    
    // Process the file using the AIAgentService
    const x= this.aiAgentService.analyzeImageFile(file, matchData);

    if (!x) {
      throw new BadRequestException('Error processing the image');
    }

    const playerInfo = await this.playersService.getPlayerInfo(x);

    return playerInfo
  }
}