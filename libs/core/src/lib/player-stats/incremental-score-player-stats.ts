import { html } from '@game-companion/lit';
import { PlayerStats, UpdatablePlayerStats } from './player-stats.js';
import { ScorePlayerStatsData } from './score-player-stats.js';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IncrementalScorePlayerStatsData extends ScorePlayerStatsData {}

export class IncrementalScorePlayerStats
  implements PlayerStats, UpdatablePlayerStats
{
  getId() {
    return 'incremental-score';
  }

  getName() {
    return 'Incremental Score';
  }

  renderStats(stats: IncrementalScorePlayerStatsData) {
    return html`${this.getFinalScore(stats)}`;
  }

  getFinalScore(stats: IncrementalScorePlayerStatsData) {
    return stats.scoreCount ?? 0;
  }

  renderUpdateStats(stats: IncrementalScorePlayerStatsData) {
    import('@game-companion/core/incremental-score-player-stats-updater');

    return html`<gc-incremental-score-player-stats-updater
      .stats=${stats}
      .playerStats=${this}
    ></gc-incremental-score-player-stats-updater>`;
  }
}
