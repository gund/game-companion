import { html, ifDefined } from '@game-companion/lit';
import { PlayerStatsData } from '../player.model.js';
import { PlayerStats, UpdatablePlayerStats } from './player-stats.js';

export interface ScorePlayerStatsData extends PlayerStatsData {
  scoreCount?: number;
}

export interface ScoreRestrictionsPlayerStats {
  min?: number;
  max?: number;
}

export class ScorePlayerStats implements PlayerStats, UpdatablePlayerStats {
  protected scoreRestrictions: ScoreRestrictionsPlayerStats = {};

  getId(): string {
    throw new Error('Method not implemented.');
  }

  getName(): string {
    throw new Error('Method not implemented.');
  }

  renderStats(stats: ScorePlayerStatsData): unknown {
    return html`${this.getFinalScore(stats)}`;
  }

  getFinalScore(stats: ScorePlayerStatsData): number {
    return stats.scoreCount ?? 0;
  }

  renderUpdateStats(stats: ScorePlayerStatsData, slot?: unknown): unknown {
    import('@game-companion/core/score-player-stats-updater');

    return html`<gc-score-player-stats-updater
      .stats=${stats}
      .playerStats=${this}
    >
      ${slot}
    </gc-score-player-stats-updater>`;
  }

  getScoreRestrictions(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stats: ScorePlayerStatsData
  ): ScoreRestrictionsPlayerStats {
    return this.scoreRestrictions;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getScoreLabel(stats: ScorePlayerStatsData): string {
    return 'Score';
  }
}
