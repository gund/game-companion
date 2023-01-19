import { html } from '@game-companion/lit';
import { PlayerStats, UpdatablePlayerStats } from './player-stats.js';
import {
  ScorePlayerStats,
  ScorePlayerStatsData,
} from './score-player-stats.js';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IncrementalScorePlayerStatsData extends ScorePlayerStatsData {}

export class IncrementalScorePlayerStats
  extends ScorePlayerStats
  implements PlayerStats, UpdatablePlayerStats
{
  override getId() {
    return 'incremental-score';
  }

  override getName() {
    return 'Incremental Score';
  }

  override renderUpdateStats(stats: IncrementalScorePlayerStatsData) {
    import('@game-companion/core/incremental-score-player-stats-updater');

    return html`<gc-incremental-score-player-stats-updater
      .stats=${stats}
      .playerStats=${this}
    ></gc-incremental-score-player-stats-updater>`;
  }
}
