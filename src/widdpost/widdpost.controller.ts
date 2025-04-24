import { Controller, Post, Body, BadRequestException, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AIPostAgentService } from './aipostagent.service';
import { PostRequestDto } from './dto/post-request.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Express } from 'express';

@ApiTags('Social Media Post Generator')
@Controller('widdpost')
export class WiddPostController {
  constructor(private readonly aiPostService: AIPostAgentService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a social media post based on an image (base64)' })
  @ApiResponse({ 
    status: 201, 
    description: 'The post has been successfully generated',
    type: PostResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid image format or parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generatePost(@Body() postRequest: PostRequestDto): Promise<PostResponseDto> {
    try {
      return await this.aiPostService.generatePost(postRequest);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to generate post: ${error.message}`);
    }
  }

  @Post('generate-binary')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Generate a social media post based on a binary image file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'The image file (png, jpeg, gif, webp)',
        },
        hints: {
          type: 'string',
          description: 'Hints or keywords to include in the post',
          example: 'team spirit, victory, championship',
        },
        mood: {
          type: 'string',
          enum: ['excited', 'professional', 'funny', 'inspirational', 'informative', 'casual'],
          description: 'The mood or tone of the post',
          default: 'professional',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'The post has been successfully generated',
    type: PostResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid image format or parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generatePostFromBinary(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB max
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    ) 
    file: Express.Multer.File,
    @Body() postData: { hints?: string; mood?: string }
  ): Promise<PostResponseDto> {
    try {
      return await this.aiPostService.generatePostFromBinary(file, postData);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to generate post: ${error.message}`);
    }
  }
}