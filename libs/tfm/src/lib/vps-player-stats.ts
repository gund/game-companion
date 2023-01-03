import type { ScorePlayerStatsData } from '@game-companion/core';
import { ScorePlayerStats } from '@game-companion/core';

export interface VpsPlayerStatsData extends ScorePlayerStatsData {
  vpsCount?: number;
}

export class VPsPlayerStats extends ScorePlayerStats<VpsPlayerStatsData> {
  getId(): string {
    return 'vps';
  }

  getName(): string {
    return 'Victory Points';
  }

  override getFinalScore(stats: VpsPlayerStatsData): number {
    // Migrate `vpsCount` to `scoreCount` if needed
    if (stats.scoreCount === undefined) {
      stats = {
        ...stats,
        scoreCount: stats.scoreCount ?? stats.vpsCount,
      };
    }

    return super.getFinalScore(stats);
  }
}
