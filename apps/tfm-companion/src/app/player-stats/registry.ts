import type { PlayerStats } from './player-stats';
import { VPsPlayerStats } from './vps-player-stats';

export class PlayerStatsRegistry {
  private playerStats: PlayerStats[] = [new VPsPlayerStats()];

  getAvailable(): PlayerStats[] {
    return this.playerStats;
  }
}
