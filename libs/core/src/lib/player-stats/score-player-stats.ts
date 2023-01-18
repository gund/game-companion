import { html } from '@game-companion/lit';
import { PlayerStatsData } from '../player.model.js';
import { PlayerStats, UpdatablePlayerStats } from './player-stats.js';

export interface ScorePlayerStatsData extends PlayerStatsData {
  scoreCount?: number;
}

export interface ScoreRestrictionsPlayerStats {
  min?: number;
  max?: number;
}

export abstract class ScorePlayerStats
  implements PlayerStats, UpdatablePlayerStats
{
  abstract getId(): string;

  abstract getName(): string;

  protected scoreRestrictions: ScoreRestrictionsPlayerStats = {};

  renderStats(stats: ScorePlayerStatsData) {
    return html`${this.getFinalScore(stats)}`;
  }

  getFinalScore(stats: ScorePlayerStatsData) {
    return stats.scoreCount ?? 0;
  }

  renderUpdateStats(stats: ScorePlayerStatsData) {
    import('@game-companion/core/score-player-stats-updater');

    return html`<gc-score-player-stats-updater
      .stats=${stats}
      .playerStats=${this}
    ></gc-score-player-stats-updater>`;
  }

  getScoreRestrictions() {
    return this.scoreRestrictions;
  }
}
