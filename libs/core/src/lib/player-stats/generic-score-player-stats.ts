import { ScorePlayerStats } from './score-player-stats.js';

export class GenericScorePlayerStats extends ScorePlayerStats {
  getId(): string {
    return 'generic-score';
  }

  getName(): string {
    return 'Score';
  }
}
