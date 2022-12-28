import type { PlayerStats } from '@game-companion/core';
import { CardVPsPlayerStats } from './card-vps-player-stats';
import { VPsPlayerStats } from './vps-player-stats';

export const tfmPlayerStats: PlayerStats[] = [
  new VPsPlayerStats(),
  new CardVPsPlayerStats(),
];
