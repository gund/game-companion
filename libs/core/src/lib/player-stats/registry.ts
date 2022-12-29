import { queryRootElement } from '../root-element';
import type { PlayerStats } from './player-stats';

export class PlayerStatsRegistry {
  private playerStats = queryRootElement().playerStats;

  getAvailable(): PlayerStats[] {
    return this.playerStats;
  }
}
