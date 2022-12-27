import type { Player } from './player.model';

export interface Session {
  id: string;
  isActive: boolean;
  createdAt: Date;
  players: Player[];
}
