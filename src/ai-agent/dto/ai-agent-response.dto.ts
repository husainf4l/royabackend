import { ApiProperty } from '@nestjs/swagger';

export class AIAgentResponseDto {
  @ApiProperty({ 
    description: 'The player number', 
    example: 10,
    nullable: true 
  })
  playerNumber: number | null;

  @ApiProperty({ 
    description: 'The team name', 
    example: 'Saudi Arabia',
    nullable: true 
  })
  team: string | null;
  
  @ApiProperty({
    description: 'Status of the image analysis',
    example: 'success',
    enum: ['success', 'partial', 'failed']
  })
  status: string;
  
  @ApiProperty({
    description: 'Message providing additional context about the analysis result',
    example: 'Player information successfully identified',
    nullable: true
  })
  message?: string;
}