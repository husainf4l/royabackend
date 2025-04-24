import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  name: string;

  @IsString()
  team: string;

  @IsNumber()
  number: number;

  @IsString()
  position: string;

  @IsString()
  nationality: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}