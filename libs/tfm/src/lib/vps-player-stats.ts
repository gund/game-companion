import type { ScorePlayerStatsData } from '@game-companion/core';
import { ScorePlayerStats } from '@game-companion/core';

export interface VpsPlayerStatsData extends ScorePlayerStatsData {
  /**
   * @deprecated Use {@link VpsPlayerStatsData.scoreCount} instead.
   */
  vpsCount?: number;
}

export class VPsPlayerStats extends ScorePlayerStats {
  override getId(): string {
    return 'vps';
  }

  override getName(): string {
    return 'Victory Points';
  }

  override getScoreLabel(): string {
    return this.getName();
  }

  override getFinalScore(stats: VpsPlayerStatsData): number {
    // Migrate `vpsCount` to `scoreCount` if needed
    if (stats.scoreCount === undefined) {
      stats = {
        ...stats,
        scoreCount: stats.scoreCount ?? stats.vpsCount,
      };
      delete stats.vpsCount;
    }

    return super.getFinalScore(stats);
  }
}
