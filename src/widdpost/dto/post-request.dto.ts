import { IsBase64, IsString, IsOptional, Matches, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PostMood {
  EXCITED = 'excited',
  PROFESSIONAL = 'professional',
  FUNNY = 'funny',
  INSPIRATIONAL = 'inspirational',
  INFORMATIVE = 'informative',
  CASUAL = 'casual'
}

export class PostRequestDto {
  @ApiProperty({ 
    description: 'The base64 encoded image data. Must be in one of the supported formats: png, jpeg, gif, webp',
    required: true
  })
  @IsString()
  @IsBase64()
  @Matches(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/, {
    message: 'Image must be a valid base64 string with mime type prefix (data:image/png;base64, data:image/jpeg;base64, etc.)'
  })
  image: string;

  @ApiProperty({ 
    description: 'Hints or keywords to include in the post',
    required: false,
    example: 'team spirit, victory, championship'
  })
  @IsString()
  @IsOptional()
  hints?: string;

  @ApiProperty({
    description: 'The mood or tone of the post',
    enum: PostMood,
    default: PostMood.PROFESSIONAL,
    required: false
  })
  @IsEnum(PostMood)
  @IsOptional()
  mood?: PostMood = PostMood.PROFESSIONAL;
}