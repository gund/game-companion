import { queryRootElement } from '../root-element.js';
import type { PlayerStats } from './player-stats.js';

export class PlayerStatsRegistry {
  private playerStats = queryRootElement().playerStats;

  getAvailable(): PlayerStats[] {
    return this.playerStats;
  }
}
