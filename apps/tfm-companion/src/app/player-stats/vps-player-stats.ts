import { html } from 'lit';
import type { PlayerStatsData } from '../player.model';
import { PlayerStats, UpdatablePlayerStats } from './player-stats';

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

  renderUpdateStats(stats: VPsPlayerStatsData) {
    return html`<p>VPsPlayerStats Update UI</p>`;
  }
}
