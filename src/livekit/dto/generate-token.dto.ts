import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateTokenDto {
  @IsNotEmpty({ message: 'Room name is required' })
  @IsString({ message: 'Room name must be a string' })
  roomName: string;
}