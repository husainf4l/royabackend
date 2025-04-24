import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ImageUploadDto } from './dto/image-upload.dto';
import { AIAgentResponseDto } from './dto/ai-agent-response.dto';
import { MatchDataDto } from './dto/image-upload.dto';

@Injectable()
export class AIAgentService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(AIAgentService.name);
  
  // In-memory store for context (optional, could be replaced with Prisma/DB implementation)
  private readonly sessionMemory = new Map<string, any[]>();
  private readonly SESSION_ID = 'roya34';

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    // Initialize the session memory
    this.sessionMemory.set(this.SESSION_ID, []);
  }

  async analyzeImage(dto: ImageUploadDto): Promise<AIAgentResponseDto> {
    try {
      // Get the base64 image with its mime type prefix
      const base64Image = dto.file;
      
      // Validate the image format
      if (!this.isValidImageFormat(base64Image)) {
        throw new BadRequestException('Image format not supported. Please provide an image in png, jpeg, gif, or webp format.');
      }

      // Step 1: Analyze the image with GPT-4o Vision
      const visionResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a sports analyst AI that identifies player numbers and team affiliations from images.'
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: 'Analyze this image of a football player and extract the outfit colors and the player\'s number. Be concise and direct. If you cannot identify the player number or team, explicitly state so.' 
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image // Use the complete base64 string with mime type
                }
              }
            ]
          }
        ],
        max_tokens: 300,
      });

      const visionResult = visionResponse.choices[0]?.message?.content || '';
      this.logger.debug(`Vision analysis result: ${visionResult}`);

      // Step 2: Use the vision result and match data to get the final structured response
      const finalPrompt = `
Match Details:
- Status: ${dto.matchData.status}
- Home Team: ${dto.matchData.homeTeam}
- Away Team: ${dto.matchData.awayTeam}
- Stadium: ${dto.matchData.stadium}

Image Analysis: ${visionResult}

Based on the image analysis and match details, determine the player's number and which team they belong to.
If you cannot identify either the player number or team with confidence, set the relevant field to null.
If you cannot identify both, set both fields to null and provide a helpful message.

Return a valid JSON object with this format: 
{
  "playerNumber": <number or null>, 
  "team": "<team name or null>",
  "status": "<success, partial, or failed>",
  "message": "<explanation of the result>"
}

Use these status values:
- "success": Both playerNumber and team were identified
- "partial": Only one of playerNumber or team was identified
- "failed": Neither playerNumber nor team could be identified
`;

      const finalResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a sports analyst AI that provides structured data.' },
          { role: 'user', content: finalPrompt }
        ],
        max_tokens: 250,
        response_format: { type: 'json_object' },
      });

      const jsonResponse = finalResponse.choices[0]?.message?.content || '{}';
      this.logger.debug(`Final JSON response: ${jsonResponse}`);
      
      // Parse and return the structured response
      const parsedResponse = JSON.parse(jsonResponse) as AIAgentResponseDto;
      
      // Ensure the response has valid status and message fields
      if (!parsedResponse.status) {
        parsedResponse.status = this.determineResponseStatus(parsedResponse);
      }
      
      if (!parsedResponse.message) {
        parsedResponse.message = this.generateResponseMessage(parsedResponse);
      }
      
      // Store in memory (optional)
      this.storeInMemory(dto, parsedResponse);
      
      return parsedResponse;
    } catch (error) {
      this.logger.error('Error analyzing image:', error);
      throw error;
    }
  }

  /**
   * Analyze a player image from a file upload
   * @param file The uploaded image file
   * @param matchData The match data object
   * @returns AI analysis result
   */
  async analyzeImageFile(file: Express.Multer.File, matchData: MatchDataDto): Promise<AIAgentResponseDto> {
    try {
      // Validate file type
      if (!this.isValidFileType(file.mimetype)) {
        throw new BadRequestException(`Unsupported image format: ${file.mimetype}. Supported formats: png, jpeg, jpg, gif, webp`);
      }
      
      // Convert file to base64
      const base64Image = this.fileToBase64(file);
      const mimeType = file.mimetype;
      const dataUri = `data:${mimeType};base64,${base64Image}`;
      
      this.logger.debug(`Processing file upload: ${file.originalname}, size: ${file.size} bytes, type: ${mimeType}`);

      // Step 1: Analyze the image with GPT-4o Vision
      const visionResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a sports analyst AI that identifies player numbers and team affiliations from images.'
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: 'Analyze this image of a football player and extract the outfit colors and the player\'s number. Be concise and direct. If you cannot identify the player number or team, explicitly state so.' 
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUri
                }
              }
            ]
          }
        ],
        max_tokens: 300,
      });

      const visionResult = visionResponse.choices[0]?.message?.content || '';
      this.logger.debug(`Vision analysis result: ${visionResult}`);

      // Step 2: Use the vision result and match data to get the final structured response
      const finalPrompt = `
Match Details:
- Status: ${matchData.status}
- Home Team: ${matchData.homeTeam}
- Away Team: ${matchData.awayTeam}
- Stadium: ${matchData.stadium}

Image Analysis: ${visionResult}

Based on the image analysis and match details, determine the player's number and which team they belong to.
If you cannot identify either the player number or team with confidence, set the relevant field to null.
If you cannot identify both, set both fields to null and provide a helpful message.

Return a valid JSON object with this format: 
{
  "playerNumber": <number or null>, 
  "team": "<team name or null>",
  "status": "<success, partial, or failed>",
  "message": "<explanation of the result>"
}

Use these status values:
- "success": Both playerNumber and team were identified
- "partial": Only one of playerNumber or team was identified
- "failed": Neither playerNumber nor team could be identified
`;

      const finalResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a sports analyst AI that provides structured data.' },
          { role: 'user', content: finalPrompt }
        ],
        max_tokens: 250,
        response_format: { type: 'json_object' },
      });

      const jsonResponse = finalResponse.choices[0]?.message?.content || '{}';
      this.logger.debug(`Final JSON response: ${jsonResponse}`);
      
      // Parse and return the structured response
      const parsedResponse = JSON.parse(jsonResponse) as AIAgentResponseDto;
      
      // Ensure the response has valid status and message fields
      if (!parsedResponse.status) {
        parsedResponse.status = this.determineResponseStatus(parsedResponse);
      }
      
      if (!parsedResponse.message) {
        parsedResponse.message = this.generateResponseMessage(parsedResponse);
      }
      
      // Store in memory
      this.storeInMemory({ file: dataUri, matchData }, parsedResponse);
      
      return parsedResponse;
    } catch (error) {
      this.logger.error('Error analyzing image file:', error);
      throw error;
    }
  }

  /**
   * Determines the response status based on which fields were successfully identified
   */
  private determineResponseStatus(response: AIAgentResponseDto): string {
    if (response.playerNumber !== null && response.team !== null) {
      return 'success';
    } else if (response.playerNumber !== null || response.team !== null) {
      return 'partial';
    } else {
      return 'failed';
    }
  }

  /**
   * Generates an appropriate message based on the response status
   * with instructions for the frontend
   */
  private generateResponseMessage(response: AIAgentResponseDto): string {
    switch (this.determineResponseStatus(response)) {
      case 'success':
        return 'Player information successfully identified. Frontend should display both player number and team name prominently, and proceed with the next step in the workflow.';
      case 'partial':
        if (response.playerNumber !== null) {
          return 'Player number identified, but team could not be determined. Frontend should display the player number and prompt user to manually select or confirm the team from the match data options.';
        } else {
          return 'Team identified, but player number could not be determined. Frontend should display the team name and prompt user to manually enter or confirm the player number.';
        }
      case 'failed':
        return 'Could not identify player information from the image. Frontend should display an error message and prompt user to either upload a clearer image or manually input both player number and team. Ensure the image clearly shows a player with visible number and team colors.';
      default:
        return 'Analysis completed. Frontend should check the playerNumber and team fields to determine how to proceed.';
    }
  }

  /**
   * Validates that the image format is supported by OpenAI
   * @param base64Image The base64 image string with mime type prefix
   * @returns boolean indicating if the format is valid
   */
  private isValidImageFormat(base64Image: string): boolean {
    const supportedFormats = ['png', 'jpeg', 'jpg', 'gif', 'webp'];
    const mimeTypeMatch = base64Image.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
    
    if (!mimeTypeMatch) {
      return false;
    }
    
    const format = mimeTypeMatch[1].toLowerCase();
    return supportedFormats.includes(format);
  }

  /**
   * Validates if the file MIME type is supported
   * @param mimetype The MIME type of the uploaded file
   * @returns boolean indicating if the file type is valid
   */
  private isValidFileType(mimetype: string): boolean {
    const supportedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp'
    ];
    return supportedTypes.includes(mimetype);
  }

  /**
   * Converts a file to base64 string
   * @param file The file to convert
   * @returns base64 encoded string (without mime type prefix)
   */
  private fileToBase64(file: Express.Multer.File): string {
    return file.buffer.toString('base64');
  }

  private storeInMemory(request: ImageUploadDto, response: AIAgentResponseDto): void {
    const memory = this.sessionMemory.get(this.SESSION_ID);
    
    if (memory) {
      memory.push({
        timestamp: new Date().toISOString(),
        matchData: request.matchData,
        response
      });
      
      // Limit memory size (optional)
      if (memory.length > 50) {
        memory.shift(); // Remove oldest entry
      }
    }
  }
}