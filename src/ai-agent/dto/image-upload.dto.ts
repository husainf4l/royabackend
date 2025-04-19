import { IsBase64, IsObject, IsString, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MatchDataDto {
  @ApiProperty({ description: 'The status of the match' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'The home team name' })
  @IsString()
  homeTeam: string;

  @ApiProperty({ description: 'The away team name' })
  @IsString()
  awayTeam: string;

  @ApiProperty({ description: 'The stadium name' })
  @IsString()
  stadium: string;
}

export class ImageUploadDto {
  @ApiProperty({ 
    description: 'The base64 encoded image data. Must be in one of the supported formats: png, jpeg, gif, webp' 
  })
  @IsString()
  @IsBase64()
  @Matches(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/, {
    message: 'Image must be a valid base64 string with mime type prefix (data:image/png;base64, data:image/jpeg;base64, etc.)'
  })
  file: string;

  @ApiProperty({ description: 'The match data object', type: MatchDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => MatchDataDto)
  matchData: MatchDataDto;
}