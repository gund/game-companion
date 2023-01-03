import { html } from '@game-companion/lit';
import { PlayerStatsData } from '../player.model.js';
import { PlayerStats, UpdatablePlayerStats } from './player-stats.js';

export interface ScorePlayerStatsData extends PlayerStatsData {
  scoreCount?: number;
}

export abstract class ScorePlayerStats<
  S extends ScorePlayerStatsData = ScorePlayerStatsData
> implements PlayerStats<S>, UpdatablePlayerStats<S>
{
  abstract getId(): string;

  abstract getName(): string;

  renderStats(stats: S): unknown {
    return html`${this.getFinalScore(stats)}`;
  }

  getFinalScore(stats: S): number {
    return stats.scoreCount ?? 0;
  }

  renderUpdateStats(stats: S) {
    import('@game-companion/core/score-player-stats-updater');

    return html`<gc-score-player-stats-updater
      .stats=${stats}
      .scorePlayerStats=${this}
    ></gc-score-player-stats-updater>`;
  }
}
