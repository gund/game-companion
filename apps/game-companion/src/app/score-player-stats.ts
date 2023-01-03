import { ScorePlayerStats } from '@game-companion/core';

export class GenericScorePlayerStats extends ScorePlayerStats {
  getId(): string {
    return 'generic-score';
  }

  getName(): string {
    return 'Score';
  }
}
