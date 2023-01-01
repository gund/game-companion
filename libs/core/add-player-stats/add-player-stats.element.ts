import type {
  ConfigurablePlayerStats,
  PlayerStats,
  PlayerStatsData,
} from '@game-companion/core';
import {
  isConfigurablePlayerStats,
  PlayerStatsRegistry,
  UpdatePlayerStatsDataEvent,
} from '@game-companion/core';
import {
  customElement,
  html,
  LitElement,
  repeat,
  state,
  when,
} from '@game-companion/lit';
import '@game-companion/mdc/button';

declare global {
  interface HTMLElementTagNameMap {
    [GcAddPlayerStatsElement.selector]: GcAddPlayerStatsElement;
  }
}

@customElement(GcAddPlayerStatsElement.selector)
export class GcAddPlayerStatsElement extends LitElement {
  static readonly selector = 'gc-add-player-stats';

  @state()
  private declare selectedPlayerStats?: PlayerStats;
  @state()
  private declare selectedPlayerStatsData?: PlayerStatsData;

  private playerStatsRegistry = new PlayerStatsRegistry();

  protected override render() {
    return html`<select @change=${this.selectGlobalStats}>
        <option disabled ?selected=${!this.selectedPlayerStats}>
          -- Select stats --
        </option>
        ${repeat(
          this.playerStatsRegistry.getAvailable(),
          (ps) => ps.getId(),
          (ps) =>
            html`<option
              .value=${ps.getId()}
              ?selected=${ps === this.selectedPlayerStats}
            >
              ${ps.getName()}
            </option>`
        )}
      </select>
      ${when(
        this.selectedPlayerStats &&
          isConfigurablePlayerStats(this.selectedPlayerStats),
        () => html`<p
          @gcUpdateData=${{
            handleEvent: (e: UpdatePlayerStatsDataEvent) =>
              this.updateGlobalStatsData(e.data),
          }}
        >
          ${(
            this.selectedPlayerStats as PlayerStats & ConfigurablePlayerStats
          ).renderConfiguration()}
        </p>`
      )}
      <mdc-button
        type="button"
        ?disabled=${!this.selectedPlayerStatsData}
        @click=${this.addGlobalStats}
      >
        Add
      </mdc-button>`;
  }

  private addGlobalStats() {
    if (!this.selectedPlayerStatsData) {
      return;
    }

    this.dispatchEvent(new AddPlayerStatsEvent(this.selectedPlayerStatsData));

    this.selectedPlayerStats = undefined;
    this.selectedPlayerStatsData = undefined;
  }

  private selectGlobalStats(e: Event) {
    const selectedId = (e.target as HTMLSelectElement).value;
    this.selectedPlayerStats = this.playerStatsRegistry
      .getAvailable()
      .find((ps) => ps.getId() === selectedId);

    if (
      !this.selectedPlayerStats ||
      isConfigurablePlayerStats(this.selectedPlayerStats)
    ) {
      return this.updateGlobalStatsData();
    }

    this.updateGlobalStatsData({});
  }

  private updateGlobalStatsData(data?: unknown) {
    if (!this.selectedPlayerStats) {
      return;
    }

    this.selectedPlayerStatsData = data
      ? { ...data, id: this.selectedPlayerStats.getId() }
      : undefined;
  }
}

export class AddPlayerStatsEvent extends Event {
  static readonly eventName = 'gcAddPlayerStats';

  constructor(public data: PlayerStatsData) {
    super(AddPlayerStatsEvent.eventName, { bubbles: true, cancelable: false });
  }
}
