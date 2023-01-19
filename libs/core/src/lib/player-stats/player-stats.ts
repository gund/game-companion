import type { PlayerStatsData } from '../player.model.js';

export interface PlayerStats {
  getId(): string;
  getName(): string;
  renderStats(stats: PlayerStatsData): unknown;
  getFinalScore(stats: PlayerStatsData): number;
}

export interface UpdatablePlayerStats {
  renderUpdateStats(stats: PlayerStatsData): unknown;
}

export interface ConfigurablePlayerStats {
  renderConfiguration(): unknown;
}

export interface NameablePlayerStats {
  renderDisplayName(stats: PlayerStatsData): unknown;
}

export class UpdatePlayerStatsDataEvent extends Event {
  static readonly eventName = 'gcUpdateData';

  constructor(public data?: unknown) {
    super(UpdatePlayerStatsDataEvent.eventName, {
      bubbles: true,
      cancelable: false,
    });
  }
}

export function isUpdatablePlayerStats(
  playerStats: PlayerStats
): playerStats is PlayerStats & UpdatablePlayerStats {
  return (
    typeof (playerStats as PlayerStats & UpdatablePlayerStats)
      .renderUpdateStats === 'function'
  );
}

export function isConfigurablePlayerStats(
  playerStats: PlayerStats
): playerStats is PlayerStats & ConfigurablePlayerStats {
  return (
    typeof (playerStats as PlayerStats & ConfigurablePlayerStats)
      .renderConfiguration === 'function'
  );
}

export function isNameablePlayerStats(
  playerStats: PlayerStats
): playerStats is PlayerStats & NameablePlayerStats {
  return (
    typeof (playerStats as PlayerStats & NameablePlayerStats)
      .renderDisplayName === 'function'
  );
}
