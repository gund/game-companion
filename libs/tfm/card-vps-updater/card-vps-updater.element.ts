import { UpdatePlayerStatsDataEvent } from '@game-companion/core';
import '@game-companion/core/num-input';
import { customElement, html, LitElement, property } from '@game-companion/lit';
import type { CardVPsPlayerStatsData } from '@game-companion/tfm';
import { CardVPsPlayerStats } from '@game-companion/tfm';

@customElement('tfm-card-vps-player-stats-updater')
export class TfmCardVPsPlayerStatsUpdaterElement extends LitElement {
  @property() declare data?: CardVPsPlayerStatsData;
  @property() declare playerStats?: CardVPsPlayerStats;

  protected override render() {
    return html`${this.data?.cardName}
      <gc-num-input
        .value=${this.data?.scoreCount}
        min="0"
        @input=${{
          handleEvent: (e: Event) =>
            this.updateScoreCount(
              parseInt((e.target as HTMLInputElement).value)
            ),
        }}
      ></gc-num-input>
      ${this.data && this.playerStats?.renderStats(this.data)}`;
  }

  private updateScoreCount(scoreCount: number) {
    this.dispatchEvent(new UpdatePlayerStatsDataEvent({ scoreCount }));
  }
}
