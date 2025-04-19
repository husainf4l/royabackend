import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AIAgentService } from './ai-agent.service';
import { ImageUploadDto } from './dto/image-upload.dto';
import { AIAgentResponseDto } from './dto/ai-agent-response.dto';
import { Express } from 'express';
import { MatchDataDto } from './dto/image-upload.dto';

@ApiTags('AI Agent')
@Controller('ai-agent')
export class AIAgentController {
  constructor(private readonly aiAgentService: AIAgentService) {}

  @Post('roya34-upload')
  @ApiOperation({ summary: 'Analyze a player image (base64) and extract player number and team' })
  @ApiResponse({ status: 201, description: 'Successfully analyzed image', type: AIAgentResponseDto })
  async analyzePlayerImage(@Body() dto: ImageUploadDto): Promise<AIAgentResponseDto> {
    return this.aiAgentService.analyzeImage(dto);
  }

  @Post('roya34-upload-file')
  @ApiOperation({ summary: 'Analyze a player image (file upload) and extract player number and team' })
  @ApiResponse({ status: 201, description: 'Successfully analyzed image', type: AIAgentResponseDto })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The image file to analyze (supported formats: png, jpeg, gif, webp)',
        },
        matchData: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            homeTeam: { type: 'string' },
            awayTeam: { type: 'string' },
            stadium: { type: 'string' },
          },
          description: 'Match details as JSON string'
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async analyzePlayerImageFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('matchData') matchDataString: string,
  ): Promise<AIAgentResponseDto> {
    // Parse match data from string to object
    const matchData: MatchDataDto = JSON.parse(matchDataString);
    
    // Process the file using the AIAgentService
    return this.aiAgentService.analyzeImageFile(file, matchData);
  }
}