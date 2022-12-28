import { CardVPsPlayerStats } from './card-vps-player-stats';
import type { PlayerStats } from './player-stats';
import { VPsPlayerStats } from './vps-player-stats';

export class PlayerStatsRegistry {
  private playerStats: PlayerStats[] = [
    new VPsPlayerStats(),
    new CardVPsPlayerStats(),
  ];

  getAvailable(): PlayerStats[] {
    return this.playerStats;
  }
}
