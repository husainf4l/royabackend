export class CreateLivePlayerDto {
  playerId: string;
  imageUrl?: string;
  videoUrl?: string;
  isActive?: boolean = true;
  coordinates?: any;
}
