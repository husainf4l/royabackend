import { PlayerDto } from './player.dto';

export enum ReplayMomentType {
  GOAL = 'GOAL',
  TACKLE = 'TACKLE',
  SAVE = 'SAVE',
  ASSIST = 'ASSIST',
  FOUL = 'FOUL',
}

export class ReplayMomentDto {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  position: { minutes: number; seconds: number };
  involvedPlayers: PlayerDto[];
  type: ReplayMomentType;
  thumbnailUrl?: string;
  minute: number;
}
