import type { PlayerStats } from '@game-companion/core';
import { CardVPsPlayerStats } from './card-vps-player-stats.js';
import { VPsPlayerStats } from './vps-player-stats.js';

export const tfmPlayerStats: PlayerStats[] = [
  new VPsPlayerStats(),
  new CardVPsPlayerStats(),
];
