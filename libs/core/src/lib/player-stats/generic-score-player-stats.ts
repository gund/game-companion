import { ScorePlayerStats } from './score-player-stats.js';

export class GenericScorePlayerStats extends ScorePlayerStats {
  override getId(): string {
    return 'generic-score';
  }

  override getName(): string {
    return 'Score';
  }
}
