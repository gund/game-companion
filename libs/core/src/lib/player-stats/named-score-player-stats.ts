import {
  NamedPlayerStats,
  NamedPlayerStatsData,
} from './named-player-stats.js';
import {
  ConfigurablePlayerStats,
  NameablePlayerStats,
  PlayerStats,
  UpdatablePlayerStats,
} from './player-stats.js';
import {
  ScorePlayerStats,
  ScorePlayerStatsData,
} from './score-player-stats.js';

export interface NamedScorePlayerStatsData
  extends NamedPlayerStatsData,
    ScorePlayerStatsData {}

export class NamedScorePlayerStats
  implements
    PlayerStats,
    UpdatablePlayerStats,
    ConfigurablePlayerStats,
    NameablePlayerStats
{
  protected namedPlayerStats = new NamedPlayerStats();
  protected scorePlayerStats = new ScorePlayerStats();

  getId(): string {
    return 'named-score';
  }

  getName(): string {
    return 'Named Score';
  }

  renderStats(stats: NamedScorePlayerStatsData): unknown {
    return this.scorePlayerStats.renderStats(stats);
  }

  getFinalScore(stats: NamedScorePlayerStatsData): number {
    return this.scorePlayerStats.getFinalScore(stats);
  }

  renderUpdateStats(stats: NamedScorePlayerStatsData): unknown {
    return this.scorePlayerStats.renderUpdateStats(stats);
  }

  renderConfiguration(): unknown {
    return this.namedPlayerStats.renderConfiguration();
  }

  renderDisplayName(stats: NamedScorePlayerStatsData): unknown {
    return this.namedPlayerStats.renderDisplayName(stats);
  }
}
