import { html } from '@game-companion/lit';
import { PlayerStatsData } from '../player.model.js';
import { PlayerStats, UpdatablePlayerStats } from './player-stats.js';

export interface ScorePlayerStatsData extends PlayerStatsData {
  scoreCount?: number;
}

export abstract class ScorePlayerStats
  implements
    PlayerStats<ScorePlayerStatsData>,
    UpdatablePlayerStats<ScorePlayerStatsData>
{
  abstract getId(): string;

  abstract getName(): string;

  renderStats(stats: ScorePlayerStatsData): unknown {
    return html`${stats.scoreCount ?? 0}`;
  }

  getFinalScore(stats: ScorePlayerStatsData): number {
    return stats.scoreCount ?? 0;
  }

  renderUpdateStats(stats: ScorePlayerStatsData) {
    import('@game-companion/core/score-player-stats-updater');

    return html`<gc-score-player-stats-updater
      .stats=${stats}
      .scorePlayerStats=${this}
    ></gc-score-player-stats-updater>`;
  }
}
