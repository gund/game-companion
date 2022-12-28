import type { PlayerStatsData } from '../player.model';

export interface PlayerStats<S extends PlayerStatsData = PlayerStatsData> {
  getId(): string;
  getName(): string;
  renderStats(stats: S): unknown;
  getFinalScore(stats: S): number;
}

export interface UpdatablePlayerStats<
  S extends PlayerStatsData = PlayerStatsData
> {
  renderUpdateStats(stats: S): unknown;
}

export interface ConfigurablePlayerStats {
  renderConfiguration(): unknown;
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
