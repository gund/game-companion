import { UpdatePlayerStatsDataEvent } from '@game-companion/core';
import '@game-companion/core/num-input';
import {
  css,
  customElement,
  html,
  LitElement,
  property,
} from '@game-companion/lit';
import type { CardVPsPlayerStatsData } from '@game-companion/tfm';
import { CardVPsPlayerStats } from '@game-companion/tfm';

@customElement('tfm-card-vps-player-stats-updater')
export class TfmCardVPsPlayerStatsUpdaterElement extends LitElement {
  static override styles = [
    css`
      gc-num-input {
        width: 100%;
      }
    `,
  ];

  @property() declare data?: CardVPsPlayerStatsData;
  @property() declare playerStats?: CardVPsPlayerStats;

  protected override render() {
    return html`<gc-num-input
      label=${this.data?.cardName}
      value=${this.data?.scoreCount}
      min="0"
      @input=${{
        handleEvent: (e: Event) =>
          this.updateScoreCount(
            parseInt((e.target as HTMLInputElement).value || '0')
          ),
      }}
    >
      <span slot="hint">
        ${this.data && this.playerStats?.renderStats(this.data)}
      </span>
    </gc-num-input>`;
  }

  private updateScoreCount(scoreCount: number) {
    this.dispatchEvent(new UpdatePlayerStatsDataEvent({ scoreCount }));
  }
}
