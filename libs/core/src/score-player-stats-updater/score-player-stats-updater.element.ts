import type {
  ScorePlayerStats,
  ScorePlayerStatsData,
  ScoreRestrictionsPlayerStats,
} from '@game-companion/core';
import { UpdatePlayerStatsDataEvent } from '@game-companion/core';
import '@game-companion/core/num-input';
import { GcNumInputElement } from '@game-companion/core/num-input';
import {
  css,
  customElement,
  html,
  ifDefined,
  LitElement,
  live,
  property,
  state,
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
  @property() declare playerStats: ScorePlayerStats;

  @state() declare scoreRestrictions: ScoreRestrictionsPlayerStats;

  protected override render() {
    return html`<gc-num-input
      label=${this.playerStats.getScoreLabel(this.stats)}
      value=${live(this.playerStats.getFinalScore(this.stats))}
      min="${ifDefined(this.scoreRestrictions.min)}"
      max="${ifDefined(this.scoreRestrictions.max)}"
      @input=${this.updateScoreCount}
    >
      <slot name="hint" slot="hint"></slot>
    </gc-num-input>`;
  }

  protected override willUpdate() {
    this.scoreRestrictions = this.playerStats.getScoreRestrictions(this.stats);
  }

  protected updateScoreCount(event: Event) {
    this.dispatchEvent(
      new UpdatePlayerStatsDataEvent({
        scoreCount: parseInt((event.target as GcNumInputElement).value || '0'),
      } as ScorePlayerStatsData)
    );
  }
}
