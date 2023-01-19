import {
  IncrementalScorePlayerStats,
  IncrementalScorePlayerStatsData,
  ScoreRestrictionsPlayerStats,
  UpdatePlayerStatsDataEvent,
} from '@game-companion/core';
import '@game-companion/mdc/button';
import '@game-companion/core/num-input';
import '@game-companion/mdc/text-field';
import {
  css,
  customElement,
  html,
  ifDefined,
  LitElement,
  live,
  property,
  PropertyValueMap,
  state,
} from '@game-companion/lit';
import { GcNumInputElement } from '@game-companion/core/num-input';
import { MdcTextFieldElement } from '@game-companion/mdc/text-field';

declare global {
  interface HTMLElementTagNameMap {
    [IncrementalScorePlayerStatsUpdaterElement.selector]: IncrementalScorePlayerStatsUpdaterElement;
  }
}

@customElement(IncrementalScorePlayerStatsUpdaterElement.selector)
export class IncrementalScorePlayerStatsUpdaterElement extends LitElement {
  static readonly selector = 'gc-incremental-score-player-stats-updater';
  static override styles = [
    css`
      .block {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }

      gc-num-input,
      mdc-text-field {
        width: 100%;
      }
    `,
  ];

  @property() declare stats: IncrementalScorePlayerStatsData;
  @property() declare playerStats: IncrementalScorePlayerStats;

  @state() protected declare isEditScore: boolean;
  @state() protected declare score: number;
  @state() protected declare incrementScore: number;
  @state() declare scoreRestrictions: ScoreRestrictionsPlayerStats;

  constructor() {
    super();

    this.isEditScore = false;
    this.score = 0;
    this.incrementScore = 0;
  }

  protected override render() {
    return html`
      <div class="block">
        <mdc-text-field
          type="number"
          label=${this.playerStats.getScoreLabel(this.stats)}
          value=${live(this.score)}
          ?readonly=${!this.isEditScore}
          trailingIcon=${this.isEditScore ? 'done' : 'edit'}
          trailingIconLabel=${this.isEditScore ? 'Save' : 'Edit'}
          @input=${{
            handleEvent: (event: Event) =>
              (this.score = parseInt(
                (event.target as MdcTextFieldElement).value || '0'
              )),
          }}
          @mdcTextFieldIconClick:trailing=${this.toggleScoreEdit}
        ></mdc-text-field>
        <gc-num-input
          label="Change score by"
          value=${live(this.incrementScore)}
          ?disabled=${this.isEditScore}
          min="${ifDefined(this.scoreRestrictions.min)}"
          max="${ifDefined(this.scoreRestrictions.max)}"
          @input=${{
            handleEvent: (event: Event) =>
              (this.incrementScore = parseInt(
                (event.target as GcNumInputElement).value || '0'
              )),
          }}
        ></gc-num-input>
        <mdc-button
          type="button"
          ?disabled=${this.isEditScore}
          @click=${this.updateScore}
        >
          Update score
        </mdc-button>
      </div>
    `;
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<IncrementalScorePlayerStatsUpdaterElement>
  ) {
    if (changedProps.has('stats')) {
      this.score = this.playerStats.getFinalScore(this.stats);
    }

    this.scoreRestrictions = this.playerStats.getScoreRestrictions(this.stats);
  }

  protected toggleScoreEdit(event: Event) {
    this.isEditScore = !this.isEditScore;

    if (!this.isEditScore) {
      this.editScore();
    } else {
      (event.target as MdcTextFieldElement).focus();
    }
  }

  protected editScore() {
    this.dispatchEvent(
      new UpdatePlayerStatsDataEvent({
        scoreCount: this.score,
      } as IncrementalScorePlayerStatsData)
    );

    this.incrementScore = 0;
  }

  protected updateScore() {
    this.dispatchEvent(
      new UpdatePlayerStatsDataEvent({
        scoreCount: this.score + this.incrementScore,
      } as IncrementalScorePlayerStatsData)
    );

    this.incrementScore = 0;
  }
}
