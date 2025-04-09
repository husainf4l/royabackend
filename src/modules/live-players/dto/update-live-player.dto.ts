export class UpdateLivePlayerDto {
  imageUrl?: string;
  videoUrl?: string;
  isActive?: boolean;
  coordinates?: Record<string, any>; // JSON field
}
