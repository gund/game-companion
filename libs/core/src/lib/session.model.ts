import type { Player } from './player.model.js';

export interface Session {
  id: string;
  isActive: boolean;
  createdAt: Date;
  players: Player[];
}
