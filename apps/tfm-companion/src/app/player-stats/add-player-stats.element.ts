import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat, when } from '../lit-directives';
import type { PlayerStatsData } from '../player.model';
import type { PlayerStats } from './player-stats';
import {
  ConfigurablePlayerStats,
  isConfigurablePlayerStats,
  UpdatePlayerStatsDataEvent,
} from './player-stats';
import { PlayerStatsRegistry } from './registry';

declare global {
  interface HTMLElementTagNameMap {
    [AddPlayerStatsElement.selector]: AddPlayerStatsElement;
  }
}

@customElement(AddPlayerStatsElement.selector)
export class AddPlayerStatsElement extends LitElement {
  static readonly selector = 'tfm-add-player-stats';

  @state()
  private declare selectedPlayerStats?: PlayerStats;
  @state()
  private declare selectedPlayerStatsData?: PlayerStatsData;

  private playerStatsRegistry = new PlayerStatsRegistry();

  render() {
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
          @tfmUpdateData=${{
            handleEvent: (e: UpdatePlayerStatsDataEvent) =>
              this.updateGlobalStatsData(e.data),
          }}
        >
          ${(
            this.selectedPlayerStats as PlayerStats & ConfigurablePlayerStats
          ).renderConfiguration()}
        </p>`
      )}
      <button
        type="button"
        ?disabled=${!this.selectedPlayerStats}
        @click=${this.addGlobalStats}
      >
        Add
      </button>`;
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
      return;
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
  static readonly eventName = 'tfmAddPlayerStats';

  constructor(public data: PlayerStatsData) {
    super(AddPlayerStatsEvent.eventName, { bubbles: true, cancelable: false });
  }
}
