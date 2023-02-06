import type { PlayerStats } from './player-stats.js';

export class PlayerStatsRegistry {
  #playerStats;

  constructor(playerStats: PlayerStats[]) {
    this.#playerStats = playerStats;
  }

  getAvailable(): PlayerStats[] {
    return this.#playerStats;
  }
}
