import {
  customElement,
  html,
  LitElement,
  property,
  PropertyValueMap,
  repeat,
  state,
  when,
} from '@game-companion/lit';
import './player-stats/add-player-stats.element';
import { AddPlayerStatsEvent } from './player-stats/add-player-stats.element';
import {
  isUpdatablePlayerStats,
  UpdatePlayerStatsDataEvent,
} from './player-stats/player-stats';
import { PlayerStatsRegistry } from './player-stats/registry';
import type { Player, PlayerStatsData } from './player.model';
import type { Session } from './session.model';
import { SessionsService } from './sessions.service';

declare global {
  interface HTMLElementTagNameMap {
    [TfmPlayerElement.selector]: TfmPlayerElement;
  }
}

@customElement(TfmPlayerElement.selector)
export class TfmPlayerElement extends LitElement {
  static readonly selector = 'tfm-player';

  @property() declare sId: string;
  @property() declare pId: string;

  @state() private declare session?: Session;
  @state() private declare player?: Player;
  @state() private declare isLoading: boolean;
  @state() private declare showAddStats: boolean;

  private sessionsService = new SessionsService();
  private playerStatsRegistry = new PlayerStatsRegistry();

  constructor() {
    super();

    this.isLoading = false;
    this.showAddStats = false;
  }

  protected override render() {
    return html`${when(
        this.player,
        () => this.renderPlayer(this.player!),
        () => this.renderFallback()
      )}<a href="/session/${this.sId}">Back to session</a>`;
  }

  private renderPlayer(player: Player) {
    return html`<h1>Player ${player.name}</h1>
      ${when(
        player.stats.length,
        () => html`<table>
          ${repeat(
            player.stats,
            (ps) => ps.id,
            (ps) => html`<tr>
              <td>${this.getPlayerStatsName(ps.id)}</td>
              <td
                @tfmUpdateData=${{
                  handleEvent: (e: UpdatePlayerStatsDataEvent) =>
                    this.updatePlayerStats(ps, e.data as object),
                }}
              >
                ${this.renderPlayerStats(ps)}
              </td>
              <td>
                <button
                  type="button"
                  @click=${{ handleEvent: () => this.removePlayerStats(ps) }}
                >
                  Remove
                </button>
              </td>
            </tr>`
          )}
        </table>`
      )}
      <p>
        <button
          type="button"
          @click=${{
            handleEvent: () => (this.showAddStats = !this.showAddStats),
          }}
        >
          Add new stats
        </button>
        ${when(
          this.showAddStats,
          () =>
            html`<p>
              <tfm-add-player-stats
                @tfmAddPlayerStats=${this.addPlayerStats}
              ></tfm-add-player-stats>
            </p>`
        )}
      </p>`;
  }

  private renderPlayerStats(data: PlayerStatsData) {
    const playerStats = this.getPlayerStats(data.id);

    if (!playerStats) {
      return;
    }

    if (isUpdatablePlayerStats(playerStats)) {
      return playerStats.renderUpdateStats(data);
    } else {
      return playerStats.renderStats(data);
    }
  }

  private renderFallback() {
    return html`${when(
      this.isLoading,
      () => html`Loading Player...`,
      () => html`Invalid Player!`
    )}`;
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<TfmPlayerElement>
  ) {
    if (changedProps.has('sId')) {
      this.loadSession();
    }
    if (changedProps.has('pId')) {
      this.updatePlayer();
    }
  }

  private async loadSession() {
    this.session = undefined;

    if (!this.sId) {
      return;
    }

    try {
      this.isLoading = true;
      this.session = await this.sessionsService.getById(this.sId);
      this.updatePlayer();
    } finally {
      this.isLoading = false;
    }
  }

  private updatePlayer() {
    this.player = this.session?.players.find((p) => p.id === this.pId);
  }

  private getPlayerStats(id: string) {
    return this.playerStatsRegistry
      .getAvailable()
      .find((ps) => ps.getId() === id);
  }

  private getPlayerStatsName(id: string) {
    return this.getPlayerStats(id)?.getName() ?? `Unknown(${id})`;
  }

  private async updatePlayerStats(playerStats: PlayerStatsData, data?: object) {
    if (!this.player) {
      return;
    }

    this.player.stats = this.player.stats.map((ps) =>
      ps === playerStats ? { ...ps, ...data } : ps
    );
    this.requestUpdate();

    await this.sessionsService.updatePlayer(this.sId, this.player);
  }

  private async addPlayerStats(event: AddPlayerStatsEvent) {
    if (!this.player) {
      return;
    }

    this.player.stats = [...this.player.stats, event.data];
    this.showAddStats = false;
    this.requestUpdate();

    await this.sessionsService.updatePlayer(this.sId, this.player);
  }

  private async removePlayerStats(data: PlayerStatsData) {
    if (!this.player) {
      return;
    }

    this.player.stats = this.player.stats.filter((ps) => ps !== data);
    this.requestUpdate();

    await this.sessionsService.updatePlayer(this.sId, this.player);
  }
}
