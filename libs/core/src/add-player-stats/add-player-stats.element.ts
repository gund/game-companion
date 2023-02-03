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
import '@game-companion/mdc/select';

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
    return html`<mdc-select
        label="Pick player stats"
        @change=${this.selectGlobalStats}
      >
        ${repeat(
          this.playerStatsRegistry.getAvailable(),
          (ps) => ps.getId(),
          (ps) =>
            html`<mdc-select-option data-value=${ps.getId()}>
              ${ps.getName()}
            </mdc-select-option>`
        )}
      </mdc-select>
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
      )}`;
  }

  private addGlobalStats() {
    this.dispatchEvent(new AddPlayerStatsEvent(this.selectedPlayerStatsData));
  }

  private selectGlobalStats(e: Event) {
    const selectedId = (e.target as HTMLSelectElement).value;
    this.selectedPlayerStats = this.playerStatsRegistry
      .getAvailable()
      .find((ps) => ps.getId() === selectedId);
    this.selectedPlayerStatsData = undefined;

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

    this.addGlobalStats();
  }
}

export class AddPlayerStatsEvent extends Event {
  static readonly eventName = 'gcAddPlayerStats';

  constructor(public data?: PlayerStatsData) {
    super(AddPlayerStatsEvent.eventName, { bubbles: true, cancelable: false });
  }
}
