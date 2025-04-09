export class CreateLivePlayerDto {
  playerId: string;
  imageUrl?: string;
  videoUrl?: string;
  isActive?: boolean; // Default is true
  coordinates?: Record<string, any>; // JSON field
}
