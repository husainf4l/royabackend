import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class SendCaptionDto {
  @IsNotEmpty({ message: 'Room name is required' })
  @IsString({ message: 'Room name must be a string' })
  roomName: string;

  @IsNotEmpty({ message: 'Caption text is required' })
  @IsString({ message: 'Caption text must be a string' })
  captionText: string;

  @IsOptional()
  @IsNumber({}, { message: 'Duration must be a number' })
  durationMs?: number;
}