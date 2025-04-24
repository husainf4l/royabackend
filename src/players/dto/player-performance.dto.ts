import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class PlayerPerformanceDto {
  @IsString()
  playerId: string;

  @IsString()
  matchId: string;

  @IsNumber()
  @IsOptional()
  topSpeed?: number;

  @IsNumber()
  @IsOptional()
  avgSpeed?: number;

  @IsNumber()
  @IsOptional()
  distanceKm?: number;

  @IsNumber()
  @IsOptional()
  sprintCount?: number;

  @IsNumber()
  @IsOptional()
  accelerations?: number;

  @IsNumber()
  @IsOptional()
  passesCompleted?: number;

  @IsNumber()
  @IsOptional()
  shotsOnTarget?: number;

  @IsNumber()
  @IsOptional()
  interceptions?: number;

  @IsNumber()
  @IsOptional()
  tackles?: number;

  @IsNumber()
  @IsOptional()
  heartRateAvg?: number;

  @IsNumber()
  @IsOptional()
  heartRateMax?: number;

  @IsNumber()
  @IsOptional()
  bodyTempC?: number;

  @IsNumber()
  @IsOptional()
  fatigueScore?: number;

  @IsNumber()
  @IsOptional()
  staminaScore?: number;

  @IsString()
  @IsOptional()
  heatmapUrl?: string;

  @IsObject()
  @IsOptional()
  positionLog?: Record<string, any>;
}