import type {
  ScorePlayerStats,
  ScorePlayerStatsData,
} from '@game-companion/core';
import { UpdatePlayerStatsDataEvent } from '@game-companion/core';
import '@game-companion/core/num-input';
import { GcNumInputElement } from '@game-companion/core/num-input';
import {
  css,
  customElement,
  html,
  LitElement,
  property,
} from '@game-companion/lit';

declare global {
  interface HTMLElementTagNameMap {
    [GcScorePlayerStatsUpdaterElement.selector]: GcScorePlayerStatsUpdaterElement;
  }
}

@customElement(GcScorePlayerStatsUpdaterElement.selector)
export class GcScorePlayerStatsUpdaterElement extends LitElement {
  static readonly selector = 'gc-score-player-stats-updater';
  static override styles = [
    css`
      gc-num-input {
        width: 100%;
      }
    `,
  ];

  @property() declare stats: ScorePlayerStatsData;
  @property() declare scorePlayerStats: ScorePlayerStats;

  protected override render() {
    return html`<gc-num-input
      label=${this.scorePlayerStats.getName()}
      value=${this.stats.scoreCount ?? '0'}
      min="0"
      @input=${this.updateScoreCount}
    ></gc-num-input>`;
  }

  private updateScoreCount(event: Event) {
    this.dispatchEvent(
      new UpdatePlayerStatsDataEvent({
        scoreCount: parseInt((event.target as GcNumInputElement).value),
      })
    );
  }
}
