import { ScorePlayerStats } from '@game-companion/core';

export class VPsPlayerStats extends ScorePlayerStats {
  getId(): string {
    return 'vps';
  }

  getName(): string {
    return 'Victory Points';
  }
}
