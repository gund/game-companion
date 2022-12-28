import type {
  PlayerStats,
  PlayerStatsData,
  UpdatablePlayerStats,
} from '@game-companion/core';
import { html } from '@game-companion/lit';
import '@game-companion/core/elements';

export interface VPsPlayerStatsData extends PlayerStatsData {
  vpsCount?: number;
}

export class VPsPlayerStats
  implements
    PlayerStats<VPsPlayerStatsData>,
    UpdatablePlayerStats<VPsPlayerStatsData>
{
  getId(): string {
    return 'vps';
  }

  getName(): string {
    return 'Victory Points';
  }

  renderStats(stats: VPsPlayerStatsData) {
    return html`${stats.vpsCount ?? 0}`;
  }

  getFinalScore(stats: VPsPlayerStatsData): number {
    return stats.vpsCount ?? 0;
  }

  renderUpdateStats(stats: VPsPlayerStatsData) {
    import('./vps-updater.element');

    return html`<tfm-vps-player-stats-updater
      .stats=${stats}
    ></tfm-vps-player-stats-updater>`;
  }
}
