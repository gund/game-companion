import { UpdatePlayerStatsDataEvent } from '@game-companion/core';
import { GcNumInputElement } from '@game-companion/core/elements';
import {
  customElement,
  html,
  LitElement,
  property,
  state,
} from '@game-companion/lit';
import { VPsPlayerStatsData } from './vps-player-stats';

@customElement('tfm-vps-player-stats-updater')
export class TfmVPsPlayerStatsUpdaterElement extends LitElement {
  @property() set stats(data: VPsPlayerStatsData | undefined) {
    this.vpsCount = data?.vpsCount ?? 0;
  }

  @state() declare vpsCount: number;

  protected override render() {
    return html`<gc-num-input
      .value=${this.vpsCount}
      min="0"
      @input=${this.updateVpsCount}
    ></gc-num-input>`;
  }

  private updateVpsCount(event: Event) {
    this.dispatchEvent(
      new UpdatePlayerStatsDataEvent({
        vpsCount: parseInt((event.target as GcNumInputElement).value),
      })
    );
  }
}
