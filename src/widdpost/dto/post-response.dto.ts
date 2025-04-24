import { ApiProperty } from '@nestjs/swagger';
import { PostMood } from './post-request.dto';

export class PostResponseDto {
  @ApiProperty({
    description: 'The generated social media post text',
    example: 'What an incredible victory for our team! Every player gave their all on the field today. #TeamSpirit #Champions'
  })
  postText: string;

  @ApiProperty({
    description: 'Suggested hashtags to accompany the post',
    example: ['#Victory', '#TeamSpirit', '#Champions'],
    type: [String]
  })
  hashtags: string[];

  @ApiProperty({
    description: 'The mood that was used to generate the post',
    enum: PostMood
  })
  mood: PostMood;

  @ApiProperty({
    description: 'The timestamp when the post was generated',
    example: '2025-04-24T14:32:17.123Z'
  })
  generatedAt: string;
}