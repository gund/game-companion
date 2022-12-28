import { html, LitElement } from 'lit';
import { customElement, property, state } from '../lit/decorators';
import '../num-input.element';
import { TfmNumInputElement } from '../num-input.element';
import type { PlayerStatsData } from '../player.model';
import {
  PlayerStats,
  UpdatablePlayerStats,
  UpdatePlayerStatsDataEvent,
} from './player-stats';

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
    return html`<tfm-vps-player-stats-updater
      .stats=${stats}
    ></tfm-vps-player-stats-updater>`;
  }
}

@customElement('tfm-vps-player-stats-updater')
export class TfmVPsPlayerStatsUpdaterElement extends LitElement {
  @property() set stats(data: VPsPlayerStatsData | undefined) {
    this.vpsCount = data?.vpsCount ?? 0;
  }

  @state() declare vpsCount: number;

  protected override render() {
    return html`<tfm-num-input
      .value=${this.vpsCount}
      min="0"
      @input=${this.updateVpsCount}
    ></tfm-num-input>`;
  }

  private updateVpsCount(event: Event) {
    this.dispatchEvent(
      new UpdatePlayerStatsDataEvent({
        vpsCount: parseInt((event.target as TfmNumInputElement).value),
      })
    );
  }
}
